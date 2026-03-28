"""
agents/summarizer_agent.py
───────────────────────────
Appelé UNE SEULE FOIS après l'upload du document.
Génère un résumé structuré qui sera stocké en session et réutilisé
par le manager pour le routing.
"""

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from config import LLM_MODEL, OPENAI_API_KEY
from Utils.token_tracker import track_usage


def _extract_chunk_text(chunk) -> str:
    """
    LangChain 1.x AIMessageChunk may expose .content as str, None, or a list
    of blocks — normalize to a plain string to avoid TypeError in streaming.
    """
    c = getattr(chunk, "content", None)
    if c is None:
        return ""
    if isinstance(c, str):
        return c
    if isinstance(c, list):
        parts: list[str] = []
        for block in c:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict):
                t = block.get("text") or block.get("content")
                if t is not None:
                    parts.append(str(t))
            else:
                parts.append(str(block))
        return "".join(parts)
    return str(c)


_llm = ChatOpenAI(
    model=LLM_MODEL,
    api_key=OPENAI_API_KEY,
    temperature=0.2,
)

_SYSTEM = """You are an expert document analyst.
Your task is to read the provided document and produce a structured summary that will be used
by a routing agent to determine whether user questions are on-topic or off-topic.

Your summary must include:
1. **Main subject** : the overall topic of the document in one sentence
2. **Key themes** : a bullet list of the main concepts / chapters covered
3. **Keywords** : 10-20 important terms from the document
4. **Scope** : what questions CAN be answered from this document (be specific)
5. **Out of scope** : what topics are clearly NOT covered

Be concise and factual. Do not invent anything beyond what is in the document.
Respond in English regardless of the document language."""

_HUMAN = """Here is the document content:

{document_text}

Please produce the structured summary as described."""


def generate_document_summary(document_text: str) -> tuple[str, dict]:
    """
    Génère un résumé structuré du document.
    Retourne (summary_text, usage_dict).
    """
    # Limite le texte pour ne pas exploser la fenêtre de contexte
    truncated = document_text[:14000] if len(document_text) > 14000 else document_text

    prompt_val = ChatPromptTemplate.from_messages([
        ("system", _SYSTEM),
        ("human", _HUMAN),
    ]).format_messages(document_text=truncated)

    response = _llm.invoke(prompt_val)
    text     = _extract_chunk_text(response)
    usage    = track_usage(_SYSTEM + truncated, text)
    return text, usage


def stream_document_summary(document_text: str):
    """
    Version streaming du résumé (pour affichage en temps réel dans Streamlit).
    Yields chunks de texte, puis ("__USAGE__", usage_dict) en dernier.
    """
    truncated = document_text[:14000] if len(document_text) > 14000 else document_text

    prompt_val = ChatPromptTemplate.from_messages([
        ("system", _SYSTEM),
        ("human", _HUMAN),
    ]).format_messages(document_text=truncated)

    full_response = ""
    try:
        for chunk in _llm.stream(prompt_val):
            piece = _extract_chunk_text(chunk)
            full_response += piece
            if piece:
                yield piece
    except Exception as e:
        err = f"\n\n**Summary error:** {e}"
        full_response += err
        yield err
        yield ("__USAGE__", track_usage(_SYSTEM + truncated, full_response))
        return

    usage = track_usage(_SYSTEM + truncated, full_response)
    yield ("__USAGE__", usage)