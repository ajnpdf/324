# AJN PDF MCP Integration

AJN PDF includes a standalone remote Model Context Protocol (MCP) service for ChatGPT/OpenAI, Claude, and other MCP-compatible clients.

The MCP service is isolated from the existing AJN PDF FastAPI production API. It reuses the same `app.conversion_engine` registry and `app.job_worker` process isolation, so conversion behavior stays aligned with the website/backend without coupling the MCP protocol lifecycle to the main API.

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

## MCP Auth V2

Production traffic enters through `app.mcp_entrypoint`, which wraps the official MCP SDK ASGI application with fail-closed bearer authentication.

Default behavior:

- `AJN_MCP_REQUIRE_AUTH=true`
- every non-`OPTIONS` HTTP request must send `Authorization: Bearer <token>`
- the configured bearer token must contain at least 32 characters
- missing/invalid bearer credentials return `401`
- a missing or too-short server token returns `503` instead of silently exposing the service
- bearer comparison uses constant-time comparison
- the secret is never committed to source control
- ASGI lifespan/non-HTTP scopes are forwarded unchanged to the official MCP server

Environment variables:

```text
AJN_MCP_REQUIRE_AUTH=true
AJN_MCP_BEARER_TOKEN=
AJN_MCP_MIN_TOKEN_CHARS=32
```

`AJN_MCP_BEARER_TOKEN` must be injected only at deployment time (prefer a managed secret store). Never place a real token in `.env.example`, Dockerfile, GitHub source, CI logs, or documentation.

For temporary local-only development, auth can be disabled explicitly with `AJN_MCP_REQUIRE_AUTH=false`. Do not use that setting for an internet-reachable production service.

## Security and processing model

- MCP runs as a separate ASGI service.
- `app.mcp_entrypoint` provides application-level bearer authentication.
- `app.mcp_server` remains the official Python `mcp` SDK Streamable HTTP application.
- The MCP endpoint is `/mcp`.
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

These limits are intentionally smaller than the normal website/API limits because base64 is inefficient for large binary payloads. Keep large-file processing on the standard AJN PDF upload/API path until a dedicated client file bridge is added.

## Local install

From `backend`:

```bash
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python mcp_auth_smoke_test.py
python mcp_smoke_test.py
```

Start locally with authentication enabled:

```bash
# Set a random 32+ character development token in your shell first.
uvicorn app.mcp_entrypoint:app --host 127.0.0.1 --port 8080
```

The local MCP URL is:

```text
http://127.0.0.1:8080/mcp
```

Clients must send:

```text
Authorization: Bearer <AJN_MCP_BEARER_TOKEN>
```

## MCP Inspector

```bash
npx @modelcontextprotocol/inspector
```

Choose **Streamable HTTP**, connect to `http://127.0.0.1:8080/mcp`, and include the bearer Authorization header.

Verify at minimum:

1. `list_ajn_pdf_tools`
2. `get_ajn_pdf_tool` with `txt-to-pdf`
3. `ajn_url_to_pdf` with a safe public page
4. `convert_ajn_pdf_file` with a small text/image/PDF fixture

## Build the isolated MCP container

From `backend`:

```bash
docker build -f Dockerfile.mcp -t ajn-pdf-mcp:2.0.0 .
```

The Docker build runs both:

```text
mcp_auth_smoke_test.py
mcp_smoke_test.py
```

The runtime command serves `app.mcp_entrypoint:app`, not the unauthenticated inner MCP application directly.

## Cloud deployment model

The production service should have two separate security layers:

1. internet-reachable HTTPS transport so standards-based MCP clients can reach `/mcp`
2. AJN PDF application authentication using `AJN_MCP_BEARER_TOKEN`

Configure at deployment time:

```text
AJN_MCP_REQUIRE_AUTH=true
AJN_MCP_BEARER_TOKEN=<secret injected by deployment platform>
AJN_MCP_ALLOWED_HOSTS=<exact deployed hostnames>
AJN_MCP_ALLOWED_ORIGINS=https://ajnpdf.com,https://www.ajnpdf.com
```

Do not make the service internet-reachable until the authenticated `app.mcp_entrypoint` image is deployed and the bearer secret is configured.

After deployment, verify all three cases:

1. no Authorization header -> `401`
2. wrong bearer token -> `401`
3. correct bearer token -> MCP discovery and `tools/list` return successfully

Also verify that the exact public/canonical proxy hostnames are included in `AJN_MCP_ALLOWED_HOSTS`; the MCP SDK intentionally returns `421` for unapproved Host headers.

## Claude Code

Configure the remote MCP endpoint using an Authorization header containing the AJN PDF bearer token. The token should come from the user's secret/configuration mechanism, not source control.

Expected endpoint shape:

```text
https://YOUR_MCP_HOST/mcp
```

Expected request header:

```text
Authorization: Bearer <AJN_MCP_BEARER_TOKEN>
```

## OpenAI / ChatGPT

Use the deployed HTTPS MCP URL as a remote MCP server. For production distribution, OAuth should replace the shared bearer-token bootstrap so users receive revocable, scoped credentials rather than sharing one service-wide secret.

## Recommended production rollout

1. Build the authenticated `Dockerfile.mcp` image.
2. Confirm both Docker smoke tests pass.
3. Generate a strong deployment secret; never commit it.
4. Deploy the authenticated image while keeping the service private.
5. Inject `AJN_MCP_BEARER_TOKEN` and exact allowed hostnames.
6. Verify unauthorized requests fail closed.
7. Make the HTTPS endpoint reachable by MCP clients only after application auth is active.
8. Test `server/discover`, `tools/list`, `list_ajn_pdf_tools`, `get_ajn_pdf_tool`, and `txt-to-pdf` using the AJN bearer token.
9. Connect Claude Code and run a real conversion.
10. Add OAuth for Claude.ai/ChatGPT production distribution.
11. Keep large-file document upload on the existing AJN PDF API until the client-native file bridge is implemented and tested.

## Next production expansion

The next MCP milestone should add a dedicated file-transfer layer so ChatGPT/Claude can hand off larger files without base64 tool arguments. The correct implementation should use short-lived upload/download objects or the host's supported file-reference mechanism, enforce ownership and expiry, and never expose permanent public document URLs.

That expansion can also add focused tools for merge, split, rotate, organize, watermark, page extraction and signing where those operations currently run only in the browser/frontend.
