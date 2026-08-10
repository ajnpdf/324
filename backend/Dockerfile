FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HOME=/home/ajn \
    AJN_ANALYTICS_DB=/tmp/ajn_analytics.sqlite3 \
    AJN_PUBLIC_MEDIA_DB=/tmp/ajn_public_media.sqlite3 \
    AJN_PUBLIC_MEDIA_ROOT=/tmp/public_media \
    DEBIAN_FRONTEND=noninteractive

# Native conversion engines required by AJN PDF server-assisted tools.
# Ghostscript is intentionally not bundled; XPS/PostScript stays dependency-gated
# until a separate licensing decision is made.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-writer libreoffice-calc libreoffice-impress \
    tesseract-ocr tesseract-ocr-eng tesseract-ocr-hin tesseract-ocr-tel \
    tesseract-ocr-tam tesseract-ocr-kan tesseract-ocr-mal tesseract-ocr-osd \
    calibre \
    imagemagick poppler-utils \
    libcairo2 libpango-1.0-0 libpangocairo-1.0-0 \
    fonts-dejavu-core fonts-liberation fonts-noto-core \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt
COPY app ./app

RUN useradd --create-home --uid 10001 ajn \
    && mkdir -p /tmp/public_media \
    && chown -R 10001:10001 /app /tmp/public_media /home/ajn
USER 10001

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/ready', timeout=3)" || exit 1

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --workers 1"]
