# AJN PDF 3.1.0

AJN PDF is a Next.js + FastAPI document platform for PDF, image, OCR, Office, eBook and structured-data workflows.

## 3.1.0 production focus

This release hardens the complete backend processing path. Public server-assisted tools now fail closed unless `/ready` is healthy and the exact live capability is available. Uploads stream to disk, file contents are structurally validated, conversions run in killable worker processes, workloads are bounded, generated outputs are validated, request references are preserved, and temporary files are cleaned after delivery.

The Windows production gate now runs both the direct converter acceptance suite and a live HTTP acceptance suite through `/api/convert/{tool_id}` plus Protect, Unlock, Repair and Compress before the frontend build is allowed to pass.

## Current product experience

- Premium mobile-first homepage and tool cards.
- Five UI languages: English, Hindi, Telugu, Tamil and Kannada.
- Unified Choose File → Customize → Process → Download tool workflow.
- Direct visual placement for Add Text, Add Image and Sign PDF.
- Strict zero-warning ESLint and semantic TypeScript build gates.
- Capability-aware backend tools and hardened `/ready` checks.
- OCR languages installed locally by Windows setup.

## Local Windows setup

Run `SETUP_FULL_PRODUCTION.ps1`. It verifies converter dependencies, OCR data, backend readiness, capability availability, direct acceptance, live HTTP acceptance, frontend dependencies, security-maintenance versions, all source guards, zero-warning lint, TypeScript and the optimized Next.js production build.

Success marker:

`AJN PDF PRODUCTION SETUP PASSED`

## Local URLs

- Website: `http://localhost:3000`
- Backend health: `http://127.0.0.1:8000/health`
- Backend readiness: `http://127.0.0.1:8000/ready`
- Live capability registry: `http://127.0.0.1:8000/api/tools`
- API documentation: `http://127.0.0.1:8000/docs`

## Dependency-aware tools

Ghostscript is not installed automatically. Ghostscript/XPS/PostScript-dependent capabilities stay unavailable until an appropriately licensed engine is configured. This does not make the other tools unhealthy.

## Deployment gates after local PASS

Public hosting, DNS/TLS/CORS, real persistent storage and restore drills, monitoring, physical-device/browser/screen-reader QA, genuine MSG/XPS fixtures, live URL-to-PDF network acceptance, Search Console/Core Web Vitals, CMP and AdSense review remain deployment/manual gates.

See `BACKEND_WORKFLOW_3_1_0.md`, `IMPLEMENTATION_REPORT_3_1_0.md` and `PRODUCTION_DEPLOYMENT_GUIDE.md`.
