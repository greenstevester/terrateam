# Terrateam Application Architecture

**A Comprehensive Analysis of the Multi-Layer Architecture**

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [High-Level Architecture Overview](#high-level-architecture-overview)
3. [Layer-by-Layer Architecture](#layer-by-layer-architecture)
4. [Architectural Patterns](#architectural-patterns)
5. [Technology Stack](#technology-stack)
6. [Data Flow Architecture](#data-flow-architecture)
7. [Security Architecture](#security-architecture)
8. [Deployment Architecture](#deployment-architecture)
9. [API Architecture](#api-architecture)
10. [Build & Development Architecture](#build--development-architecture)

---

## Executive Summary

Terrateam is a sophisticated open-source Terraform automation platform built with a **multi-layer, schema-driven architecture**. The system is designed to handle thousands of workspaces across monorepos with GitOps workflows, policy enforcement, cost estimation, and drift detection.

### Key Architectural Principles

- **Schema-First Development**: OpenAPI specifications drive type-safe code generation
- **Modular Microservices**: 193+ OCaml modules with precise dependency management
- **Multi-Platform Deployment**: Docker containerization with multi-architecture support
- **Type Safety**: End-to-end type safety from API to UI using OCaml and TypeScript
- **Performance-Oriented**: Custom async runtime (ABB) optimized for I/O-heavy operations
- **GitOps Integration**: Deep GitHub/GitLab integration with webhook-driven workflows

---

## High-Level Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        UI[Iris Frontend<br/>Svelte + TypeScript]
        CLI[CLI Tools]
        API_CLIENT[API Clients]
    end
    
    subgraph "API Gateway"
        NGINX[Nginx Proxy]
        LB[Load Balancer]
    end
    
    subgraph "Application Layer"
        OSS[Terrat OSS<br/>OCaml Backend]
        EE[Terrat EE<br/>Enterprise Features]
        IRIS_SERVER[Iris Server<br/>Svelte SSR]
    end
    
    subgraph "Service Layer"
        VCS_GITHUB[GitHub Integration]
        VCS_GITLAB[GitLab Integration]
        TUNNEL[Terratunnel<br/>Webhook Routing]
        INDEXER[Code Indexer]
        PRICING[Pricing API]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL<br/>Primary Database)]
        CACHE[Redis Cache]
        FILES[File Storage]
    end
    
    subgraph "External Integrations"
        GITHUB[GitHub API]
        GITLAB[GitLab API]
        TERRAFORM[Terraform<br/>Execution Engine]
        INFRACOST[Infracost<br/>Cost Analysis]
    end
    
    UI --> NGINX
    CLI --> NGINX
    NGINX --> OSS
    NGINX --> EE
    NGINX --> IRIS_SERVER
    
    OSS --> VCS_GITHUB
    OSS --> VCS_GITLAB
    OSS --> DB
    
    VCS_GITHUB --> GITHUB
    VCS_GITLAB --> GITLAB
    TUNNEL --> GITHUB
    
    OSS --> TERRAFORM
    PRICING --> INFRACOST
```

---

## Layer-by-Layer Architecture

### 1. Container Layer (Docker)

The container layer provides **multi-stage, optimized containerization** with specialized images for different components.

#### Primary Container Images

```mermaid
graph LR
    subgraph "Multi-Stage Build"
        BASE[Alpine Base<br/>Build Environment]
        DEPS[Dependency<br/>Compilation]
        
        subgraph "Application Builds"
            OSS_BUILD[OSS Build]
            EE_BUILD[EE Build]
            INDEXER_BUILD[Indexer Build]
        end
        
        subgraph "Runtime Images"
            OSS_IMG[terrat-oss<br/>~200MB]
            EE_IMG[terrat-ee<br/>Enhanced]
            INDEXER_IMG[code-indexer<br/>Minimal]
            SETUP_IMG[terrateam-setup<br/>Setup Wizard]
            TUNNEL_IMG[terratunnel<br/>Webhook Router]
            PRICING_IMG[pricing-api<br/>Cost Service]
        end
    end
    
    BASE --> DEPS
    DEPS --> OSS_BUILD
    DEPS --> EE_BUILD
    DEPS --> INDEXER_BUILD
    
    OSS_BUILD --> OSS_IMG
    EE_BUILD --> EE_IMG
    INDEXER_BUILD --> INDEXER_IMG
```

**Key Features:**
- **Multi-architecture support** (AMD64/ARM64)
- **Layer caching optimization** for fast builds
- **Minimal runtime images** (Alpine-based, ~200MB)
- **libkqueue integration** for high-performance I/O

### 2. Build System (PDS/Make)

The build system uses **PDS (Package Description System)** for managing 193+ OCaml modules with precise dependency tracking.

#### Build Architecture Flow

```mermaid
graph TB
    subgraph "Configuration Files"
        PDS_CONF[pds.conf<br/>Module Definitions]
        HLL_CONF[hll.conf<br/>Project Metadata]
        HLL_PINS[hll.pins<br/>Version Pinning]
    end
    
    subgraph "PDS Build System"
        PDS_GEN[PDS Generator]
        PDS_MK[Generated pds.mk]
        MAKE[GNU Make Layer]
    end
    
    subgraph "Code Generation"
        SCHEMAS[Schema Generation]
        API_GEN[API Type Generation]
        MERLIN[IDE Integration]
    end
    
    subgraph "Build Targets"
        DEBUG[Debug Binaries]
        RELEASE[Release Binaries]
        TESTS[Test Executables]
    end
    
    PDS_CONF --> PDS_GEN
    HLL_CONF --> PDS_GEN
    HLL_PINS --> PDS_GEN
    
    PDS_GEN --> PDS_MK
    PDS_MK --> MAKE
    MAKE --> SCHEMAS
    MAKE --> API_GEN
    MAKE --> MERLIN
    
    MAKE --> DEBUG
    MAKE --> RELEASE
    MAKE --> TESTS
```

**Module Dependency Architecture:**
- **193+ OCaml modules** organized by functional domains
- **ABB Framework**: Application Building Blocks for async operations
- **BRTL Framework**: Web framework components
- **Domain Modules**: Terraform-specific business logic

### 3. Backend (OCaml)

The backend is built with a **sophisticated OCaml architecture** featuring custom frameworks and domain-driven design.

#### Core Framework Architecture

```mermaid
graph TB
    subgraph "ABB Framework (Async Runtime)"
        ABB_CORE[abb<br/>Core Runtime]
        ABB_IO[abb_io<br/>Async I/O]
        ABB_HTTP[abb_curl<br/>HTTP Client]
        ABB_TCP[abb_tcp_server<br/>TCP Server]
        ABB_TLS[abb_tls<br/>TLS Support]
        ABB_CACHE[abb_cache<br/>LRU Cache]
    end
    
    subgraph "BRTL Framework (Web Layer)"
        BRTL_CORE[brtl<br/>Web Framework]
        BRTL_MW[brtl_mw_*<br/>Middleware]
        BRTL_STATIC[brtl_static<br/>Static Files]
    end
    
    subgraph "Terrateam Domain Logic"
        TERRAT_CORE[terrat<br/>Main Logic]
        TERRAT_CONFIG[terrat_config<br/>Configuration]
        TERRAT_VCS[terrat_vcs_*<br/>VCS Integration]
        TERRAT_WORKFLOW[terrat_workflow<br/>Workflow Engine]
        TERRAT_QUERY[terrat_tag_query<br/>Query Language]
    end
    
    ABB_CORE --> ABB_IO
    ABB_CORE --> ABB_HTTP
    ABB_CORE --> ABB_TCP
    ABB_CORE --> ABB_TLS
    ABB_CORE --> ABB_CACHE
    
    BRTL_CORE --> BRTL_MW
    BRTL_CORE --> BRTL_STATIC
    
    ABB_CORE --> BRTL_CORE
    BRTL_CORE --> TERRAT_CORE
    TERRAT_CORE --> TERRAT_CONFIG
    TERRAT_CORE --> TERRAT_VCS
    TERRAT_CORE --> TERRAT_WORKFLOW
    TERRAT_CORE --> TERRAT_QUERY
```

**Key Backend Patterns:**
- **High-performance async runtime** with platform-specific optimizations
- **Result-based error handling** with comprehensive error types
- **Domain-driven module organization** (193+ modules)
- **Type-safe API layer** with generated OCaml types

### 4. Frontend (Iris - Svelte)

The frontend is a **modern Svelte-based SPA** with comprehensive TypeScript integration and accessibility features.

#### Frontend Architecture

```mermaid
graph TB
    subgraph "Frontend Stack"
        SVELTE[Svelte 4 Framework]
        TS[TypeScript Integration]
        VITE[Vite 5 Build System]
        TAILWIND[Tailwind CSS]
        ICONS[Iconify Icons]
    end
    
    subgraph "Component Architecture"
        PAGE_LAYOUT[PageLayout<br/>Standard Layout]
        UI_COMPONENTS[UI Components<br/>Button, Card, etc.]
        FORM_COMPONENTS[Form Components]
        BUSINESS_COMPONENTS[Business Logic<br/>Components]
    end
    
    subgraph "State Management"
        STORES[Svelte Stores]
        API_CLIENT[Type-Safe API Client]
        HOOKS[Custom Hooks]
        AUTH[Authentication State]
    end
    
    subgraph "Core Features"
        DASHBOARD[Dashboard & Navigation]
        REPO_MGT[Repository Management]
        WORK_MANIFESTS[Work Manifest Tracking]
        TAG_QUERY[Tag Query Language UI]
        SEARCH[Advanced Search System]
    end
    
    SVELTE --> TS
    SVELTE --> VITE
    SVELTE --> TAILWIND
    
    PAGE_LAYOUT --> UI_COMPONENTS
    UI_COMPONENTS --> FORM_COMPONENTS
    FORM_COMPONENTS --> BUSINESS_COMPONENTS
    
    STORES --> API_CLIENT
    API_CLIENT --> HOOKS
    HOOKS --> AUTH
    
    BUSINESS_COMPONENTS --> DASHBOARD
    BUSINESS_COMPONENTS --> REPO_MGT
    BUSINESS_COMPONENTS --> WORK_MANIFESTS
    BUSINESS_COMPONENTS --> TAG_QUERY
    BUSINESS_COMPONENTS --> SEARCH
```

**Frontend Key Features:**
- **Type-safe API integration** with runtime validation
- **Accessibility-first design** with comprehensive A11y support
- **Tag Query Language** for advanced server-side filtering
- **CSP-compliant styling** (no inline styles)

### 5. Scripts & Operations Layer

The operations layer provides **automated deployment and release management** across multiple environments.

#### Operations Workflow

```mermaid
graph LR
    subgraph "Release Management"
        CREATE_TAG[create_tag<br/>Version Tagging]
        CREATE_RELEASE[create_release<br/>GitHub Releases]
        VERSION_TAG[version_tag<br/>Version Generation]
    end
    
    subgraph "Container Operations"
        CREATE_MANIFEST[create_manifest<br/>Multi-arch Images]
        BASE_IMAGE[base_image<br/>Build Optimization]
    end
    
    subgraph "Deployment"
        DEPLOY_ECS[deploy_ecs<br/>AWS ECS]
        DEPLOY_FLY[deploy_flyio<br/>Fly.io]
        TRIGGER_DEPLOY[trigger_deploy<br/>Multi-env]
    end
    
    subgraph "Notifications"
        NOTIFY_SLACK[notify_slack<br/>Team Updates]
        NOTIFY_MATRIX[notify_matrix<br/>Matrix Chat]
    end
    
    CREATE_TAG --> CREATE_RELEASE
    CREATE_RELEASE --> CREATE_MANIFEST
    CREATE_MANIFEST --> DEPLOY_ECS
    CREATE_MANIFEST --> DEPLOY_FLY
    DEPLOY_ECS --> NOTIFY_SLACK
    DEPLOY_FLY --> NOTIFY_MATRIX
```

### 6. Schemas & Configuration Layer

The schema layer implements a **schema-first architecture** with comprehensive type generation and validation.

#### Schema Generation Pipeline

```mermaid
graph TB
    subgraph "Schema Sources"
        API_SCHEMA[api.json<br/>OpenAPI 3.0]
        CONFIG_SCHEMA[config-schema.json<br/>JSON Schema]
        WEBHOOK_SCHEMAS[Webhook Schemas<br/>GitHub/GitLab]
    end
    
    subgraph "Code Generation"
        OPENAPI_CLI[openapi_cli<br/>OCaml Generator]
        JSON_SCHEMA_CLI[json_schema_hooks_cli<br/>Validation Generator]
        TS_GENERATOR[openapi-typescript<br/>TypeScript Generator]
    end
    
    subgraph "Generated Code"
        OCAML_TYPES[OCaml API Types<br/>terrat_api/*.ml]
        OCAML_VALIDATION[OCaml Validators<br/>terrat_repo_config/*.ml]
        TS_TYPES[TypeScript Types<br/>api-types-generated.ts]
    end
    
    subgraph "Runtime Usage"
        BACKEND[Backend Type Safety]
        FRONTEND[Frontend Type Safety]
        CONFIG_VALIDATION[Config Validation]
    end
    
    API_SCHEMA --> OPENAPI_CLI
    CONFIG_SCHEMA --> JSON_SCHEMA_CLI
    API_SCHEMA --> TS_GENERATOR
    
    OPENAPI_CLI --> OCAML_TYPES
    JSON_SCHEMA_CLI --> OCAML_VALIDATION
    TS_GENERATOR --> TS_TYPES
    
    OCAML_TYPES --> BACKEND
    TS_TYPES --> FRONTEND
    OCAML_VALIDATION --> CONFIG_VALIDATION
```

---

## Architectural Patterns

### 1. Schema-Driven Architecture

**Pattern**: All APIs and configurations are defined in schemas first, then code is generated.

```mermaid
graph LR
    SCHEMA[OpenAPI/JSON Schema] --> GENERATION[Code Generation]
    GENERATION --> BACKEND[OCaml Types]
    GENERATION --> FRONTEND[TypeScript Types]
    GENERATION --> VALIDATION[Runtime Validation]
    
    BACKEND --> CONSISTENCY[Type Consistency]
    FRONTEND --> CONSISTENCY
    VALIDATION --> CONSISTENCY
```

**Benefits:**
- **Type safety** across the entire stack
- **API consistency** between frontend and backend  
- **Automatic documentation** from schemas
- **Validation** at compile-time and runtime

### 2. Domain-Driven Design (DDD)

**Pattern**: 193+ modules organized by business domains rather than technical layers.

**Domain Organization:**
- **VCS Integration**: `terrat_vcs_*`, `terrat_github`, `terrat_gitlab`
- **Workflow Management**: `terrat_change`, `terrat_work_manifest3`, `terrat_dirspace`
- **Authentication**: `terrat_access_control2`, `terrat_user`, `terrat_session`
- **Query System**: `terrat_tag_query`, `terrat_sql_of_tag_query`

### 3. Layered Architecture

**Pattern**: Clear separation of concerns across architectural layers.

```mermaid
graph TB
    subgraph "Presentation Layer"
        UI[Svelte UI Components]
        API_ENDPOINTS[REST API Endpoints]
    end
    
    subgraph "Application Layer"
        BUSINESS_LOGIC[Business Logic Services]
        WORKFLOW_ENGINE[Workflow Engine]
    end
    
    subgraph "Domain Layer"
        DOMAIN_MODELS[Domain Models]
        DOMAIN_SERVICES[Domain Services]
    end
    
    subgraph "Infrastructure Layer"
        DATABASE[Database Access]
        EXTERNAL_APIS[External API Clients]
        FILE_SYSTEM[File System Access]
    end
    
    UI --> BUSINESS_LOGIC
    API_ENDPOINTS --> BUSINESS_LOGIC
    BUSINESS_LOGIC --> WORKFLOW_ENGINE
    WORKFLOW_ENGINE --> DOMAIN_MODELS
    DOMAIN_MODELS --> DOMAIN_SERVICES
    DOMAIN_SERVICES --> DATABASE
    DOMAIN_SERVICES --> EXTERNAL_APIS
    DOMAIN_SERVICES --> FILE_SYSTEM
```

### 4. Event-Driven Architecture

**Pattern**: Webhook-driven workflows with asynchronous processing.

```mermaid
sequenceDiagram
    participant GH as GitHub
    participant TT as Terratunnel
    participant TE as Terrateam
    participant DB as Database
    participant TF as Terraform
    
    GH->>TT: Webhook (PR Event)
    TT->>TE: Route Webhook
    TE->>DB: Store Work Manifest
    TE->>TF: Execute Plan/Apply
    TF->>TE: Return Results
    TE->>DB: Update Manifest
    TE->>GH: Post Status Check
```

### 5. Microservices Architecture

**Pattern**: Specialized services for different concerns.

```mermaid
graph TB
    subgraph "Core Services"
        TERRAT_OSS[Terrat OSS<br/>Main Application]
        TERRAT_EE[Terrat EE<br/>Enterprise Features]
        IRIS[Iris<br/>Frontend Server]
    end
    
    subgraph "Supporting Services"
        TUNNEL[Terratunnel<br/>Webhook Routing]
        INDEXER[Code Indexer<br/>Repository Analysis]
        PRICING[Pricing API<br/>Cost Estimation]
        SETUP[Setup Wizard<br/>Initial Configuration]
    end
    
    subgraph "Data Services"
        POSTGRES[PostgreSQL<br/>Primary Data]
        REDIS[Redis<br/>Caching]
    end
    
    TERRAT_OSS --> POSTGRES
    TERRAT_EE --> POSTGRES
    TERRAT_OSS --> REDIS
    TUNNEL --> TERRAT_OSS
    INDEXER --> TERRAT_OSS
    PRICING --> TERRAT_OSS
```

---

## Technology Stack

### Backend Technologies

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Runtime** | OCaml 5.3.0+ | High-performance functional programming |
| **Async Framework** | ABB (Custom) | Custom async runtime with platform optimizations |
| **Web Framework** | BRTL (Custom) | Type-safe web framework built on ABB |
| **Database** | PostgreSQL 14.5+ | Primary data store |
| **Caching** | Redis | Session and data caching |
| **Build System** | PDS + Make | Modular build with precise dependencies |

### Frontend Technologies

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | Svelte 4 | Reactive frontend framework |
| **Language** | TypeScript | Type-safe JavaScript |
| **Build Tool** | Vite 5 | Fast development and build |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Icons** | Iconify | Comprehensive icon system |
| **State Management** | Svelte Stores | Reactive state management |

### Infrastructure Technologies

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Containerization** | Docker | Multi-stage builds and deployment |
| **Orchestration** | Docker Compose | Local development and self-hosted |
| **Cloud Platforms** | AWS ECS, Fly.io | Production deployment |
| **Networking** | Nginx | Reverse proxy and load balancing |
| **Monitoring** | Custom Health Checks | Service health and availability |

---

## Data Flow Architecture

### Request Processing Flow

```mermaid
sequenceDiagram
    participant C as Client (Iris UI)
    participant N as Nginx
    participant B as Backend (OCaml)
    participant D as Database
    participant G as GitHub API
    participant T as Terraform
    
    Note over C,T: Work Manifest Creation Flow
    
    C->>N: POST /api/v1/work-manifests
    N->>B: Route to Backend
    B->>D: Validate & Store Work Manifest
    B->>G: Fetch Repository Data
    B->>T: Execute Terraform Plan
    T->>B: Plan Results
    B->>D: Update Work Manifest State
    B->>G: Post Status Check
    B->>C: Return Work Manifest Response
    
    Note over C,T: Tag Query Search Flow
    
    C->>N: GET /api/v1/dirspaces?q=state:success
    N->>B: Route Query
    B->>D: Execute Tag Query SQL
    D->>B: Return Filtered Results
    B->>C: Return Paginated Response
```

### Data Model Architecture

```mermaid
erDiagram
    INSTALLATION ||--o{ REPOSITORY : has
    INSTALLATION ||--o{ USER_INSTALLATION : grants_access
    REPOSITORY ||--o{ WORK_MANIFEST : contains
    WORK_MANIFEST ||--o{ DIRSPACE : includes
    WORK_MANIFEST ||--o{ OUTPUT : generates
    DIRSPACE }o--|| TERRAFORM_WORKSPACE : represents
    
    INSTALLATION {
        string id PK
        string github_installation_id
        string name
        timestamp created_at
    }
    
    REPOSITORY {
        string id PK
        string installation_id FK
        string name
        string full_name
        boolean active
    }
    
    WORK_MANIFEST {
        string id PK
        string repository_id FK
        string state
        string type
        string branch
        timestamp created_at
        jsonb metadata
    }
    
    DIRSPACE {
        string id PK
        string work_manifest_id FK
        string directory
        string workspace
        string state
        jsonb terraform_config
    }
```

---

## Security Architecture

### Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant U as User
    participant I as Iris Frontend
    participant G as GitHub OAuth
    participant B as Backend
    participant D as Database
    
    Note over U,D: OAuth Authentication Flow
    
    U->>I: Access Protected Resource
    I->>G: Redirect to GitHub OAuth
    G->>U: Request Authorization
    U->>G: Grant Authorization
    G->>I: Return with Authorization Code
    I->>B: Exchange Code for Tokens
    B->>G: Validate with GitHub API
    G->>B: Return User Info
    B->>D: Store/Update User Session
    B->>I: Return Session Token
    I->>U: Grant Access to Resources
```

### Security Layers

1. **Transport Security**: TLS encryption for all communications
2. **Authentication**: GitHub OAuth with session management
3. **Authorization**: Role-based access control (RBAC) in Enterprise
4. **Input Validation**: Schema-based validation for all inputs
5. **SQL Injection Protection**: Parameterized queries and ORM
6. **XSS Protection**: Content Security Policy (CSP) compliance
7. **Webhook Security**: HMAC signature verification

---

## Deployment Architecture

### Self-Hosted Deployment

```mermaid
graph TB
    subgraph "External Services"
        GH[GitHub]
        GL[GitLab]
        TUNNEL_SVC[Terratunnel Service]
    end
    
    subgraph "Self-Hosted Infrastructure"
        subgraph "Docker Compose Stack"
            NGINX[Nginx Proxy]
            TERRAT[Terrateam Server]
            DB[PostgreSQL]
            TUNNEL[Terratunnel Client]
            SETUP[Setup Wizard]
        end
        
        subgraph "Optional Services"
            PRICING_LOCAL[Pricing API]
            REDIS_LOCAL[Redis Cache]
        end
    end
    
    GH --> TUNNEL_SVC
    GL --> TUNNEL_SVC
    TUNNEL_SVC --> TUNNEL
    TUNNEL --> TERRAT
    NGINX --> TERRAT
    TERRAT --> DB
    TERRAT --> PRICING_LOCAL
```

### Cloud Deployment (Production)

```mermaid
graph TB
    subgraph "Load Balancer Tier"
        LB[Application Load Balancer]
        CDN[CloudFront CDN]
    end
    
    subgraph "Application Tier"
        ECS_CLUSTER[ECS Cluster]
        subgraph "ECS Services"
            TERRAT_SVC[Terrateam Service]
            IRIS_SVC[Iris Service]
            TUNNEL_SVC[Tunnel Service]
        end
    end
    
    subgraph "Data Tier"
        RDS[RDS PostgreSQL]
        ELASTICACHE[ElastiCache Redis]
        S3[S3 Storage]
    end
    
    subgraph "External Integrations"
        GITHUB_API[GitHub API]
        GITLAB_API[GitLab API]
        INFRACOST_API[Infracost API]
    end
    
    CDN --> LB
    LB --> ECS_CLUSTER
    TERRAT_SVC --> RDS
    TERRAT_SVC --> ELASTICACHE
    TERRAT_SVC --> S3
    TERRAT_SVC --> GITHUB_API
    TERRAT_SVC --> GITLAB_API
    TERRAT_SVC --> INFRACOST_API
```

---

## API Architecture

### RESTful API Design

The API follows **OpenAPI 3.0 specifications** with comprehensive type generation and validation.

#### Core API Endpoints

```mermaid
graph LR
    subgraph "Authentication"
        AUTH_WHOAMI["/whoami<br/>Current User"]
        AUTH_GITHUB["/github/whoami<br/>GitHub User"]
        AUTH_LOGOUT["/logout<br/>Session End"]
    end
    
    subgraph "Installations"
        INST_LIST["/user/github/installations<br/>List Installations"]
        INST_REPOS["/installations/{id}/repos<br/>Repository List"]
        INST_REFRESH["/installations/{id}/repos/refresh<br/>Sync Repos"]
    end
    
    subgraph "Work Manifests"
        WM_LIST["/installations/{id}/work-manifests<br/>List Operations"]
        WM_CREATE["/work-manifests/{id}/initiate<br/>Start Operation"]
        WM_OUTPUTS["/work-manifests/{id}/outputs<br/>Get Logs"]
        WM_PLANS["/work-manifests/{id}/plans<br/>Terraform Plans"]
    end
    
    subgraph "Advanced Features"
        DIRSPACES["/installations/{id}/dirspaces<br/>Directory/Workspace"]
        DRIFTS["/admin/drifts<br/>Drift Detection"]
        TASKS["/tasks/{id}<br/>Task Status"]
    end
```

#### API Patterns

1. **RFC 5988 Link Header Pagination**: Same as GitHub API
2. **Type-Safe Responses**: Generated from OpenAPI schemas
3. **Comprehensive Error Handling**: Structured error responses
4. **Tag Query Language**: Server-side filtering with powerful query syntax

### Tag Query Language Architecture

The **Tag Query Language** enables powerful server-side filtering of operations.

#### Query Architecture

```mermaid
graph LR
    subgraph "Frontend"
        SEARCH_UI[Search Interface]
        QUERY_BUILDER[Query Builder]
        FILTER_BUTTONS[Quick Filters]
    end
    
    subgraph "API Layer"
        QUERY_PARAM[?q= Parameter]
        REPO_SCOPING[Automatic repo: Filter]
    end
    
    subgraph "Backend Processing"
        LEXER[Tag Query Lexer]
        PARSER[Tag Query Parser]
        AST[Abstract Syntax Tree]
        SQL_GEN[SQL Generator]
    end
    
    subgraph "Database"
        POSTGRES[PostgreSQL]
        INDEXES[Optimized Indexes]
    end
    
    SEARCH_UI --> QUERY_BUILDER
    QUERY_BUILDER --> QUERY_PARAM
    QUERY_PARAM --> REPO_SCOPING
    REPO_SCOPING --> LEXER
    LEXER --> PARSER
    PARSER --> AST
    AST --> SQL_GEN
    SQL_GEN --> POSTGRES
```

**Query Examples:**
- `state:success and user:josh`
- `type:apply and branch:main`
- `created_at:2024-01-01.. and environment:production`
- `pr:123 and state:failure`

---

## Build & Development Architecture

### Development Workflow

```mermaid
graph TB
    subgraph "Schema Development"
        SCHEMA_EDIT[Edit OpenAPI/JSON Schema]
        SCHEMA_GEN[Generate Types]
        SCHEMA_VALIDATE[Validate Schemas]
    end
    
    subgraph "Backend Development"
        OCAML_DEV[OCaml Implementation]
        PDS_BUILD[PDS Build System]
        OCAML_TESTS[OCaml Tests]
    end
    
    subgraph "Frontend Development"
        SVELTE_DEV[Svelte Components]
        TS_CHECK[TypeScript Checking]
        SVELTE_TESTS[Frontend Tests]
    end
    
    subgraph "Integration & Deployment"
        DOCKER_BUILD[Docker Build]
        INTEGRATION_TESTS[Integration Tests]
        DEPLOYMENT[Deployment]
    end
    
    SCHEMA_EDIT --> SCHEMA_GEN
    SCHEMA_GEN --> OCAML_DEV
    SCHEMA_GEN --> SVELTE_DEV
    
    OCAML_DEV --> PDS_BUILD
    PDS_BUILD --> OCAML_TESTS
    
    SVELTE_DEV --> TS_CHECK
    TS_CHECK --> SVELTE_TESTS
    
    OCAML_TESTS --> DOCKER_BUILD
    SVELTE_TESTS --> DOCKER_BUILD
    DOCKER_BUILD --> INTEGRATION_TESTS
    INTEGRATION_TESTS --> DEPLOYMENT
```

### Quality Assurance Pipeline

```mermaid
graph LR
    subgraph "Code Quality"
        TS_COMPILE[TypeScript<br/>Compilation]
        SVELTE_CHECK[Svelte Type<br/>Checking]
        OCAML_COMPILE[OCaml<br/>Compilation]
    end
    
    subgraph "API Validation"
        SCHEMA_VALIDATE[Schema<br/>Validation]
        API_TYPE_CHECK[API Type<br/>Alignment]
        COMPONENT_STD[Component<br/>Standards]
    end
    
    subgraph "Code Analysis"
        UNUSED_CODE[Unused Code<br/>Detection - Knip]
        SECURITY_SCAN[Security<br/>Scanning]
        PERFORMANCE[Performance<br/>Testing]
    end
    
    TS_COMPILE --> SCHEMA_VALIDATE
    SVELTE_CHECK --> API_TYPE_CHECK
    OCAML_COMPILE --> COMPONENT_STD
    
    SCHEMA_VALIDATE --> UNUSED_CODE
    API_TYPE_CHECK --> SECURITY_SCAN
    COMPONENT_STD --> PERFORMANCE
```

---

## Conclusion

Terrateam's architecture represents a sophisticated, multi-layer system designed for **scale, type safety, and maintainability**. The combination of OCaml's performance and type safety with Svelte's modern UI capabilities, all orchestrated through a schema-driven approach, provides a robust foundation for enterprise Terraform automation.

### Key Architectural Strengths

1. **Type Safety**: End-to-end type safety from database to UI
2. **Performance**: Custom async runtime optimized for I/O operations
3. **Modularity**: 193+ modules with precise dependency management
4. **Scalability**: Microservices architecture with container orchestration
5. **Developer Experience**: Schema-driven development with generated types
6. **Security**: Comprehensive security layers with OAuth and RBAC
7. **Deployment Flexibility**: Support for self-hosted and cloud deployments

This architecture enables Terrateam to handle enterprise-scale Terraform operations while maintaining developer productivity and system reliability.