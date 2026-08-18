from __future__ import annotations

import json
import sys
import traceback
from pathlib import Path

import pikepdf

from .conversion_engine import SPECS
from .processing_quality import run_conversion


def _write(payload: dict[str, object]) -> None:
    sys.stdout.write(json.dumps(payload, ensure_ascii=False))
    sys.stdout.flush()


def main() -> int:
    try:
        payload = json.load(sys.stdin)
        operation = str(payload.get("operation", "conversion"))
        if operation == "conversion":
            tool_id = str(payload["tool_id"])
            spec = SPECS.get(tool_id)
            if spec is None:
                raise ValueError("This conversion tool is not registered.")
            files = [Path(value) for value in payload.get("files", [])]
            output = Path(str(payload["output"]))
            workdir = Path(str(payload["workdir"]))
            options = payload.get("options") or {}
            if not isinstance(options, dict):
                raise ValueError("Conversion options must be a JSON object.")
            source_url = payload.get("source_url")
            run_conversion(spec, files, output, options, workdir, str(source_url) if source_url else None)
        elif operation == "protect":
            source = Path(str(payload["source"]))
            target = Path(str(payload["target"]))
            permissions = pikepdf.Permissions(**dict(payload.get("permissions") or {}))
            with pikepdf.open(source) as pdf:
                pdf.save(
                    target,
                    encryption=pikepdf.Encryption(
                        user=str(payload.get("user_password", "")),
                        owner=str(payload.get("owner_password", "")),
                        R=6,
                        aes=True,
                        allow=permissions,
                    ),
                )
        elif operation == "unlock":
            source = Path(str(payload["source"]))
            target = Path(str(payload["target"]))
            with pikepdf.open(source, password=str(payload.get("password", ""))) as pdf:
                pdf.save(target)
        elif operation == "repair":
            source = Path(str(payload["source"]))
            target = Path(str(payload["target"]))
            with pikepdf.open(source, attempt_recovery=True) as pdf:
                pdf.save(target, object_stream_mode=pikepdf.ObjectStreamMode.generate)
        elif operation == "compress":
            source = Path(str(payload["source"]))
            target = Path(str(payload["target"]))
            with pikepdf.open(source) as pdf:
                pdf.remove_unreferenced_resources()
                pdf.save(
                    target,
                    object_stream_mode=pikepdf.ObjectStreamMode.generate,
                    compress_streams=True,
                    recompress_flate=True,
                )
        else:
            raise ValueError("Unknown processing operation.")
        _write({"ok": True})
        return 0
    except Exception as exc:
        _write(
            {
                "ok": False,
                "type": type(exc).__name__,
                "message": str(exc) or "Processing failed.",
                "trace": traceback.format_exc(limit=4),
            }
        )
        return 2


if __name__ == "__main__":
    raise SystemExit(main())