# Backend PRD

## Marimo Backend 1:1 Spec Index

This file is the entrypoint for the marimo backend copy spec.

- Detailed source-backed contracts now live under `backend/prd/`.
- Keep this file short and stable for session handoff.
- Add or refine actual backend contracts in the split files, not here.
- `backend/PRD.md` remains the top-level source-of-truth pointer that `AGENTS.md` and `CLAUDE.md` can reference safely.

### Reading Order

1. [01 Goal, Rules, and Sources](./prd/01-goal-rules-and-sources.md)
2. [02 Server App Factory & Middleware](./prd/02-server-app-factory-and-middleware.md)
3. [03 HTTP API Endpoint Catalog](./prd/03-http-api-endpoint-catalog.md)
4. [04 WebSocket & Message Protocol](./prd/04-websocket-and-message-protocol.md)
5. [05 Session Manager & Kernel Lifecycle](./prd/05-session-manager-and-kernel-lifecycle.md)
6. [06 AST Analysis & Code Compilation](./prd/06-ast-analysis-and-code-compilation.md)
7. [07 Runtime Engine & Reactive Dataflow](./prd/07-runtime-engine-and-reactive-dataflow.md)
8. [08 Package Manager & File System](./prd/08-package-manager-and-file-system.md)
9. [09 Configuration System & CLI](./prd/09-configuration-system-and-cli.md)
10. [10 Widget System & Output Formatters](./prd/10-widget-system-and-output-formatters.md)
11. [11 AI, MCP, RTC & Auxiliary Systems](./prd/11-ai-mcp-rtc-and-auxiliary-systems.md)
12. [12 Summary, Acceptance, and Codaro Mapping](./prd/12-summary-acceptance-and-codaro-mapping.md)

### Source of Truth

- Primary source: marimo Python package installed at `.venv/Lib/site-packages/marimo/`.
- Lock version: `marimo==0.21.0` (same as frontend PRD).
- No guessed APIs, schemas, or behaviors allowed.
- Every contract must trace back to actual marimo source code with file path and line reference.

### Update Rules

- When a backend surface is documented, write the source file path, class/function name, and actual signature.
- When a surface is internal-only (no public API), record that explicitly instead of guessing.
- `backend/prd/12-summary-acceptance-and-codaro-mapping.md` is the acceptance gate.

### Session Resume

When resuming the marimo backend parity sweep:

1. Start from [12 Summary, Acceptance, and Codaro Mapping](./prd/12-summary-acceptance-and-codaro-mapping.md).
2. Read `Current State`, `Next Action`, and `Verification Left`.
3. Then jump into the specific split file for the layer being traced.
