FROM python:3.12-slim
# AJN PDF R14.8.2 - Calibre ebook-convert production runtime
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
    QT_QPA_PLATFORM=offscreen \
    QT_QUICK_BACKEND=software \
    QTWEBENGINE_CHROMIUM_FLAGS=--disable-gpu \
    DEBIAN_FRONTEND=noninteractive

# Native engines for AJN PDF server-assisted workflows.
# XPS/PostScript remain dependency-gated because MuPDF/Ghostscript licensing
# requires a separate production decision.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-writer libreoffice-calc libreoffice-impress \
    tesseract-ocr tesseract-ocr-eng tesseract-ocr-hin tesseract-ocr-tel \
    tesseract-ocr-tam tesseract-ocr-kan tesseract-ocr-mal tesseract-ocr-osd \
    calibre \
    imagemagick poppler-utils \
    libcairo2 libpango-1.0-0 libpangocairo-1.0-0 \
    fonts-dejavu-core fonts-liberation fonts-noto-core \
    ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/ajn /tmp/public_media /tmp/ajn-work

WORKDIR /app
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Fail the image build if the critical native processors are missing.

# Run Calibre / Qt WebEngine as an unprivileged user.
# Cloud Run also executes the final service as this user.
RUN id -u ajn >/dev/null 2>&1 || useradd --uid 10001 --user-group --home-dir /home/ajn --shell /usr/sbin/nologin ajn
RUN mkdir -p /home/ajn /tmp/public_media /tmp/ajn-work \
    && chown -R 10001:10001 /app /home/ajn /tmp/public_media /tmp/ajn-work
USER 10001

RUN python -c "import fitz,pikepdf,pytesseract,docx,openpyxl,PIL,reportlab,ebooklib,cairosvg" \
    && libreoffice --headless --version \
    && tesseract --version \
    && ebook-convert --version \
    && pdftoppm -v

COPY app ./app
COPY smoke_test.py capability_audit.py full_acceptance_test.py ./

# Build-time production gate: Python smoke/capability checks plus real output
# generation across every available backend conversion family.
RUN python -m compileall -q app

RUN python -c "from app.main import app; assert app.title == 'AJN PDF Conversion API'; print('PASS: FastAPI application import')" \
    && python full_acceptance_test.py

RUN useradd --home-dir /home/ajn --uid 10001 ajn \
    && chown -R 10001:10001 /app /tmp/public_media /tmp/ajn-work /home/ajn

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --workers 1 --proxy-headers"]
