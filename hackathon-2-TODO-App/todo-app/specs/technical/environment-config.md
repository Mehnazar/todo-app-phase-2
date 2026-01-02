# Environment Configuration

**Project**: Evolution of Todo
**Purpose**: Environment-specific configuration across development, staging, and production
**Last Updated**: 2025-12-25

---

## Environment Files Structure

### Development (.env.local)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/todo_dev

# OpenAI (Phase III+)
OPENAI_API_KEY=sk-proj-your-development-key-here
OPENAI_MODEL=gpt-4-turbo

# Authentication
BETTER_AUTH_SECRET=local-secret-key-minimum-32-characters-required
BETTER_AUTH_URL=http://localhost:3000

# API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Environment
ENVIRONMENT=development
LOG_LEVEL=DEBUG

# Phase V only
KAFKA_BROKERS=localhost:9092
DAPR_HTTP_PORT=3500
REDPANDA_CLOUD_URL=
```

### Staging (.env.staging)

```bash
# Database
DATABASE_URL=postgresql://user:password@neon.tech:5432/todo_staging

# OpenAI
OPENAI_API_KEY=sk-proj-your-staging-key-here
OPENAI_MODEL=gpt-4-turbo

# Authentication
BETTER_AUTH_SECRET=staging-secret-key-minimum-32-characters-required
BETTER_AUTH_URL=http://192.168.49.2:30000

# API
NEXT_PUBLIC_API_URL=http://192.168.49.2:30001

# Environment
ENVIRONMENT=staging
LOG_LEVEL=INFO

# Phase V
KAFKA_BROKERS=kafka:9092
DAPR_HTTP_PORT=3500
```

### Production (Kubernetes Secrets)

```bash
# Stored in Kubernetes Secrets, NOT in .env files
DATABASE_URL=postgresql://user:password@neon.tech:5432/todo_prod
OPENAI_API_KEY=sk-proj-your-production-key-here
BETTER_AUTH_SECRET=<generated-with-openssl-rand-hex-32>
BETTER_AUTH_URL=https://todo-app.com
NEXT_PUBLIC_API_URL=https://api.todo-app.com
ENVIRONMENT=production
LOG_LEVEL=WARNING
KAFKA_BROKERS=kafka:9092
DAPR_HTTP_PORT=3500
```

---

## Environment Template (.env.example)

**Location**: Root of repository (committed to git)

```bash
# Copy this file to .env.local and fill in your values
# DO NOT commit .env.local to git

# ============================================
# DATABASE
# ============================================
DATABASE_URL=postgresql://user:password@host:5432/dbname

# ============================================
# OPENAI (Phase III+)
# ============================================
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_MODEL=gpt-4-turbo

# ============================================
# AUTHENTICATION
# ============================================
# Generate with: openssl rand -hex 32
BETTER_AUTH_SECRET=your-secret-minimum-32-characters
BETTER_AUTH_URL=http://localhost:3000

# ============================================
# API CONFIGURATION
# ============================================
NEXT_PUBLIC_API_URL=http://localhost:8000

# ============================================
# ENVIRONMENT
# ============================================
# Options: development | staging | production
ENVIRONMENT=development

# Options: DEBUG | INFO | WARNING | ERROR
LOG_LEVEL=DEBUG

# ============================================
# PHASE V ONLY (Event-Driven Architecture)
# ============================================
KAFKA_BROKERS=localhost:9092
DAPR_HTTP_PORT=3500
REDPANDA_CLOUD_URL=
```

---

## Kubernetes Configuration

### ConfigMap (Non-Sensitive Config)

**File**: `infrastructure/k8s/configmap.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: todo-config
  namespace: todo-prod
data:
  ENVIRONMENT: "production"
  LOG_LEVEL: "INFO"
  NEXT_PUBLIC_API_URL: "https://api.todo-app.com"
  KAFKA_BROKERS: "kafka:9092"
  DAPR_HTTP_PORT: "3500"
  OPENAI_MODEL: "gpt-4-turbo"
```

### Secret (Sensitive Credentials)

**File**: `infrastructure/k8s/secrets.yaml` (template, actual values in CI/CD)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: todo-secrets
  namespace: todo-prod
type: Opaque
stringData:
  DATABASE_URL: "postgresql://..."  # From GitHub Secrets
  OPENAI_API_KEY: "sk-proj-..."     # From GitHub Secrets
  BETTER_AUTH_SECRET: "..."         # Generated securely
```

### Deployment Usage

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  template:
    spec:
      containers:
      - name: backend
        image: ghcr.io/user/todo-backend:v1.0.0
        envFrom:
        - configMapRef:
            name: todo-config
        - secretRef:
            name: todo-secrets
```

---

## Environment Detection in Code

### Backend (FastAPI)

```python
import os
from enum import Enum

class Environment(Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"

# Get environment
ENVIRONMENT = Environment(os.getenv("ENVIRONMENT", "development"))

# Configuration based on environment
if ENVIRONMENT == Environment.PRODUCTION:
    DEBUG = False
    LOG_LEVEL = os.getenv("LOG_LEVEL", "WARNING")
    SHOW_STACK_TRACE = False
    DATABASE_POOL_SIZE = 20
elif ENVIRONMENT == Environment.STAGING:
    DEBUG = False
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    SHOW_STACK_TRACE = False
    DATABASE_POOL_SIZE = 10
else:  # DEVELOPMENT
    DEBUG = True
    LOG_LEVEL = os.getenv("LOG_LEVEL", "DEBUG")
    SHOW_STACK_TRACE = True
    DATABASE_POOL_SIZE = 5

# Use in app
from fastapi import FastAPI

app = FastAPI(debug=DEBUG)
```

### Frontend (Next.js)

```typescript
// lib/config.ts
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  environment: process.env.NODE_ENV as 'development' | 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
}

// Usage
import { config } from '@/lib/config'

if (config.isDevelopment) {
  console.log('Running in development mode')
}
```

---

## Security Best Practices

### DO ✅

- Store secrets in environment variables
- Use different secrets for each environment
- Generate secrets with `openssl rand -hex 32`
- Add `.env.local` to `.gitignore`
- Commit `.env.example` to git (with placeholder values)
- Use Kubernetes Secrets in production
- Rotate secrets periodically

### DON'T ❌

- Commit `.env.local` to git
- Hardcode secrets in source code
- Use same secrets across environments
- Share secrets via email or Slack
- Log secret values
- Expose secrets in error messages

---

## CI/CD Integration

### GitHub Actions with Secrets

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Create Kubernetes secret
        run: |
          kubectl create secret generic todo-secrets \
            --from-literal=DATABASE_URL=${{ secrets.DATABASE_URL }} \
            --from-literal=OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }} \
            --from-literal=BETTER_AUTH_SECRET=${{ secrets.BETTER_AUTH_SECRET }} \
            --dry-run=client -o yaml | kubectl apply -f -
```

---

## Generating Secrets

### Authentication Secret

```bash
# Generate 32-byte random secret
openssl rand -hex 32

# Output example:
# a7b3c9d8e2f4a6b5c1d8e9f3a2b7c4d5e8f1a9b2c6d3e7f4a1b8c5d9e2f6a3b
```

### JWT Secret

```bash
# Same method - minimum 32 characters
openssl rand -base64 32
```

---

## Environment Naming Conventions

| Variable | Format | Example |
|----------|--------|---------|
| Application variables | `UPPERCASE_WITH_UNDERSCORES` | `DATABASE_URL` |
| Next.js public variables | `NEXT_PUBLIC_*` | `NEXT_PUBLIC_API_URL` |
| Boolean values | `true` / `false` (lowercase) | `DEBUG=true` |
| URLs | Include protocol | `https://api.todo-app.com` |

---

## Troubleshooting

### Missing Environment Variables

```python
# Backend: Fail fast if required env var missing
import os

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is required")
```

```typescript
// Frontend: Fail at build time
if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is required')
}
```

### Environment Mismatch

```python
# Add health check endpoint showing environment
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": ENVIRONMENT.value,
        "version": "1.0.0"
    }
```

---

## References

- [12-Factor App - Config](https://12factor.net/config)
- [CONSTITUTION.md - Environment Configuration](../../.specify/memory/constitution.md#environment-configuration)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [FastAPI Settings Management](https://fastapi.tiangolo.com/advanced/settings/)

---

**Version**: 1.0.0
**Last Updated**: 2025-12-25
