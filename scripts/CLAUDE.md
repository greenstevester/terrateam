# CLAUDE.md - Scripts & Operations Layer

This file provides guidance for Claude Code when working with Terrateam's deployment and operational scripts.

## Operations Architecture Overview

Terrateam uses a comprehensive set of bash scripts to handle deployment, release management, and operational tasks across multiple environments and platforms.

## Script Categories

### 1. **Release Management**

#### **`create_release`**
- **Purpose**: Automate GitHub release creation with release notes
- **Features**: Tag validation, changelog generation, asset upload
- **Integration**: GitHub CLI and API integration
- **Usage**: `./create_release v1.2.3`

#### **`create_tag`**  
- **Purpose**: Create and push Git tags with proper formatting
- **Validation**: Semantic version validation
- **Integration**: Git operations and GitHub integration

#### **`version_tag`**
- **Purpose**: Generate consistent version tags from Git metadata
- **Output**: Standardized version strings for builds

#### **`is_latest_version_tag`**
- **Purpose**: Determine if current tag represents latest stable version
- **Logic**: Semantic version comparison and branch validation

### 2. **Container Operations**

#### **`create_manifest`**
- **Purpose**: Create multi-architecture Docker manifests
- **Platforms**: AMD64 and ARM64 support
- **Registry**: GitHub Container Registry (GHCR) integration
- **Features**:
  ```bash
  # Multi-arch manifest creation
  docker manifest create ghcr.io/terrateamio/terrat-oss:v1.2.3 \
    --amend ghcr.io/terrateamio/terrat-oss:v1.2.3-amd64 \
    --amend ghcr.io/terrateamio/terrat-oss:v1.2.3-arm64
  ```

#### **`base_image`**
- **Purpose**: Manage Docker base image versioning and caching
- **Optimization**: Build layer optimization for faster builds

### 3. **Deployment Scripts**

#### **`deploy_ecs`**
- **Purpose**: AWS ECS deployment automation
- **Features**:
  - Task definition updates
  - Service deployment with rolling updates
  - Health check validation
  - Rollback capability
- **Flow**:
  ```bash
  1. Fetch current ECS service configuration
  2. Update task definition with new image
  3. Deploy new task definition  
  4. Wait for deployment completion
  5. Validate service health
  ```

#### **`deploy_flyio`**
- **Purpose**: Fly.io deployment automation
- **Features**: Simple deployment with health checks
- **Usage**: Lightweight alternative deployment target

#### **`trigger_deploy`**
- **Purpose**: Orchestrate deployment across multiple environments
- **Logic**: Environment-specific deployment triggers

### 4. **Notification Systems**

#### **`notify_slack`**
- **Purpose**: Slack notifications for releases and deployments
- **Features**:
  - Rich Slack message formatting
  - Release notes extraction from GitHub
  - Environment-specific notifications
  - Webhook integration
- **Message Format**:
  ```json
  {
    "attachments": [{
      "title": "Release v1.2.3",
      "text": "• Feature updates\n• Bug fixes",
      "color": "#36a64f"
    }]
  }
  ```

#### **`notify_matrix`**
- **Purpose**: Matrix chat notifications
- **Integration**: Matrix protocol for team communications
- **Format**: Structured notifications with release information

### 5. **Frontend-Specific Scripts**

Located in `code/src/iris/scripts/`:

#### **`dev-setup.sh`**
- **Purpose**: Development environment setup with SSL
- **Features**:
  - Nginx reverse proxy configuration
  - SSL certificate generation  
  - Development server initialization
  - Environment variable setup

#### **`dev-cleanup.sh`**
- **Purpose**: Clean development environment
- **Actions**: Stop services, clean certificates, reset state

#### **`download-icons.js`**
- **Purpose**: Download and process icon assets
- **Integration**: Iconify and asset optimization
- **Usage**: `npm run download-icons`

## Environment Configuration

### Environment Variables

#### **Required for CI/CD**
```bash
# GitHub Integration
GITHUB_TOKEN=ghp_token
GITHUB_REPOSITORY=terrateamio/terrateam
GITHUB_REPOSITORY_OWNER=terrateamio
GITHUB_REF=refs/heads/main

# Container Registry  
CONTAINER_REGISTRY=ghcr.io
VERSION_TAG=v1.2.3

# Environment Control
TERRATEAM_ENVIRONMENT=production  # or staging, development
```

#### **AWS Deployment**
```bash
# ECS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
ECS_CLUSTER_NAME=terrateam-app
ECS_SERVICE_NAME=terrateam-app-service
```

#### **Notifications**
```bash
# Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# Matrix Integration  
MATRIX_SERVER=matrix.org
MATRIX_ROOM=!room:server.com
MATRIX_TOKEN=access_token
```

## Development Commands

### Local Development

```bash
# Frontend development with SSL proxy
cd code/src/iris/
./scripts/dev-setup.sh      # Start development environment
npm run dev                 # Start in another terminal
./scripts/dev-cleanup.sh    # Clean up when done

# Asset management
npm run download-icons      # Update icon assets
```

### Release Process

```bash
# Create and deploy release
./scripts/create_tag v1.2.3
./scripts/create_release v1.2.3

# Container management
./scripts/create_manifest terrat-oss terrat-ee terratunnel

# Deployment (automatic via CI/CD)
./scripts/deploy_ecs        # AWS deployment
./scripts/deploy_flyio      # Fly.io deployment
```

### Manual Operations

```bash
# Version checking
./scripts/version_tag
./scripts/is_latest_version_tag

# Notifications (usually automated)
./scripts/notify_slack
./scripts/notify_matrix
```

## CI/CD Integration

### GitHub Actions Integration

Scripts are designed for GitHub Actions workflows:

```yaml
# Example workflow step
- name: Create Release
  run: ./scripts/create_release ${{ github.ref_name }}
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    TERRATEAM_ENVIRONMENT: production

- name: Deploy to ECS
  run: ./scripts/deploy_ecs
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### Multi-Environment Support

```bash
# Environment-specific behavior
if [[ "${TERRATEAM_ENVIRONMENT}" == "production" ]]; then
  # Production-only operations
  ./scripts/notify_slack
  PUSH_LATEST=true
fi
```

## Script Architecture Patterns

### 1. **Error Handling**
```bash
#!/usr/bin/env bash
set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Argument validation
if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <required-arg>"
  exit 1
fi
```

### 2. **Environment Detection**
```bash
# Environment-specific logic
case "${TERRATEAM_ENVIRONMENT:-development}" in
  production)
    # Production operations
    ;;
  staging)
    # Staging operations  
    ;;
  *)
    # Development/default
    ;;
esac
```

### 3. **External Tool Integration**
```bash
# GitHub CLI
gh release create "$VERSION_TAG" --generate-notes

# AWS CLI with JSON processing
aws ecs describe-services --cluster "$CLUSTER" --services "$SERVICE" | \
  jq -r '.services[0].taskDefinition'

# Docker multi-arch operations
docker manifest create "$IMAGE:$TAG" \
  --amend "$IMAGE:$TAG-amd64" \
  --amend "$IMAGE:$TAG-arm64"
```

### 4. **Notification Integration**
```bash
# Slack webhook with JSON payload
curl -X POST "$SLACK_WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -d "$PAYLOAD"
```

## Special Libraries & Dependencies

### External Tools Required

#### **Core Tools**
- `bash` 4.0+ - All scripts require modern bash
- `jq` - JSON processing and manipulation
- `curl` - HTTP requests and webhook integration
- `git` - Version control operations

#### **Container Tools**  
- `docker` - Container operations and manifest creation
- Container registry authentication (GHCR)

#### **Cloud Tools**
- `aws` CLI - AWS ECS deployments
- `flyctl` - Fly.io deployments

#### **Development Tools**
- `gh` CLI - GitHub API integration
- `npm` - Frontend asset management
- `nginx` - Development reverse proxy

### Dependency Validation

Scripts include dependency checking:
```bash
# Check required tools
command -v jq >/dev/null 2>&1 || { echo "jq required"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "docker required"; exit 1; }
```

## Operational Procedures

### Release Workflow

1. **Version Tagging**: `create_tag` creates semantic version
2. **Release Creation**: `create_release` generates GitHub release
3. **Container Build**: CI/CD builds multi-arch containers  
4. **Manifest Creation**: `create_manifest` combines architectures
5. **Deployment**: `deploy_ecs`/`deploy_flyio` updates services
6. **Notification**: `notify_slack`/`notify_matrix` alerts team

### Rollback Procedures

```bash
# ECS rollback (manual)
aws ecs update-service --cluster "$CLUSTER" --service "$SERVICE" \
  --task-definition "previous-task-def-arn"

# Container rollback
docker manifest create "$IMAGE:$PREVIOUS_TAG" # Revert manifest
```

### Monitoring & Health Checks

Scripts include health validation:
- ECS deployment status monitoring
- Container health check validation  
- Service availability verification

This operational layer provides robust, automated deployment and release management for Terrateam across multiple environments and platforms.