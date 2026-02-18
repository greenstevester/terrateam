# CLAUDE.md - Container Layer (Docker)

This file provides guidance for Claude Code when working with Terrateam's containerization and deployment infrastructure.

## Container Architecture Overview

Terrateam uses a sophisticated multi-stage Docker build system that produces multiple specialized container images for different deployment scenarios.

## Docker Images & Services

### Primary Images

#### 1. **terrat-oss** (`ghcr.io/terrateamio/terrat-oss:latest`)
- **Purpose**: Open source Terrateam server
- **Components**: OCaml backend + Iris frontend + Nginx
- **Size**: Optimized Alpine-based image (~200MB)
- **Service**: Main application server on port 8080

#### 2. **terrat-ee** (`ghcr.io/terrateamio/terrat-ee:latest`)  
- **Purpose**: Enterprise edition with additional features
- **Components**: Enhanced OCaml backend + Iris frontend + Nginx
- **Features**: RBAC, advanced policies, enterprise integrations
- **Service**: Enhanced application server on port 8080

#### 3. **code-indexer** (`ghcr.io/terrateamio/terrat-code-indexer:latest`)
- **Purpose**: Standalone code analysis and indexing service
- **Use Case**: Repository content analysis and change detection
- **Runtime**: Minimal Alpine container with indexer binary

#### 4. **terrateam-setup** (`ghcr.io/terrateamio/terrateam-setup:latest`)
- **Purpose**: Interactive setup wizard for self-hosted deployments
- **Service**: Web UI for initial configuration on port 3000
- **Features**: GitHub App setup, configuration validation

#### 5. **terratunnel** (`ghcr.io/terrateamio/terratunnel:latest`)
- **Purpose**: Webhook tunneling service for self-hosted deployments
- **Function**: Routes GitHub/GitLab webhooks to local Terrateam instance
- **Service**: Tunnel client/server on port 8081

#### 6. **cloud-pricing-api** (`ghcr.io/terrateamio/cloud-pricing-api:latest`)
- **Purpose**: Self-hosted Infracost pricing API (optional)
- **Service**: Cost estimation service on port 4000
- **Note**: Large container, only enable if needed

### Supporting Services

#### **PostgreSQL Database**
- **Image**: `postgres:14.5-alpine`
- **Purpose**: Primary data store for Terrateam
- **Configuration**: Optimized for Terraform state and metadata
- **Persistence**: Named volume with automatic backups

## Multi-Stage Build Process

### Build Architecture

The Dockerfile uses sophisticated multi-stage builds:

```dockerfile
# Stage 1: Base build environment
FROM alpine:3.22 AS build-base
# Install build dependencies: opam, OCaml, Node.js, system libs

# Stage 2: Dependency compilation  
FROM build-base AS build-setup
# Compile OCaml dependencies, PDS setup, base libraries

# Stage 3: Application-specific builds
FROM build-setup AS terrat-oss-build
FROM build-setup AS terrat-ee-build  
FROM build-setup AS code-indexer-build

# Stage 4: Final runtime images
FROM alpine:3.18 AS terrat-oss
FROM alpine:3.18 AS terrat-ee
FROM alpine:3.18 AS code-indexer
```

### Build Optimizations

1. **Layer Caching**: Dependencies built once, reused across variants
2. **Parallel Builds**: Multiple build targets from shared base
3. **Minimal Runtime**: Final images only contain runtime dependencies
4. **libkqueue Integration**: Custom kqueue library for high-performance I/O

### Special Libraries & Dependencies

#### **libkqueue** (Vendor)
- **Purpose**: Cross-platform kqueue implementation for high-performance I/O
- **Build**: Custom CMake build from `vendor/libkqueue`
- **Integration**: OCaml bindings for async I/O in ABB framework

#### **System Dependencies**
```bash
# Build-time dependencies
opam ocamlformat cmake clang cargo rust npm python3

# Runtime dependencies  
bash curl gmp libffi libretls nginx jq python3 py3-yaml
```

## Development Commands

### Local Development with Docker

```bash
# Navigate to Docker directory
cd docker/terrat/

# Start setup wizard
docker-compose up setup
# Access at http://localhost:3000

# Start full stack
docker-compose up
# Terrateam available at configured port

# Start with specific services
docker-compose up db server
```

### Environment Configuration

```bash
# Copy and configure environment
cp dotenv .env
# Edit .env with your settings

# Required environment variables:
GITHUB_APP_ID=your_app_id
GITHUB_APP_CLIENT_ID=your_client_id  
GITHUB_APP_CLIENT_SECRET=your_client_secret
GITHUB_APP_PEM=your_private_key
TERRATUNNEL_API_KEY=your_tunnel_key
```

### Building Custom Images

```bash
# Build all variants
docker build --target terrat-oss -t my-terrat-oss .
docker build --target terrat-ee -t my-terrat-ee .
docker build --target code-indexer -t my-code-indexer .

# Build with base image caching
docker build --build-arg BASE_IMAGE=my-build-base .
```

## Service Configuration

### Docker Compose Architecture

```yaml
services:
  setup:       # Setup wizard (port 3000)
  db:          # PostgreSQL database  
  server:      # Main Terrateam server
  terratunnel: # Webhook tunnel service
```

### Health Checks & Dependencies

All services include comprehensive health checks:
- **Database**: `pg_isready` validation
- **Server**: HTTP health endpoint (`/health`)
- **Terratunnel**: HTTP endpoint validation
- **Dependency Management**: Services wait for dependencies

### Networking

```yaml
networks:
  terrateam:    # Internal network for service communication
```

Services communicate via Docker network DNS:
- `db:5432` - Database connection
- `terratunnel:8081` - Tunnel API endpoint
- `server:8080` - Main application

## Configuration Management

### Environment Variables

#### **GitHub Integration**
```bash
GITHUB_WEBHOOK_SECRET=webhook_secret
GITHUB_APP_CLIENT_SECRET=oauth_secret  
GITHUB_APP_CLIENT_ID=oauth_client_id
GITHUB_APP_ID=app_id
GITHUB_APP_PEM=private_key_pem
GITHUB_APP_URL=app_installation_url
```

#### **GitLab Integration**  
```bash
GITLAB_APP_ID=gitlab_app_id
GITLAB_APP_SECRET=gitlab_secret
GITLAB_ACCESS_TOKEN=gitlab_token
```

#### **Database Configuration**
```bash
DB_HOST=db
DB_PORT=5432
DB_USER=terrateam
DB_PASS=terrateam  
DB_NAME=terrateam
```

#### **Service Integration**
```bash
TERRATUNNEL_API_ENDPOINT=http://terratunnel:8081
TERRAT_UI_BASE=https://your-domain.com
```

### Runtime Configuration

#### **Nginx Configuration**
- **Template**: `nginx.conf.template` with environment substitution
- **Static Assets**: Iris frontend served from `/usr/local/share/terrat/ui/assets/`
- **Proxy**: API requests forwarded to Terrateam backend

#### **Process Management**
- **Supervisor**: `runit` for service management
- **Services**: 
  - `/etc/service/terrat/run` - Main application
  - `/etc/service/nginx/run` - Web server

## Production Deployment Patterns

### Scaling Considerations

1. **Database**: External PostgreSQL for production
2. **Load Balancing**: Multiple server instances behind load balancer  
3. **Storage**: Persistent volumes for database and file storage
4. **Monitoring**: Health checks and metrics collection

### Security Configuration

1. **TLS Termination**: External reverse proxy or load balancer
2. **Secrets Management**: Environment variables or secret management
3. **Network Policies**: Restrict container network access
4. **Updates**: Regular base image updates for security patches

### Monitoring & Observability

```yaml
# Health check endpoints
/health           # Application health
/metrics          # Prometheus metrics (if enabled)
```

### Backup & Recovery

1. **Database Backups**: Regular PostgreSQL dumps
2. **Configuration Backup**: Environment and compose files
3. **Disaster Recovery**: Container registry and data recovery procedures

## Troubleshooting

### Common Issues

1. **Build Failures**: Usually related to libkqueue compilation or OCaml dependencies
2. **Memory Issues**: OCaml compilation requires sufficient memory (4GB+ recommended)
3. **Network Connectivity**: GitHub/GitLab webhook connectivity
4. **Permission Issues**: File system permissions for volumes

### Debugging Commands

```bash
# Check service logs
docker-compose logs server
docker-compose logs terratunnel

# Execute in running container  
docker-compose exec server sh
docker-compose exec db psql -U terrateam

# Check health status
curl http://localhost:8080/health
```

This container architecture provides a robust, scalable foundation for self-hosted Terrateam deployments while maintaining separation of concerns and enabling flexible deployment patterns.