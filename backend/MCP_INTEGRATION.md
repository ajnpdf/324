# AJN PDF MCP Integration

AJN PDF now includes a standalone remote Model Context Protocol (MCP) service for ChatGPT/OpenAI, Claude, and other MCP-compatible clients.

The MCP service is intentionally isolated from the existing AJN PDF FastAPI production API. It reuses the same `app.conversion_engine` registry and `app.job_worker` process isolation, so conversion behavior stays aligned with the website/backend without coupling the MCP protocol lifecycle to the main API.

## What is exposed

The server currently exposes focused MCP tools:

- `list_ajn_pdf_tools` — discover available conversion/OCR/image/document tool IDs.
- `get_ajn_pdf_tool` — inspect one tool's input extensions, output type, availability and limitations.
- `convert_ajn_pdf_file` — run one registered conversion using an inline base64 file.
- `convert_ajn_pdf_files` — run registered multi-file conversions using inline base64 files.
- `ajn_url_to_pdf` — convert a public HTTP/HTTPS page using the existing AJN PDF URL safety checks.
- `compress_ajn_pdf` — server-side PDF compression/rewrite.
- `protect_ajn_pdf` — password protect a PDF with configurable permissions.
- `unlock_ajn_pdf` — unlock a PDF when the correct password is supplied.
- `repair_ajn_pdf` — recover/rewrite a structurally problematic PDF.

The generic conversion tools expose the existing AJN PDF conversion registry instead of duplicating every converter as separate implementation code.

## Security and processing model

- MCP runs as a separate ASGI service.
- MCP uses the official Python `mcp` SDK and Streamable HTTP.
- The public endpoint is `/mcp`.
- MCP DNS-rebinding protection uses an explicit host allowlist.
- Browser origins use an explicit origin allowlist.
- File names are normalized before writing temporary files.
- Inline base64 file sizes and combined job sizes are bounded.
- Output size is bounded before it is returned through MCP.
- Conversion work executes through the same isolated `app.job_worker` subprocess used by the backend.
- Each MCP job uses a temporary directory that is deleted after the tool call.
- Processing has a hard timeout.

## Default MCP limits

```text
AJN_MCP_MAX_FILE_MB=8
AJN_MCP_MAX_TOTAL_MB=16
AJN_MCP_MAX_OUTPUT_MB=16
AJN_MCP_PROCESSING_TIMEOUT_SECONDS=180
```

These limits are intentionally smaller than the normal website/API limits because base64 is inefficient for large binary payloads. Keep large-file processing on the standard AJN PDF upload/API path until a dedicated client file-bridge is added.

## Local install

From `backend`:

```bash
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python mcp_smoke_test.py
uvicorn app.mcp_server:app --host 127.0.0.1 --port 8080
```

The local MCP URL is:

```text
http://127.0.0.1:8080/mcp
```

## MCP Inspector

```bash
npx @modelcontextprotocol/inspector
```

Choose **Streamable HTTP** and connect to:

```text
http://127.0.0.1:8080/mcp
```

Verify at minimum:

1. `list_ajn_pdf_tools`
2. `get_ajn_pdf_tool` with `txt-to-pdf`
3. `ajn_url_to_pdf` with a safe public page
4. `convert_ajn_pdf_file` with a small text/image/PDF fixture

## Build the isolated MCP container

From `backend`:

```bash
docker build -f Dockerfile.mcp -t ajn-pdf-mcp:1.0.0 .
docker run --rm -p 8080:8080 \
  -e AJN_MCP_ALLOWED_HOSTS=localhost,127.0.0.1 \
  -e AJN_MCP_ALLOWED_ORIGINS=http://localhost:3000 \
  ajn-pdf-mcp:1.0.0
```

## Google Cloud Run deployment

Example:

```bash
gcloud run deploy ajn-pdf-mcp \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "AJN_MCP_ALLOWED_HOSTS=YOUR_MCP_HOSTNAME,YOUR_MCP_HOSTNAME:*,AJN_MCP_ALLOWED_ORIGINS=https://ajnpdf.com,https://www.ajnpdf.com,AJN_MCP_MAX_FILE_MB=8,AJN_MCP_MAX_TOTAL_MB=16,AJN_MCP_MAX_OUTPUT_MB=16,AJN_MCP_PROCESSING_TIMEOUT_SECONDS=180"
```

When deploying from Cloud Build, explicitly select `Dockerfile.mcp`. If the final service URL is, for example, `https://ajn-pdf-mcp-xxxxx.a.run.app`, the MCP URL is:

```text
https://ajn-pdf-mcp-xxxxx.a.run.app/mcp
```

**Important:** set `AJN_MCP_ALLOWED_HOSTS` to the exact deployed hostname (and `hostname:*` where a proxy may preserve a port). The official MCP transport rejects unapproved hostnames by design.

## OpenAI / ChatGPT / Responses API

Use the deployed HTTPS MCP URL as a remote MCP server. Example Responses API tool definition:

```json
{
  "type": "mcp",
  "server_label": "ajn_pdf",
  "server_description": "AJN PDF document conversion, OCR, compression, protection, unlock and repair tools.",
  "server_url": "https://YOUR_MCP_HOST/mcp",
  "require_approval": "always"
}
```

Start with approval enabled for file-changing operations. After production review, read-only discovery tools can be allowed more freely if desired.

## Claude API

Claude's remote MCP connector requires an HTTPS server. Configure the same endpoint as a URL MCP server and enable its MCP toolset.

Conceptual configuration:

```json
{
  "mcp_servers": [
    {
      "type": "url",
      "url": "https://YOUR_MCP_HOST/mcp",
      "name": "ajn-pdf"
    }
  ],
  "tools": [
    {
      "type": "mcp_toolset",
      "mcp_server_name": "ajn-pdf"
    }
  ]
}
```

## Recommended production rollout

1. Build `Dockerfile.mcp`.
2. Run `python mcp_smoke_test.py` inside the image.
3. Deploy the MCP image to a dedicated Cloud Run service.
4. Set the exact Cloud Run/custom-domain host in `AJN_MCP_ALLOWED_HOSTS`.
5. Test `/mcp` with MCP Inspector over HTTPS.
6. Connect the deployed URL to OpenAI and Claude test environments.
7. Verify discovery + `txt-to-pdf` + PDF compression + protect/unlock + repair with small fixtures.
8. Add authentication/OAuth before exposing user-specific history, storage, billing, or private account data.
9. Keep large-file document upload on the existing AJN PDF API until the client-native file bridge is implemented and tested.

## Next production expansion

The next MCP milestone should add a dedicated file-transfer layer so ChatGPT/Claude can hand off larger files without base64 tool arguments. The correct implementation should use short-lived upload/download objects or the host's supported file-reference mechanism, enforce ownership and expiry, and never expose permanent public document URLs.

That expansion can also add focused tools for merge, split, rotate, organize, watermark, page extraction and signing where those operations currently run only in the browser/frontend.
