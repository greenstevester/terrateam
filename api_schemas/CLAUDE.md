# CLAUDE.md - Schemas & Configuration Layer

This file provides guidance for Claude Code when working with Terrateam's schema definitions, API specifications, and configuration management.

## Schema Architecture Overview

Terrateam uses a **schema-first approach** with OpenAPI specifications and JSON Schema validation to ensure type safety across the entire application stack, from API definitions to configuration files.

## Schema Categories

### 1. **Core API Schemas**

#### **`api_schemas/terrat/api.json`** - Main API Specification
- **Type**: OpenAPI 3.0 specification
- **Purpose**: Primary Terrateam REST API definition
- **Scope**: All Terrateam backend endpoints
- **Code Generation**: OCaml types (`terrat_api/*.ml`) + TypeScript types
- **Validation**: Request/response validation and documentation

**Key Schema Components:**
```json
{
  "components": {
    "schemas": {
      "dirspace-state": {
        "enum": ["aborted", "failure", "queued", "running", "success", "unknown"]
      },
      "work-manifest": {
        "properties": {
          "id": { "type": "string" },
          "state": { "$ref": "#/components/schemas/dirspace-state" }
        }
      }
    }
  }
}
```

#### **`api_schemas/terrat/config-schema.json`** - Configuration Validation
- **Type**: JSON Schema (Draft 7)
- **Purpose**: Validate `.terrateam/config.yml` files
- **Features**: Repository configuration validation and IntelliSense
- **Code Generation**: OCaml validation types (`terrat_repo_config/*.ml`)

**Configuration Schema Structure:**
```json
{
  "$ref": "#/definitions/version-1",
  "definitions": {
    "access-control": {
      "properties": {
        "apply_require_all_dirspace_access": { "type": "boolean" },
        "policies": { 
          "items": { "$ref": "#/definitions/access-control-policy" }
        }
      }
    }
  }
}
```

#### **`api_schemas/terrat/continuations.json`** - Async Operations
- **Type**: JSON Schema
- **Purpose**: Define long-running operation states and continuations
- **Integration**: Work manifest state management

### 2. **VCS Integration Schemas**

#### **GitHub Integration**

**`api_schemas/github_api/api.github.com.json`**
- **Type**: OpenAPI specification 
- **Purpose**: GitHub REST API client generation
- **Code Generation**: OCaml GitHub client (`githubc2/*.ml`)
- **Features**: Complete GitHub API type coverage

**`api_schemas/github_webhooks/terrat-schema.json`**
- **Type**: JSON Schema
- **Purpose**: Validate incoming GitHub webhook payloads
- **Code Generation**: Webhook parser (`terrat_github_webhooks/*.ml`)
- **Security**: Payload validation and type safety

#### **GitLab Integration**

**`api_schemas/gitlab_api/api.json`**
- **Type**: OpenAPI specification
- **Purpose**: GitLab REST API client generation  
- **Code Generation**: OCaml GitLab client (`gitlabc/*.ml`)

**`api_schemas/gitlab_api/webhooks.json`**
- **Type**: JSON Schema
- **Purpose**: GitLab webhook payload validation
- **Code Generation**: GitLab webhook parser (`gitlab_webhooks/*.ml`)

### 3. **Configuration Files**

#### **`.terrateam/config.yml`** - Repository Configuration
Primary configuration file for Terrateam workflows:

```yaml
# Apply requirements and policies
apply_requirements:
  create_completed_apply_check_on_noop: true

# File change detection
when_modified:
  file_patterns: []
  autoplan_draft_pr: false

# Directory-specific configuration
dirs:
  'code':
    tags: ['code']
    when_modified:
      file_patterns: ['${DIR}/**/*']

# Workflow definitions
workflows:
  - tag_query: code
    lock_policy: none
    engine:
      name: custom
    plan:
      - type: run
        cmd: ['${TERRATEAM_ROOT}/bin/verify-commit-msg']
      - type: plan
```

## Code Generation Pipeline

### Schema → Code Generation Flow

```bash
# 1. OpenAPI → OCaml Types
api_schemas/terrat/api.json 
  → make terrat-api 
  → openapi_cli convert 
  → code/src/terrat_api/*.ml

# 2. JSON Schema → OCaml Validation
api_schemas/terrat/config-schema.json
  → make terrat-repo-config
  → json_schema_hooks_cli convert
  → code/src/terrat_repo_config/*.ml

# 3. OpenAPI → TypeScript Types  
api_schemas/terrat/api.json
  → npm run generate-api-types
  → code/src/iris/src/lib/api-types-generated.ts
```

### Build System Integration

**Makefile Targets:**
```makefile
# Generate all schemas
terrat-schemas: terrat-api terrat-repo-config terrat-webhooks github-api gitlab-api

# Individual schema generation
terrat-api: debug_openapi_cli release_openapi_cli
	openapi_cli convert --input api.json --output-dir ./src/terrat_api

terrat-repo-config: debug_json_schema_hooks_cli release_json_schema_hooks_cli
	json_schema_hooks_cli convert --input config-schema.json --output-dir ./src/terrat_repo_config
```

## Development Commands

### Schema Development

```bash
# Regenerate all API types
cd code/
make terrat-schemas

# Regenerate specific schemas
make terrat-api              # Main API
make terrat-repo-config      # Configuration validation
make github-api              # GitHub API client
make gitlab-api              # GitLab API client

# Format generated code
find src/terrat_api -type f -exec ocamlformat -i '{}' \;
```

### Frontend Schema Updates

```bash
cd code/src/iris/

# Generate TypeScript types from OpenAPI
npm run generate-api-types

# Validate API type alignment
npm run check-api-types

# Type checking with updated schemas
npm run type-check
```

### Configuration Validation

```bash
# Validate Terrateam configuration
terrateam validate-config .terrateam/config.yml

# JSON Schema validation (manual)
jsonschema -i .terrateam/config.yml api_schemas/terrat/config-schema.json
```

## Schema Design Patterns

### 1. **Type-Safe API Contracts**

**OpenAPI Design:**
```json
{
  "paths": {
    "/api/v1/installations/{installation_id}/work-manifests": {
      "get": {
        "parameters": [
          {
            "name": "installation_id", 
            "in": "path",
            "required": true,
            "schema": { "type": "string" }
          }
        ],
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/work-manifest-list"
                }
              }
            }
          }
        }
      }
    }
  }
}
```

**Generated OCaml Types:**
```ocaml
type work_manifest = {
  id : string;
  state : dirspace_state;
  created_at : string;
}

type work_manifest_list = work_manifest list
```

### 2. **Configuration Schema Validation**

**JSON Schema Pattern:**
```json
{
  "definitions": {
    "workflow": {
      "type": "object",
      "required": ["tag_query"],
      "properties": {
        "tag_query": { "type": "string" },
        "lock_policy": {
          "enum": ["strict", "none", "apply_only"]
        }
      }
    }
  }
}
```

**Runtime Validation:**
```ocaml
let validate_config config_yaml =
  match Terrat_repo_config.of_yojson config_yaml with
  | Ok config -> config
  | Error msg -> failwith ("Invalid configuration: " ^ msg)
```

### 3. **Webhook Payload Validation**

**Security-First Approach:**
```json
{
  "definitions": {
    "github-webhook-push": {
      "required": ["ref", "commits", "repository"],
      "properties": {
        "ref": { "type": "string" },
        "commits": {
          "type": "array",
          "items": { "$ref": "#/definitions/github-commit" }
        }
      }
    }
  }
}
```

## Configuration Management

### Repository Configuration

#### **Workflow Definitions**
```yaml
workflows:
  - tag_query: "environment:production"
    apply_requirements:
      - type: approved
    lock_policy: strict
    
  - tag_query: "environment:development"  
    lock_policy: none
    autoplan: true
```

#### **Access Control Policies**
```yaml
access_control:
  policies:
    - tag_query: "environment:production"
      users: ["admin-team"]
      apply_require_all_dirspace_access: true
      
    - tag_query: "environment:development"
      users: ["dev-team"] 
      plan_require_all_dirspace_access: false
```

#### **Directory Configuration**
```yaml
dirs:
  'terraform/environments/prod':
    tags: ['production', 'critical']
    when_modified:
      file_patterns: ['${DIR}/**/*.tf']
      
  'terraform/environments/dev':
    tags: ['development']
    autoplan: true
```

### Global Configuration

#### **Apply Requirements**
```yaml
apply_requirements:
  create_completed_apply_check_on_noop: true
  create_pending_apply_check_on_plan: true
```

#### **Cost Estimation**
```yaml
cost_estimation:
  enabled: true
  currency: "USD"
  include_usage_costs: true
```

## Special Libraries & Dependencies

### Code Generation Tools

#### **OpenAPI Code Generation**
- **Tool**: `openapi_cli` (custom OCaml tool)
- **Purpose**: Generate type-safe OCaml API clients
- **Features**: Non-strict records, custom naming, validation

#### **JSON Schema Processing**  
- **Tool**: `json_schema_hooks_cli` (custom OCaml tool)
- **Purpose**: Generate OCaml validation code from JSON Schema
- **Features**: Recursive schema resolution, custom types

#### **Frontend Type Generation**
- **Tool**: `openapi-typescript` (npm package)
- **Purpose**: Generate TypeScript types from OpenAPI
- **Integration**: Vite build process and type checking

### Validation Libraries

#### **OCaml Validation**
- **Library**: Custom validators generated from schemas
- **Runtime**: Yojson-based validation with detailed error messages
- **Performance**: Compile-time optimized validation

#### **Frontend Validation**
- **Library**: Zod for runtime validation
- **Integration**: API response validation and form validation
- **Type Safety**: Full TypeScript integration

## Schema Versioning & Migration

### API Versioning Strategy

```json
{
  "info": {
    "version": "1.0.0",
    "title": "Terrateam API"
  },
  "paths": {
    "/api/v1/": "Current stable API",
    "/api/v2/": "Next version (beta)"
  }
}
```

### Configuration Schema Evolution

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$ref": "#/definitions/version-1",
  "definitions": {
    "version-1": {
      "properties": {
        "version": { "const": 1 }
      }
    }
  }
}
```

### Migration Procedures

1. **Backward Compatibility**: New schema versions support old formats
2. **Deprecation Warnings**: Runtime warnings for deprecated fields
3. **Gradual Migration**: Phased rollout of new schema versions
4. **Validation**: Comprehensive testing of schema changes

This schema layer provides the foundation for type safety, validation, and API consistency across the entire Terrateam platform.