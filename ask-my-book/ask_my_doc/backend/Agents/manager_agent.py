"""
agents/manager_agent.py
────────────────────────
Route les questions vers le bon agent en s'appuyant
UNIQUEMENT sur le RÉSUMÉ du document pour la décision.

Routes possibles :
  - "on_topic"  → course_agent  (répond via Cognee + texte brut)
  - "off_topic" → offtopic_agent
"""

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from config import LLM_MODEL, OPENAI_API_KEY, LANGUAGE_INSTRUCTION


class RouteDecision(BaseModel):
    route: str = Field(
        description="Route choisie : 'on_topic' ou 'off_topic'"
    )
    reasoning: str = Field(
        description="Courte explication du choix (1-2 phrases)"
    )


_llm = ChatOpenAI(
    model=LLM_MODEL,
    api_key=OPENAI_API_KEY,
    temperature=0,
).with_structured_output(RouteDecision)


def _format_history(history: list[dict]) -> str:
    if not history:
        return ""
    lines = []
    for msg in history[-6:]:
        role = "User" if msg["role"] == "user" else "Assistant"
        content = msg["content"].replace("{", "{{").replace("}", "}}")
        lines.append(f"{role}: {content}")
    return "\n".join(lines)


def _build_system(document_summary: str, history: list[dict]) -> str:
    hist_text = _format_history(history)
    hist_section = (
        f"\n\nRecent conversation (for context):\n{hist_text}"
        if hist_text else ""
    )
    return f"""You are a routing agent for an educational chatbot.

You have access to a structured summary of the document uploaded by the user.
Your ONLY job is to decide if the user's question is related to the document or not.

Document summary:
─────────────────────────────────────────
{document_summary}
─────────────────────────────────────────

Rules:
- Route to **on_topic**  → if the question relates to any concept, theme, or topic covered in the document
- Route to **off_topic** → if the question has NO relation to the document content
- When in doubt, prefer **on_topic**
- Greetings and meta-questions ("what can you do?") → **on_topic**
{hist_section}"""


def route_query(
    query: str,
    document_summary: str,
    history: list[dict] = [],
) -> RouteDecision:
    """
    Analyse la question et retourne une RouteDecision (on_topic / off_topic).
    Se base uniquement sur le résumé — Cognee n'est pas appelé ici.
    """
    system = _build_system(document_summary, history)

    prompt = ChatPromptTemplate.from_messages([
        ("system", system),
        ("human", "User question: {query}"),
    ])

    decision = (prompt | _llm).invoke({"query": query})
    return decision