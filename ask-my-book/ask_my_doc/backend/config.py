import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
LLM_MODEL      = os.getenv("LLM_MODEL", "gpt-4o")

LANGUAGE_INSTRUCTION = "Always respond in English, regardless of the language of the question or the course document."

TOKEN_LOG_FILE = "token_sessions.json"
TOKEN_PRICES = {
    "gpt-4o-mini": {"input": 0.15, "output": 0.60}
}

def get_token_price(model: str) -> dict:
    return TOKEN_PRICES.get(model, {"input": 0.0, "output": 0.0})


# ── PostgreSQL ────────────────────────────────────────────────────────────────
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    ""   
)
 
# ── JWT ───────────────────────────────────────────────────────────────────────
JWT_SECRET    = os.getenv("JWT_SECRET", "")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24 * 7