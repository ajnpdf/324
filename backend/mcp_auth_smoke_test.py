from __future__ import annotations

from app.mcp_entrypoint import _bearer_matches


def main() -> None:
    token = "A" * 48

    assert _bearer_matches(f"Bearer {token}", token) is True
    assert _bearer_matches(f"bearer {token}", token) is True
    assert _bearer_matches("", token) is False
    assert _bearer_matches("Basic abc", token) is False
    assert _bearer_matches("Bearer wrong-token", token) is False
    assert _bearer_matches(f"Bearer {token}", "") is False

    print("PASS: AJN PDF MCP bearer authentication helpers")


if __name__ == "__main__":
    main()
