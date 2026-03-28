"""
graph/workflow.py
──────────────────
LangGraph : orchestre les 3 agents via un graphe d'états.

Flux :
  START
    │
    ▼
  [manager_node]  ──→ détermine la route (utilise document_summary)
    │
    ├─ "course_question"  ──→ [course_node]
    └─ "off_topic"        ──→ [offtopic_node]
                                   │
                                   ▼
                                  END
"""

from typing import TypedDict, Literal
from langgraph.graph import StateGraph, START, END

from Agents.manager_agent  import route_query
from Agents.course_agent   import answer_course_question
from Agents.offtopic_agent import handle_off_topic


class ChatState(TypedDict):
    query           : str
    route           : str
    reasoning       : str
    response        : str
    history         : list[dict]
    document_summary: str          


def manager_node(state: ChatState) -> ChatState:
    """Analyse la requête et détermine la route en utilisant le résumé."""
    decision = route_query(
        query=state["query"],
        document_summary=state.get("document_summary", ""),
        history=state.get("history", []),
    )
    return {
        **state,
        "route"    : decision.route,
        "reasoning": decision.reasoning,
    }


def course_node(state: ChatState) -> ChatState:
    """Répond aux questions sur le cours via Cognee."""
    response, usage = answer_course_question(
        query=state["query"],
        document_summary=state.get("document_summary", ""),
        history=state.get("history", []),
    )
    return {**state, "response": response}


def offtopic_node(state: ChatState) -> ChatState:
    """Gère les questions hors-sujet."""
    response, usage = handle_off_topic(
        query=state["query"],
        document_summary=state.get("document_summary", ""),
        history=state.get("history", []),
    )
    return {**state, "response": response}


def router(state: ChatState) -> Literal["course_node", "offtopic_node"]:
    route = state.get("route", "off_topic")
    mapping = {
        "course_question": "course_node",
        "off_topic"      : "offtopic_node",
    }
    return mapping.get(route, "offtopic_node")


def build_workflow() -> StateGraph:
    graph = StateGraph(ChatState)

    graph.add_node("manager_node",  manager_node)
    graph.add_node("course_node",   course_node)
    graph.add_node("offtopic_node", offtopic_node)

    graph.add_edge(START, "manager_node")
    graph.add_conditional_edges("manager_node", router)
    graph.add_edge("course_node",   END)
    graph.add_edge("offtopic_node", END)

    return graph.compile()


_workflow = None

def get_workflow():
    global _workflow
    if _workflow is None:
        _workflow = build_workflow()
    return _workflow


def process_query(
    query: str,
    document_summary: str = "",
    history: list[dict] = [],
) -> dict:
    """
    Point d'entrée principal.
    Retourne un dict avec 'response', 'route', 'reasoning'.
    """
    wf = get_workflow()
    initial_state: ChatState = {
        "query"           : query,
        "route"           : "",
        "reasoning"       : "",
        "response"        : "",
        "history"         : history,
        "document_summary": document_summary,
    }
    final_state = wf.invoke(initial_state)
    return {
        "response" : final_state["response"],
        "route"    : final_state["route"],
        "reasoning": final_state["reasoning"],
    }