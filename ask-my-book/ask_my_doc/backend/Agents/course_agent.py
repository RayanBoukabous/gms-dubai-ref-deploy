"""
agents/course_agent.py
───────────────────────
Répond aux questions relatives au document.

Stratégie de contexte :
  1. Recherche Cognee (knowledge graph + vector) → passages les plus pertinents
  2. Si Cognee ne retourne rien → fallback sur le texte brut du document
"""

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from config import LLM_MODEL, OPENAI_API_KEY, LANGUAGE_INSTRUCTION
from Tools.cognee_tools import search_course_content
from Utils.token_tracker import track_usage
from Agents.summarizer_agent import _extract_chunk_text


_llm = ChatOpenAI(
    model=LLM_MODEL,
    api_key=OPENAI_API_KEY,
    temperature=0.2,
)


def _format_history(history: list[dict]) -> str:
    if not history:
        return ""
    lines = []
    for msg in history[-6:]:
        role = "Student" if msg["role"] == "user" else "Assistant"
        content = msg["content"].replace("{", "{{").replace("}", "}}")
        lines.append(f"{role}: {content}")
    return "\n".join(lines)


def _get_context(query: str, document_text: str) -> tuple[str, str]:
    """Sync. Tries cognee first, falls back to raw document text."""
    try:
        cognee_result = search_course_content.invoke(query)  # sync ✓
        if cognee_result and "Aucune information" not in cognee_result:
            return cognee_result, "cognee"
    except Exception:
        pass
    fallback = document_text[:12000] if len(document_text) > 12000 else document_text
    return fallback, "document"


def _build_system(context: str, history: list[dict]) -> str:
    safe_context = context.replace("{", "{{").replace("}", "}}")

    hist_text = _format_history(history)
    hist_section = (
        f"\n\nConversation history:\n{hist_text}"
        if hist_text else ""
    )
    return f"""You are an expert educational assistant.
You answer questions based EXCLUSIVELY on the course content provided below.

Rules:
- Be pedagogical, clear, and well-structured
- Use simple examples to illustrate when helpful
- If the answer is not in the context, say so clearly
- Highlight formulas or key definitions in markdown
- Do NOT invent information not present in the context

Course content:
─────────────────────────────────────────
{safe_context}
─────────────────────────────────────────
{hist_section}
{LANGUAGE_INSTRUCTION}"""


def _build_messages(system: str, query: str) -> list:
    """Build LangChain messages, keeping {query} as the only live placeholder."""
    return ChatPromptTemplate.from_messages([
        ("system", system),
        ("human", "{query}"),
    ]).format_messages(query=query)


def answer_course_question(
    query: str,
    document_text: str = "",
    history: list[dict] = [],
) -> tuple[str, dict]:
    context, _source = _get_context(query, document_text)
    print('the source is : ',_source)
    system           = _build_system(context, history)
    input_text       = system + "\n\n" + query

    prompt_val = _build_messages(system, query)

    response = _llm.invoke(prompt_val)
    text     = _extract_chunk_text(response)
    usage    = track_usage(input_text, text)
    return text, usage


def stream_course_question(
    query: str,
    document_text: str = "",
    history: list[dict] = [],
):
    """
    Version streaming. Yields chunks de texte,
    puis ("__USAGE__", usage_dict) en dernier.
    """
    context, _source = _get_context(query, document_text)
    print('CONTEXTTT : ',context)
    print('the source iiisss : ',_source)
    system           = _build_system(context, history)
    input_text       = system + "\n\n" + query

    prompt_val = _build_messages(system, query)

    full_response = ""
    try:
        for chunk in _llm.stream(prompt_val):
            piece = _extract_chunk_text(chunk)
            full_response += piece
            if piece:
                yield piece
    except Exception as e:
        err = f"\n\n**Error:** {e}"
        full_response += err
        yield err
        yield ("__USAGE__", track_usage(input_text, full_response))
        return

    usage = track_usage(input_text, full_response)
    yield ("__USAGE__", usage)