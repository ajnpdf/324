from __future__ import annotations

import hmac
import json
import os
from typing import Any

from .mcp_server import app as _mcp_app


def _env_bool(name: str, default: bool = True) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


MCP_REQUIRE_AUTH = _env_bool("AJN_MCP_REQUIRE_AUTH", True)
MCP_BEARER_TOKEN = os.getenv("AJN_MCP_BEARER_TOKEN", "").strip()
MCP_MIN_TOKEN_CHARS = max(32, int(os.getenv("AJN_MCP_MIN_TOKEN_CHARS", "32")))


def _authorization_header(scope: dict[str, Any]) -> str:
    for raw_name, raw_value in scope.get("headers") or []:
        try:
            name = raw_name.decode("latin-1").lower()
        except AttributeError:
            name = str(raw_name).lower()
        if name != "authorization":
            continue
        try:
            return raw_value.decode("latin-1").strip()
        except AttributeError:
            return str(raw_value).strip()
    return ""


def _bearer_matches(authorization: str, expected_token: str) -> bool:
    if not authorization or not expected_token:
        return False
    scheme, separator, supplied = authorization.partition(" ")
    if not separator or scheme.lower() != "bearer" or not supplied:
        return False
    return hmac.compare_digest(supplied.strip(), expected_token)


async def _json_response(send: Any, status: int, payload: dict[str, Any], *, authenticate: bool = False) -> None:
    body = json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    headers: list[tuple[bytes, bytes]] = [
        (b"content-type", b"application/json; charset=utf-8"),
        (b"cache-control", b"no-store"),
        (b"content-length", str(len(body)).encode("ascii")),
    ]
    if authenticate:
        headers.append((b"www-authenticate", b'Bearer realm="AJN PDF MCP"'))
    await send({"type": "http.response.start", "status": status, "headers": headers})
    await send({"type": "http.response.body", "body": body})


class MCPBearerAuthMiddleware:
    """Fail-closed bearer authentication for the dedicated AJN PDF MCP service."""

    def __init__(self, app: Any) -> None:
        self.app = app

    async def __call__(self, scope: dict[str, Any], receive: Any, send: Any) -> None:
        if scope.get("type") != "http":
            await self.app(scope, receive, send)
            return

        # Allow CORS/preflight handling to reach the MCP transport. No MCP tool is
        # executed by OPTIONS itself.
        if str(scope.get("method") or "").upper() == "OPTIONS":
            await self.app(scope, receive, send)
            return

        if not MCP_REQUIRE_AUTH:
            await self.app(scope, receive, send)
            return

        # Production is intentionally fail-closed if the secret is missing or too
        # short. This prevents an accidentally public Cloud Run revision from
        # exposing document-processing compute without application authentication.
        if len(MCP_BEARER_TOKEN) < MCP_MIN_TOKEN_CHARS:
            await _json_response(
                send,
                503,
                {
                    "error": "mcp_auth_not_configured",
                    "message": "AJN PDF MCP authentication is not configured.",
                },
            )
            return

        authorization = _authorization_header(scope)
        if not _bearer_matches(authorization, MCP_BEARER_TOKEN):
            await _json_response(
                send,
                401,
                {
                    "error": "unauthorized",
                    "message": "A valid AJN PDF MCP bearer token is required.",
                },
                authenticate=True,
            )
            return

        await self.app(scope, receive, send)


# Keep the official MCP SDK ASGI application untouched and wrap it at the
# deployment boundary. Lifespan and non-HTTP scopes are forwarded unchanged.
app = MCPBearerAuthMiddleware(_mcp_app)
