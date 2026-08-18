from __future__ import annotations

import asyncio
import json
import os

from app.api_access import APIAccessError, authenticate_api_key, clear_api_key_cache, enforce_api_rate_limit, hash_api_key


def main() -> None:
    secret = "ajn_live_" + "A" * 48
    os.environ["AJN_PUBLIC_API_ENABLED"] = "true"
    os.environ["AJN_PUBLIC_API_KEYS_JSON"] = json.dumps(
        [
            {
                "id": "acceptance",
                "secret_sha256": hash_api_key(secret),
                "scopes": ["read", "convert", "ocr"],
                "rate_per_minute": 2,
            }
        ]
    )
    clear_api_key_cache()

    principal = authenticate_api_key(secret, "ocr")
    assert principal.key_id == "acceptance"
    assert "convert" in principal.scopes
    assert principal.rate_per_minute == 2

    try:
        authenticate_api_key("wrong-secret-that-is-long-enough-for-validation", "read")
    except APIAccessError as exc:
        assert exc.status_code == 401
        assert exc.code == "API_KEY_INVALID"
    else:
        raise AssertionError("Invalid API key was accepted")

    try:
        authenticate_api_key(secret, "sign")
    except APIAccessError as exc:
        assert exc.status_code == 403
        assert exc.code == "API_SCOPE_REQUIRED"
    else:
        raise AssertionError("Missing API scope was accepted")

    async def rate_test() -> None:
        first = await enforce_api_rate_limit(principal)
        second = await enforce_api_rate_limit(principal)
        assert first.limit == 2
        assert second.remaining == 0
        try:
            await enforce_api_rate_limit(principal)
        except APIAccessError as exc:
            assert exc.status_code == 429
            assert exc.code == "API_RATE_LIMITED"
        else:
            raise AssertionError("API rate limit did not trigger")

    asyncio.run(rate_test())

    from app.main import app

    paths = {route.path for route in app.routes}
    required = {
        "/api/v1/status",
        "/api/v1/account",
        "/api/v1/capabilities",
        "/api/v1/convert/{tool_id}",
        "/api/v1/ocr/analyze",
        "/api/v1/ocr/text",
        "/api/v1/ocr/searchable-pdf",
        "/api/ocr/analyze",
    }
    missing = sorted(required.difference(paths))
    if missing:
        raise AssertionError(f"API v1 routes are missing: {missing}")

    print("PASS: AJN PDF API v1 hashed-key, scope, rate-limit and route contracts")


if __name__ == "__main__":
    main()
