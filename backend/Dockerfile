FROM python:3.12-slim
# AJN PDF R16 - production Calibre + headless Qt runtime
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends calibre \
    && command -v ebook-convert \
    && ebook-convert --version \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HOME=/home/ajn \
    TMPDIR=/tmp \
    SAL_USE_VCLPLUGIN=svp \
    AJN_ANALYTICS_DB=/tmp/ajn_analytics.sqlite3 \
    AJN_PUBLIC_MEDIA_DB=/tmp/ajn_public_media.sqlite3 \
    AJN_PUBLIC_MEDIA_ROOT=/tmp/public_media \
    AJN_PUBLIC_API_ENABLED=false \
    AJN_PUBLIC_API_RATE_PER_MINUTE=30 \
    XDG_RUNTIME_DIR=/tmp/runtime-ajn \
    QT_QPA_PLATFORM=offscreen \
    QT_QUICK_BACKEND=software \
    QTWEBENGINE_CHROMIUM_FLAGS="--disable-gpu --disable-dev-shm-usage" \
    DEBIAN_FRONTEND=noninteractive

# Native engines for server-assisted workflows. XPS is handled internally by
# PyMuPDF and does not require Ghostscript/mutool.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-writer libreoffice-calc libreoffice-impress \
    tesseract-ocr tesseract-ocr-eng tesseract-ocr-hin tesseract-ocr-tel \
    tesseract-ocr-tam tesseract-ocr-kan tesseract-ocr-mal tesseract-ocr-osd \
    calibre imagemagick poppler-utils \
    libcairo2 libpango-1.0-0 libpangocairo-1.0-0 \
    fonts-dejavu-core fonts-liberation fonts-noto-core \
    ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

RUN python -c "import fitz,pikepdf,pytesseract,docx,openpyxl,PIL,reportlab,ebooklib,cairosvg" \
    && libreoffice --headless --version \
    && tesseract --version \
    && ebook-convert --version \
    && pdftoppm -v

COPY app ./app
COPY smoke_test.py capability_audit.py conversion_contract_audit.py full_acceptance_test.py processing_quality_acceptance_test.py image_pdf_quality_acceptance_test.py hard_format_acceptance_test.py ocr_language_gate.py ocr_multilingual_acceptance_test.py api_v1_contract_test.py ocr_deep_acceptance_test.py ocr_selected_acceptance_test.py e_signature_acceptance_test.py ./
RUN python -m compileall -q app \
    && python -m py_compile capability_audit.py conversion_contract_audit.py full_acceptance_test.py processing_quality_acceptance_test.py image_pdf_quality_acceptance_test.py hard_format_acceptance_test.py ocr_language_gate.py ocr_multilingual_acceptance_test.py api_v1_contract_test.py ocr_deep_acceptance_test.py ocr_selected_acceptance_test.py e_signature_acceptance_test.py

RUN useradd --uid 10001 --user-group --create-home --home-dir /home/ajn --shell /usr/sbin/nologin ajn \
    && mkdir -p /tmp/public_media /tmp/ajn-work /tmp/runtime-ajn \
    && chown -R 10001:10001 /app /home/ajn /tmp/public_media /tmp/ajn-work /tmp/runtime-ajn \
    && chmod 700 /tmp/runtime-ajn

USER 10001
RUN set -eu; \
    python -c "from app.main import app; assert app.title == 'AJN PDF Conversion API'; print('PASS: FastAPI application import')"; \
    python conversion_contract_audit.py; \
    uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 1 --proxy-headers > /tmp/ajn-build-uvicorn.log 2>&1 & \
    server_pid=$!; \
    trap 'kill "$server_pid" 2>/dev/null || true' EXIT INT TERM; \
    attempt=0; \
    until curl --fail --silent http://127.0.0.1:8000/ready >/dev/null 2>&1; do \
        attempt=$((attempt + 1)); \
        if [ "$attempt" -ge 60 ]; then \
            echo 'AJN PDF build-time FastAPI server did not become ready.'; \
            cat /tmp/ajn-build-uvicorn.log; \
            exit 1; \
        fi; \
        sleep 1; \
    done; \
    python capability_audit.py; \
    kill "$server_pid"; \
    wait "$server_pid" 2>/dev/null || true; \
    trap - EXIT INT TERM; \
    python api_v1_contract_test.py; \
    python ocr_language_gate.py; \
    python ocr_multilingual_acceptance_test.py; \
    python ocr_deep_acceptance_test.py; \
    python ocr_selected_acceptance_test.py; \
    python e_signature_acceptance_test.py; \
    python image_pdf_quality_acceptance_test.py; \
    python hard_format_acceptance_test.py; \
    python full_acceptance_test.py; \
    python processing_quality_acceptance_test.py

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --workers 1 --proxy-headers"]