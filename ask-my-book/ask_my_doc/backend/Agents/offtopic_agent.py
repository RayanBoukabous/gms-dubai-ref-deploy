"""
agents/offtopic_agent.py
─────────────────────────
Décline poliment les questions hors sujet.
Utilise le résumé du document pour personnaliser le message.
"""

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from config import LLM_MODEL, OPENAI_API_KEY, LANGUAGE_INSTRUCTION
from Utils.token_tracker import track_usage
from Agents.summarizer_agent import _extract_chunk_text


_llm = ChatOpenAI(
    model=LLM_MODEL,
    api_key=OPENAI_API_KEY,
    temperature=0.3,
)


def _format_history(history: list[dict]) -> str:
    if not history:
        return ""
    lines = []
    for msg in history[-4:]:
        role = "Student" if msg["role"] == "user" else "Assistant"
        content = msg["content"].replace("{", "{{").replace("}", "}}")
        lines.append(f"{role}: {content}")
    return "\n".join(lines)


def _build_system(document_summary: str, history: list[dict]) -> str:
    hist_text = _format_history(history)
    hist_section = (
        f"\n\nConversation history:\n{hist_text}"
        if hist_text else ""
    )
    
    first_line = document_summary.split("\n")[0] if document_summary else "the uploaded document"

    return f"""You are a friendly educational assistant specialized in the uploaded document.

The student has asked a question that is NOT related to the document content.
Your role is to:
1. Politely and warmly decline the question
2. Remind the student what topics you can help with (based on the document subject below)
3. Encourage them to ask a question related to the document

Document subject: {first_line}
{hist_section}
{LANGUAGE_INSTRUCTION}"""


def handle_off_topic(
    query: str,
    document_summary: str = "",
    history: list[dict] = [],
) -> tuple[str, dict]:
    system     = _build_system(document_summary, history)
    input_text = system + "\n\n" + query

    prompt_val = ChatPromptTemplate.from_messages([
        ("system", system),
        ("human", "Off-topic question received: {query}"),
    ]).format_messages(query=query)

    response = _llm.invoke(prompt_val)
    text     = _extract_chunk_text(response)
    usage    = track_usage(input_text, text)
    return text, usage


def stream_off_topic(
    query: str,
    document_summary: str = "",
    history: list[dict] = [],
):
    """
    Version streaming. Yields chunks de texte,
    puis ("__USAGE__", usage_dict) en dernier.
    """
    system     = _build_system(document_summary, history)
    input_text = system + "\n\n" + query

    prompt_val = ChatPromptTemplate.from_messages([
        ("system", system),
        ("human", "Off-topic question received: {query}"),
    ]).format_messages(query=query)

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