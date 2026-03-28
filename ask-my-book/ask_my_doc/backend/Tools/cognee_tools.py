"""
tools/cognee_tools.py
─────────────────────
LangChain Tool wrappant la recherche Cognee.
"""

from langchain.tools import tool
from Ingestion.cognee_loader import run_search_course  

@tool
def search_course_content(query: str) -> str:  
    """Recherche des informations dans le contenu du cours chargé."""
    result = run_search_course(query)
    if not result:
        return "Aucune information trouvée dans le cours pour cette requête."
    return result