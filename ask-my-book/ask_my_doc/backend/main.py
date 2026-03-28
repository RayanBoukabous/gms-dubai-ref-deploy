"""
backend/main.py
────────────────
FastAPI — remplace app.py Streamlit.
Expose les endpoints appelés par le frontend Next.js.

Endpoints publics :
  POST /api/auth/register
  POST /api/auth/login
  GET  /api/auth/me

Endpoints protégés (JWT requis) :
  POST /api/upload
  POST /api/summarize
  POST /api/chat
  POST /api/cognee/load
  GET  /api/health
"""

import asyncio
import os
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import cognee
from config import OPENAI_API_KEY, LLM_MODEL
import io
import json

from DataBase.database import init_db
from auth_router import router as auth_router, get_current_user

app = FastAPI(title="EduBot API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "http://localhost:3100",
        "http://127.0.0.1:3100",
        "http://localhost:3101",
        "http://127.0.0.1:3101",
        "http://askbook-frontend:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

class SummarizeRequest(BaseModel):
    document_text: str

class ChatRequest(BaseModel):
    query:            str
    document_text:    str = ""
    document_summary: str = ""
    history:          list[dict] = []


# Startup 
@app.on_event("startup")
async def startup():
    init_db()

    # Init Cognee
    cognee.config.set_llm_api_key(OPENAI_API_KEY)
    cognee.config.set_llm_model(LLM_MODEL)
    cognee.config.set_llm_provider("openai")
    cognee.config.data_root_directory(os.getenv("COGNEE_DATA_DIR", "/app/cognee_data"))
    cognee.config.system_root_directory(os.getenv("COGNEE_SYSTEM_DIR", "/app/cognee_system"))


# ── Protected endpoints ───────────────────────────────────────────────────────
# All routes below require a valid JWT via "Authorization: Bearer <token>"

@app.post("/api/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),  
):
    filename = file.filename or ""
    content  = await file.read()

    from Ingestion.cognee_loader import COURSES_DIR, _ingest
    COURSES_DIR.mkdir(parents=True, exist_ok=True)
    file_path = COURSES_DIR / filename
    file_path.write_bytes(content)

    async def _run_ingest():
        try:
            await _ingest(file_path)
        except Exception as e:
            print(f"[Cognee ingest warning] {e}")

    asyncio.create_task(_run_ingest())

    try:
        if filename.lower().endswith(".pdf"):
            import PyPDF2
            reader   = PyPDF2.PdfReader(io.BytesIO(content))
            pages    = [p.extract_text() for p in reader.pages if p.extract_text()]
            raw_text = "\n\n".join(pages)
        else:
            raw_text = content.decode("utf-8", errors="ignore")

        return {
            "filename":      filename,
            "document_text": raw_text,
            "char_count":    len(raw_text),
        }
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Lecture impossible : {e}")


@app.post("/api/summarize")
async def summarize_document(
    req: SummarizeRequest,
    current_user: dict = Depends(get_current_user),   
):
    if not OPENAI_API_KEY or not OPENAI_API_KEY.strip():
        raise HTTPException(
            status_code=503,
            detail="OpenAI API key is not configured (OPENAI_API_KEY).",
        )

    from Agents.summarizer_agent import stream_document_summary

    async def generate():
        for chunk in stream_document_summary(req.document_text or ""):
            if isinstance(chunk, tuple) and chunk[0] == "__USAGE__":
                yield f"data: __DONE__:{json.dumps(chunk[1])}\n\n"
            else:
                safe = str(chunk).replace("\n", "\\n")
                yield f"data: {safe}\n\n"
            await asyncio.sleep(0)

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/api/chat")
async def chat(
    req: ChatRequest,
    current_user: dict = Depends(get_current_user),   
):
    from Agents.manager_agent  import route_query
    from Agents.course_agent   import stream_course_question
    from Agents.offtopic_agent import stream_off_topic

    decision = await asyncio.to_thread(
        route_query,
        req.query,
        req.document_summary,
        req.history,
    )
    route = decision.route

    if route == "on_topic":
        def get_stream():
            return stream_course_question(
                query         = req.query,
                document_text = req.document_text,
                history       = req.history,
            )
    else:
        def get_stream():
            return stream_off_topic(
                query            = req.query,
                document_summary = req.document_summary,
                history          = req.history,
            )

    async def generate():
        # Stream tokens as they arrive — do NOT buffer the full generator (fixes live chat UI).
        yield f"data: __ROUTE__:{route}\n\n"
        sync_gen = get_stream()
        for chunk in sync_gen:
            if isinstance(chunk, tuple) and chunk[0] == "__USAGE__":
                yield f"data: __DONE__:{json.dumps(chunk[1])}\n\n"
            else:
                safe = str(chunk).replace("\n", "\\n")
                yield f"data: {safe}\n\n"
            await asyncio.sleep(0)

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/api/cognee/load")
async def cognee_load(
    current_user: dict = Depends(get_current_user),   
):
    from Ingestion.cognee_loader import run_load_courses
    report = await run_load_courses()
    return {"report": report}


@app.get("/api/health")
async def health():
    return {"status": "ok"}