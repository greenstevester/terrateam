# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Terrateam is an open-source Terraform automation platform that runs plans and applies in pull requests. OCaml backend + Svelte frontend (Iris). Handles thousands of workspaces across monorepos with GitOps workflows, policy enforcement, cost estimation, and drift detection. Licensed MPL-2.0 (OSS) with enterprise features under separate license.

## Repository Structure

```
terrateam/
├── code/                    # OCaml backend + Svelte frontend
│   ├── Makefile             # Build orchestration (includes generated pds.mk)
│   ├── pds.conf             # PDS package definitions (193+ modules)
│   ├── hll.pins             # Exact dependency versions
│   ├── .ocamlformat         # OCaml formatter config
│   └── src/
│       ├── abb*             # Async Building Blocks (custom async runtime)
│       ├── brtl*            # Web framework (HTTP, middleware, sessions)
│       ├── terrat*          # Core domain modules
│       ├── githubc2*        # Generated GitHub API client
│       ├── gitlabc*         # Generated GitLab API client
│       └── iris/            # Svelte frontend (see iris/CLAUDE.md)
├── api_schemas/             # OpenAPI + JSON Schema (source of truth)
│   └── terrat/api.json      # Main API spec
├── docker/terrat/           # Docker Compose for self-hosted deployment
├── scripts/                 # Release, deploy, notification scripts
├── vendor/                  # Vendored C libraries (libkqueue, ocaml-uri)
└── .terrateam/config.yml    # Terrateam's own workflow config
```

## Development Commands

### OCaml Backend (run from `code/`)

```bash
# Build
make -k -j$(nproc) release-terrat    # Release binaries
make -k -j$(nproc) debug-terrat      # Debug binaries
make terrat                           # Both release + debug

# Test
make test-terrat                                    # All tests
make test-release_terrat_github_webhooks            # Single test suite
make test-release_terrat_sql_of_tag_query           # Single test suite
make test-debug_abb_fut                             # Single test suite

# Schema generation (from OpenAPI/JSON Schema → OCaml types)
make terrat-schemas        # All schemas
make terrat-api            # Main API types
make terrat-repo-config    # Config validation types
make terrat-webhooks       # Webhook parser types
make github-api            # GitHub API client
make gitlab-api            # GitLab API client
```

### Frontend — Iris (run from `code/src/iris/`)

```bash
npm run dev                  # Vite dev server with HMR
npm run dev:full             # With nginx proxy + SSL
npm run build                # Production build (includes check)

# Quality checks (all must pass before committing)
npm run check                # svelte-check (Svelte + TS validation)
npm run type-check           # tsc --noEmit
npm run check-api-types      # API schema alignment
npm run knip                 # Dead code detection
npm run pre-commit           # type-check + check-api-types + knip
npm run test                 # Full suite (all of the above + check)

npm run generate-api-types   # Regenerate TS types from api.json
```

### Docker (self-hosted)

```bash
cd docker/terrat/
docker-compose up setup      # Setup wizard at http://localhost:3000
docker-compose up            # Full stack (db, server, terratunnel)
```

## OCaml Conventions

These are the project's actual coding conventions. Match them precisely.

### Build System

- **Never edit dune files or Makefiles directly.** Modify `pds.conf` instead.
- After editing an OCaml file: `ocamlformat -i src/<module>/<filename>`
- Always use `make -k -j$(nproc) <target>` for builds.
- If a build fails, use `tail` to reduce output and find the actual error.
- Unit tests go in `code/tests/<name>` matching the library in `code/src/<name>`.

### Style

- **Snakecase everywhere**: `String_set` not `StringSet`, `my_function` not `myFunction`.
- **Module aliases**: For long module names, use `let module M = Long_module_name in`.
- **Record field access**: Always use `{ Module. field; ... }` not `Module.{ field; ... }`.
- **New types**: Prefer creating a new module with `type t` over adding types to existing modules.
- **Errors as polymorphic variants**: Error types named `err` (or suffix `_err`), constructors end in `_err`, always derive show:
  ```ocaml
  type err = [ `Some_err ] [@@deriving show]
  ```
- **Async patterns**: Uses custom ABB framework with `let*` syntax:
  ```ocaml
  open Abb.Future.Syntax
  let* result = some_async_operation () in
  ...
  ```
- **Error handling**: Result types with proper propagation; no exceptions for control flow.

## Frontend Conventions (Iris)

See `code/src/iris/CLAUDE.md` for full details. Key rules:

- **TypeScript only** — no JavaScript, no `any` types
- **PageLayout required** — all pages must use the `PageLayout` component, never direct `Sidebar`
- **Validated API client only** — never raw `fetch()`, always use the typed API client
- **No inline styles** — CSS classes only (CSP compliance)
- **Accessibility** — full keyboard navigation, ARIA labels, semantic HTML
- **Runtime validation** — all API responses validated with Zod schemas

## Schema-First Development

The API schema (`api_schemas/terrat/api.json`) is the source of truth. Changes flow:

1. Edit `api_schemas/terrat/api.json`
2. `cd code && make terrat-api` → generates OCaml types in `src/terrat_api/`
3. `cd code/src/iris && npm run generate-api-types` → generates `api-types-generated.ts`
4. Update implementations on both sides
5. Run `make test-terrat` and `npm run test` to verify

## Architecture

### Backend (OCaml)

**Executables:**
- `terrat_oss` — Open source server
- `terrat_ee` — Enterprise server (adds RBAC, centralized config, gatekeeper)
- `iris` — Frontend web server

**Framework layers:**
- **ABB** (`abb*`) — Custom async runtime with platform-specific I/O (kqueue on BSD/macOS, select fallback). Handles futures, process mgmt, caching, TCP, TLS, HTTP (via curl).
- **BRTL** (`brtl*`) — Web framework with session middleware, logging, pagination, static file serving.

**Domain modules:**
- `terrat_vcs_api_*` / `terrat_vcs_service_*` — Abstract VCS layer with GitHub and GitLab implementations
- `terrat_tag_query*` — Tag Query Language (lexer → parser → AST → SQL generation)
- `terrat_work_manifest3` — Work manifest lifecycle management
- `terrat_change_match3` — Change detection and directory/workspace matching
- `terrat_access_control2` — RBAC and authorization gates
- `terrat_config` / `terrat_repo_config` — Configuration management and validation

### Frontend (Iris — Svelte 4)

**Stack:** Svelte 4 + Vite 5 + TypeScript + Tailwind CSS + Zod + svelte-spa-router

**API integration layer:**
- `api-types-generated.ts` — auto-generated from OpenAPI (never edit)
- `types.ts` — manual types with Zod validation
- `api.ts` — type-safe API client
- `hooks.ts` — reactive API hooks for Svelte stores

**Pagination:** Link headers (RFC 5988), same pattern as GitHub API.

### Core Domain Concepts

**Work Manifests** — Central abstraction for all Terraform operations (plan, apply, index, drift). Links to PRs, tracks execution state and results.

**Dirspaces** — Directory + workspace combination. The atomic unit of Terraform execution.

**Tag Query Language** — Server-side filtering with composable queries:
```
state:success and user:josh
type:apply and branch:main
created_at:2024-01-01.. and environment:production
```

**Installations** — GitHub App installations controlling org-level permissions, repo access, and multi-tenant billing.

## Commit Message Format

From CONTRIBUTING.md — PRs and commits follow:
```
ISSUE_NUMBER ACTION_TYPE Short description
```
Action types: `ADD` (new features), `FIX` (bug fixes), `REFACTOR` (restructuring).

Examples:
```
123 ADD Support for multi-region deployments
234 FIX Resolve cache issue on deployment
345 REFACTOR Move user authentication to middleware
```

## Enterprise vs OSS

Enterprise features (RBAC, centralized config, gatekeeper) live in `terrat_ee` and `terrat_vcs_service_*_ee` modules. Enterprise code is not open for contributions. The shared codebase structure means both editions compile from the same repo.
