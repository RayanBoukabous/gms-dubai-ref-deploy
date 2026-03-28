"""
utils/token_tracker.py
───────────────────────
Calcule les tokens avec tiktoken et le coût estimé.
"""

import tiktoken
from config import LLM_MODEL, get_token_price, TOKEN_LOG_FILE
import json
import os
from datetime import datetime


def get_encoder(model: str = LLM_MODEL):
    try:
        return tiktoken.encoding_for_model(model)
    except KeyError:
        return tiktoken.get_encoding("cl100k_base")  


def count_tokens(text: str, model: str = LLM_MODEL) -> int:
    encoder = get_encoder(model)
    return len(encoder.encode(text))


def compute_cost(input_tokens: int, output_tokens: int, model: str = LLM_MODEL) -> dict:
    prices = get_token_price(model)
    input_cost  = (input_tokens  / 1000000) * prices["input"]
    output_cost = (output_tokens / 1000000) * prices["output"]
    return {
        "input_tokens" : input_tokens,
        "output_tokens": output_tokens,
        "total_tokens" : input_tokens + output_tokens,
        "input_cost"   : input_cost,
        "output_cost"  : output_cost,
        "total_cost"   : input_cost + output_cost,
        "model"        : model,
    }


def track_usage(input_text: str, output_text: str, model: str = LLM_MODEL) -> dict:
    """
    Calcule les tokens et le coût à partir des textes bruts.
    input_text  : le prompt complet envoyé (system + contexte + query)
    output_text : la réponse complète du LLM
    """
    input_tokens  = count_tokens(input_text, model)
    output_tokens = count_tokens(output_text, model)
    return compute_cost(input_tokens, output_tokens, model)

def save_session_usage(usage: dict, session_id: str = "default") -> None:
    """Sauvegarde l'usage tokens d'une requête dans le fichier JSON."""
    records = []
    if os.path.exists(TOKEN_LOG_FILE):
        with open(TOKEN_LOG_FILE, "r") as f:
            records = json.load(f)

    records.append({
        "session_id"   : session_id,
        "timestamp"    : datetime.now().isoformat(),
        **usage
    })

    with open(TOKEN_LOG_FILE, "w") as f:
        json.dump(records, f, indent=2)