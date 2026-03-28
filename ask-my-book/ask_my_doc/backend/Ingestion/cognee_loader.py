"""
ingestion/cognee_loader.py
──────────────────────────
Charge les fichiers de cours dans Cognee (knowledge graph + vector store).
Appeler load_courses() une fois au démarrage ou après ajout de fichiers.
"""

import os
import asyncio
import cognee
from cognee import SearchType
from pathlib import Path


COURSES_DIR = Path(__file__).parent.parent / "courses"


async def _ingest(file_path: Path) -> None:
    await cognee.add(str(file_path), dataset_name="course_content")
    await cognee.cognify()


async def load_courses() -> dict:
    """
    Parcourt le dossier /courses et ingère tous les fichiers .txt / .pdf.
    Retourne un rapport {fichier: statut}.
    """
    if not COURSES_DIR.exists():
        COURSES_DIR.mkdir(parents=True)

    report = {}
    files  = list(COURSES_DIR.glob("*.txt")) + list(COURSES_DIR.glob("*.pdf"))

    if not files:
        return {"status": "no_files", "message": "Aucun fichier trouvé dans /courses"}

    for fp in files:
        try:
            await _ingest(fp)
            report[fp.name] = "✅ ingéré"
        except Exception as e:
            report[fp.name] = f"❌ erreur: {e}"

    return report


async def search_course(query: str, top_k: int = 5) -> str:
    """
    Recherche dans le knowledge graph Cognee.
    Retourne un contexte textuel agrégé.
    """
    results = await cognee.search(
        query_text=query,
        query_type=SearchType.CHUNKS,
    )
    if not results:
        return ""

    passages = []
    for r in results[:top_k]:
        if isinstance(r, dict):
            text = r.get("text") or r.get("content") or str(r)
        else:
            text = str(r)
        passages.append(text.strip())
    return "\n\n".join(passages)



async def run_load_courses():
    return await load_courses()

def run_search_course(query: str) -> str:
    """Raises exceptions so callers can decide to fallback."""
    return asyncio.run(search_course(query))