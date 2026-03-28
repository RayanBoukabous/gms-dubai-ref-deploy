FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt extract_cognee_deps.py ./

# ── Step 1: install fastapi-users first (it pins python-multipart==0.0.21)
RUN pip install --no-cache-dir "fastapi-users[sqlalchemy]>=15.0.2"

# ── Step 2: force-upgrade python-multipart to >=0.0.22 (cognee requirement)
#    pip allows this in a separate command; at runtime both 0.0.21 and 0.0.22
#    are API-compatible so fastapi-users keeps working fine.
RUN pip install --no-cache-dir "python-multipart>=0.0.22" --force-reinstall

# ── Step 3: install app requirements (excluding cognee & python-multipart,
#    already handled above)
RUN grep -v '^cognee' requirements.txt \
    | grep -v 'python-multipart' > /tmp/app_reqs.txt && \
    pip install --no-cache-dir -r /tmp/app_reqs.txt

# ── Step 4: download cognee wheel, extract and install its runtime deps
#    (fastapi-users already installed above, so it's excluded from this step)
RUN pip install --no-cache-dir wheel && \
    pip download "cognee==0.5.3" -d /tmp/cognee_dl --no-deps && \
    python3 extract_cognee_deps.py && \
    pip install --no-cache-dir -r /tmp/cognee_runtime_deps.txt || true

# ── Step 5: install cognee itself (skip dep resolver to avoid the conflict)
RUN pip install --no-cache-dir --no-deps "cognee==0.5.3"

COPY . .

RUN mkdir -p /app/cognee_data /app/cognee_system /app/courses

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
