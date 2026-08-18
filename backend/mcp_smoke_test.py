from __future__ import annotations

import asyncio
import base64

from app.mcp_server import _convert, _spec_payload, mcp


def main() -> None:
    # This test intentionally exercises the inner MCP registry/worker directly.
    # Request authentication is covered separately by mcp_auth_smoke_test.py.
    assert mcp is not None

    spec = _spec_payload("txt-to-pdf")
    assert spec["tool_id"] == "txt-to-pdf"
    assert spec["output_extension"] == ".pdf"

    result = asyncio.run(
        _convert(
            tool_id="txt-to-pdf",
            files=[
                {
                    "filename": "mcp-smoke.txt",
                    "content_base64": base64.b64encode(b"AJN PDF MCP smoke test\n").decode("ascii"),
                }
            ],
            output_name="mcp-smoke",
        )
    )
    assert result["ok"] is True
    assert result["mime_type"] == "application/pdf"
    output = base64.b64decode(result["content_base64"])
    assert output.startswith(b"%PDF-")
    assert len(output) > 100
    print("PASS: AJN PDF MCP registry + worker conversion")


if __name__ == "__main__":
    main()
