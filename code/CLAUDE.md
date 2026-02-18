# CLAUDE.md - Backend (OCaml)

This file provides guidance for Claude Code when working with the OCaml backend in `code/`.

## Mindset

- You are a professional OCaml developer.
- Match the style of the existing project. When you don't know how, consult existing code.

## Build System

- **Never update dune files or Makefiles.** Modify `pds.conf` instead.
- After editing an OCaml file: `ocamlformat -i src/<module>/<filename>`
- After an edit, build the terrat make target to verify: `make -k -j$(nproc) <target>`
- Always use `tail` to reduce output when diagnosing build failures.
- To build schemas: `make terrat-schemas`
- To build client and server: `make terrat`

## Testing

- To test: `make test-{release,debug}_<target>`
- Unit tests go in `code/tests/<name>` matching the library in `code/src/<name>`

## OCaml Style

- **Module aliases**: For long module names, use `let module M = Long_module_name in`.
- **Snakecase**: Always use snakecase. Prefer `String_set` over `StringSet`.
- **Record field access**: Use `{ Module. field; ... }` not `Module.{ field; ... }`.
- **New types**: Prefer creating a new module with `type t`.
- **Errors**: Polymorphic variants. Type named `err` or ending in `_err`. Constructors end in `_err`. Always derive show:
  ```ocaml
  type err = [ `Some_err ] [@@deriving show]
  ```

## Module Organization

**Framework layers:**
- `abb*` — Async Building Blocks (custom async runtime, I/O, curl, TCP, TLS, caching)
- `brtl*` — Web framework (HTTP handlers, session middleware, logging, pagination)

**Domain modules:**
- `terrat` — Core application logic
- `terrat_vcs_api_*` / `terrat_vcs_service_*` — VCS abstraction (GitHub, GitLab)
- `terrat_tag_query*` — Tag Query Language (lexer, parser, AST, SQL generation)
- `terrat_work_manifest3` — Work manifest lifecycle
- `terrat_change_match3` — Change detection and dirspace matching
- `terrat_access_control2` — RBAC and authorization
- `terrat_config` / `terrat_repo_config` — Configuration management

**Generated modules (do not edit manually):**
- `terrat_api` — Generated from `api_schemas/terrat/api.json`
- `terrat_github_webhooks` — Generated from webhook JSON schemas
- `terrat_repo_config` — Generated from config JSON schema
- `githubc2` — Generated GitHub API client
- `gitlabc` — Generated GitLab API client

## Async Patterns

```ocaml
open Abb.Future.Syntax

let process_request request =
  let* validation_result = validate_request request in
  let* data = fetch_data validation_result in
  let* result = transform_data data in
  return result
```

## Adding New API Endpoints

1. Edit `api_schemas/terrat/api.json`
2. `make terrat-api` to regenerate OCaml types
3. Implement endpoint in the appropriate `terrat_*` module
4. Add tests in `tests/`
5. Build and test: `make -k -j$(nproc) release-terrat && make test-terrat`
