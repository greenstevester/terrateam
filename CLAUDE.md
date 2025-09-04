# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Terrateam** is an open-source Terraform automation platform that runs plans and applies in pull requests. Built to handle thousands of workspaces across monorepos, it features GitOps workflows, policy enforcement, cost estimation, and drift detection. The architecture consists of OCaml backend services and a modern Svelte frontend (Iris).

## Development Commands

### OCaml Backend Development (in `/code` directory)

```bash
# Build all components
make all

# Build specific targets
make terrat-api          # Generate API schemas from OpenAPI
make terrat-repo-config  # Generate repo config schemas
make terrat-webhooks     # Generate webhook schemas
make release-terrat      # Build release binaries
make debug-terrat        # Build debug binaries

# Run tests
make test-terrat

# Clean and regenerate schemas
make terrat-schemas
```

### Frontend Development (Iris UI in `/code/src/iris`)

```bash
# Development server with hot reload
npm run dev

# Development with nginx proxy and SSL
npm run dev:full

# Type checking
npm run check
npm run type-check

# Build for production
npm run build

# Quality checks
npm run pre-commit        # Type check + API types + knip
npm run quality-check     # Alias for pre-commit
npm run test             # Full test suite

# API type generation
npm run generate-api-types
npm run check-api-types
```

### Docker Development

```bash
# Self-hosted setup (in /docker/terrat)
docker-compose up setup   # Setup wizard at http://localhost:3000
docker-compose up        # Full stack (db, server, terratunnel)
```

### Running Single Tests

```bash
# OCaml tests (in /code directory)
make test-release_terrat_github_webhooks
make test-release_terrat_sql_of_tag_query
make test-debug_abb_fut

# Frontend tests (in /code/src/iris)
npm run test
```

## Architecture Overview

### High-Level Structure

```
terrateam/
├── code/                    # OCaml backend and Svelte frontend
│   ├── Makefile            # Build system for OCaml components
│   ├── pds.conf           # Package configuration for PDS build system
│   └── src/               # Source code
│       ├── terrat*/       # Core Terrateam services
│       ├── abb*/          # Application building blocks (async runtime)
│       ├── brtl*/         # Web framework components
│       └── iris/          # Svelte frontend application
├── docker/                # Docker configurations
├── scripts/              # Deployment and utility scripts
├── api_schemas/          # OpenAPI and JSON schemas
└── .terrateam/          # Terrateam configuration
```

### Core Backend Architecture (OCaml)

**Primary Services:**
- `terrat_oss` / `terrat_ee` - Main application servers (OSS and Enterprise)
- `iris` - Frontend web server (built with Svelte)
- `terrat_vcs_*` - VCS providers (GitHub, GitLab)
- `terrat_api` - API layer with OpenAPI-generated types

**Key Libraries:**
- `abb` - Async building blocks (custom async runtime)
- `brtl` - Web framework for HTTP services
- `terrat_*` - Domain-specific modules (configs, workflows, etc.)

**Build System:**
- Uses **PDS** (Package Description System) for build configuration
- Makefile-driven compilation with debug/release profiles
- Auto-generation of API bindings from OpenAPI specs

### Frontend Architecture (Iris - Svelte)

**Technology Stack:**
- **Framework**: Svelte 4 with SPA routing  
- **Build**: Vite 5 with TypeScript
- **Styling**: Tailwind CSS
- **API**: Type-safe client with runtime validation

**Key Components:**
- Authentication via GitHub OAuth
- Repository management and setup
- Work manifest tracking (Terraform operations)
- Tag Query Language for advanced filtering
- Real-time operation status updates

## Key Configuration Files

### Backend Configuration

- **`code/pds.conf`** - Defines OCaml package dependencies, build flags, and compilation targets
- **`code/Makefile`** - Build targets for schemas, binaries, and tests
- **`api_schemas/`** - OpenAPI specifications that generate type-safe API clients

### Frontend Configuration  

- **`code/src/iris/package.json`** - Svelte app dependencies and scripts
- **`code/src/iris/tsconfig.json`** - TypeScript configuration
- **`code/src/iris/vite.config.ts`** - Vite build configuration

### Docker Configuration

- **`docker/terrat/docker-compose.yml`** - Self-hosted deployment stack with PostgreSQL, Terrateam server, and Terratunnel

## Core Domain Concepts

### Work Manifests
Central abstraction for all Terraform operations (plan, apply, index, drift). Links operations to GitHub pull requests and tracks execution state, results, and metadata.

### Dirspaces
Represents a Terraform directory + workspace combination - the unit of execution. Enables workspace-specific operations and status tracking.

### Tag Query Language
Powerful server-side filtering system for operations. Supports filtering by state, user, type, branch, directory, PR, workspace, environment, date ranges, and custom tags.

Example queries:
```
state:success and user:josh
type:apply and branch:main  
created_at:2024-01-01.. and environment:production
```

### Installation Management
GitHub App installations that control organization-level permissions, repository access, and billing for multi-tenant operation.

## API Architecture

**Core Pattern**: OpenAPI-first development with auto-generated type-safe clients

**Schema Generation Flow:**
1. Define APIs in `api_schemas/terrat/api.json`
2. Run `make terrat-api` to generate OCaml types  
3. Run `npm run generate-api-types` to generate TypeScript types
4. Use type-safe clients in both backend and frontend

**Key Endpoints:**
- `/api/v1/github/installations` - GitHub installations
- `/api/v1/installations/{id}/repos` - Repository management  
- `/api/v1/installations/{id}/work-manifests` - Operation tracking
- `/api/v1/work-manifests/{id}/outputs` - Logs and results

**Pagination**: Uses RFC 5988 Link headers (same as GitHub API)

## Development Workflows

### Adding New Features

1. **Backend Changes:**
   ```bash
   cd code/
   # Update API schema if needed
   make terrat-api
   # Add OCaml implementation
   # Build and test
   make release-terrat
   make test-terrat
   ```

2. **Frontend Changes:**
   ```bash
   cd code/src/iris/
   # Update types if API changed
   npm run generate-api-types
   # Implement feature
   # Run quality checks
   npm run pre-commit
   ```

### Schema Updates

When modifying API schemas:

1. Edit `api_schemas/terrat/api.json`
2. Regenerate backend types: `make terrat-api`
3. Regenerate frontend types: `npm run generate-api-types`  
4. Update implementations to match new schemas
5. Run tests to verify compatibility

### Quality Assurance

**Required checks before committing:**
```bash
# Backend (in /code)
make test-terrat

# Frontend (in /code/src/iris)  
npm run check          # Svelte TypeScript validation
npm run check-api-types # API schema alignment
npm run knip           # Unused code detection
npm run type-check     # TypeScript compilation
```

## Project-Specific Patterns

### OCaml Conventions

- **Modules**: Highly modular design with clear separation of concerns
- **Error Handling**: Extensive use of Result types and proper error propagation
- **Async**: Custom `abb` runtime for high-performance async operations
- **Type Safety**: Heavy use of OCaml's type system for compile-time guarantees

### Frontend Patterns

- **Components**: Use `PageLayout` for all pages, never direct sidebar usage
- **API Calls**: Always use validated API client, never raw fetch
- **State Management**: Svelte stores with reactive patterns  
- **Type Safety**: Strict TypeScript, no `any` types allowed
- **Accessibility**: Full keyboard navigation and screen reader support

### Configuration Management

- **Backend**: `.terrateam/config.yml` for workflow configuration
- **Development**: Environment variables for GitHub App credentials
- **Deployment**: Docker Compose with health checks and service dependencies

## Common Development Tasks

### Starting Development Environment

```bash
# Backend only (OCaml compilation)
cd code && make debug-terrat

# Frontend development server  
cd code/src/iris && npm run dev

# Full stack with Docker
cd docker/terrat && docker-compose up
```

### Debugging Issues

- **Backend logs**: Service logs available in Docker Compose output
- **Frontend**: Browser dev tools, Svelte dev mode errors
- **API issues**: Check OpenAPI schema alignment with `npm run check-api-types`
- **Build failures**: Often caused by missing dependencies in `pds.conf`

### Performance Optimization

- **Backend**: OCaml's native compilation provides excellent performance
- **Frontend**: Vite's HMR and code splitting handle development speed
- **Database**: PostgreSQL with proper indexing for work manifest queries
- **Caching**: Strategic caching in backend services, real-time updates in frontend

## Important Notes

### Enterprise vs OSS

The codebase contains both OSS and Enterprise Edition components. Enterprise features (RBAC, centralized config, gatekeeper) are separate modules but share the same codebase structure.

### GitHub Integration

Deep GitHub integration requires proper GitHub App setup with webhooks, OAuth, and API access. The `terratunnel` service handles webhook routing for self-hosted deployments.

### Tag Query Language

This is a core differentiator - server-side filtering with powerful query syntax. Frontend should always use this rather than client-side filtering for performance at scale.

### Database Considerations

PostgreSQL is the primary datastore. Work manifest and dirspace tables are heavily queried - ensure proper indexing when adding new query patterns.

## Testing Philosophy

- **OCaml**: Comprehensive unit tests with `make test-terrat`
- **Frontend**: TypeScript compilation + Svelte validation + unused code detection
- **Integration**: Docker Compose stack tests full GitHub integration flow
- **Manual**: GitHub webhook testing requires real GitHub App setup