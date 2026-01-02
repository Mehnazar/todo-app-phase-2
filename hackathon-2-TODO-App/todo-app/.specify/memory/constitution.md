<!--
Sync Impact Report:
- Version change: N/A (initial constitution) → 1.0.0
- Modified principles: N/A (initial creation)
- Added sections: All sections created from scratch
  - I. ARCHITECTURAL PRINCIPLES (WHY) - 5 core principles
  - II. TECHNOLOGY CONSTRAINTS (WHAT) - Phase-specific tech stacks
  - III. CODE QUALITY STANDARDS (HOW) - 5 standards categories
  - IV. TESTING & VALIDATION REQUIREMENTS - 3 validation areas
  - V. DEPLOYMENT & OPERATIONS STANDARDS - 3 standards categories
  - VI. DOCUMENTATION REQUIREMENTS - Structure and commit standards
  - VII. SUBMISSION & PRESENTATION STANDARDS - Repository, demo, deployment
  - VIII. FORBIDDEN PRACTICES (WHAT NOT TO DO) - 3 prohibition categories
  - IX. CONFLICT RESOLUTION HIERARCHY - Precedence rules
- Removed sections: N/A (initial creation)
- Templates requiring updates:
  - ✅ plan-template.md - Constitution Check section compatible
  - ✅ spec-template.md - User scenario requirements aligned
  - ✅ tasks-template.md - User story organization matches principles
- Follow-up TODOs: None - all placeholders filled
-->

# Evolution of Todo Constitution

## Project Identity

**Project Name**: Evolution of Todo - AI-Native Spec-Driven Application
**Development Paradigm**: Spec-Driven Development (SDD)
**AI Partner**: Claude Code + Spec-Kit Plus
**Core Principle**: No code written manually - all implementation generated through refined specifications

## Core Principles

### I. Spec-First Development

All development MUST begin with specifications before any code is written:

- No code may be written without a corresponding specification
- All features MUST progress through: Specify → Plan → Tasks → Implement
- Specifications are the single source of truth, not the code
- When code conflicts with spec, spec wins - code MUST be regenerated

**Rationale**: Ensures AI-native development workflow produces predictable, verifiable results aligned with requirements.

### II. AI-Native Engineering

Claude Code is the primary implementation tool with strict guardrails:

- Claude Code is the primary implementation tool
- Manual coding is explicitly prohibited - specifications MUST be refined until Claude generates correct output
- All iterations MUST be documented in /specs history folder
- Prompts and refinements are part of the deliverable, not just code

**Rationale**: Validates that specifications are sufficiently detailed and unambiguous for AI generation.

### III. Stateless Architecture

All services MUST be stateless and horizontally scalable:

- All services MUST be stateless and horizontally scalable
- State persists only in database (Neon PostgreSQL), never in memory
- Conversation context loaded from database on each request
- Server restarts MUST NOT lose any user data or context

**Rationale**: Enables cloud-native deployment with zero downtime and elastic scaling.

### IV. Security-First Design

Security MUST be enforced at every layer with zero trust:

- All API endpoints MUST require JWT authentication via Better Auth
- User isolation MUST be enforced at database query level
- No user can access another user's data under any circumstance
- Secrets MUST be managed via environment variables or Dapr/K8s secrets
- API tokens MUST NEVER be hardcoded in source files

**Rationale**: Prevents security vulnerabilities through defense-in-depth and principle of least privilege.

### V. Event-Driven Decoupling

Services MUST communicate via events for loose coupling:

- Services communicate via events (Kafka), not direct API calls
- Producers publish events without knowing consumers
- New features added by creating new consumers, not modifying producers
- Event schemas MUST be documented in specifications

**Rationale**: Enables independent service evolution and feature additions without coupling or breaking changes.

## Technology Constraints (WHAT)

### Phase I: Console App

**Language**: Python 3.13+
**Package Manager**: UV
**Development Tool**: Claude Code
**Spec Tool**: Spec-Kit Plus
**Storage**: In-memory only
**Prohibited**: Manual file writing, external databases

### Phase II: Full-Stack Web

**Frontend**: Next.js 16+ (App Router only, no Pages Router)
**Backend**: Python FastAPI
**Database**: Neon Serverless PostgreSQL
**ORM**: SQLModel (no raw SQL except migrations)
**Authentication**: Better Auth with JWT
**Deployment**: Vercel (frontend), any hosting (backend)
**Prohibited**: Session-based auth, MongoDB, Firebase

### Phase III: AI Chatbot

**Chat UI**: OpenAI ChatKit
**AI Framework**: OpenAI Agents SDK
**MCP Server**: Official MCP SDK (Python)
**All tools**: MUST be stateless, database-backed
**Prohibited**: In-memory agent state, custom chat UIs

### Phase IV: Local Kubernetes

**Container**: Docker (via Gordon AI if available)
**Orchestration**: Minikube
**Package Manager**: Helm Charts
**AIOps**: kubectl-ai and/or kagent
**Prohibited**: Docker Compose in production, manual kubectl without AI assist

### Phase V: Cloud Deployment

**Cloud Platform**: DigitalOcean DOKS, Google GKE, or Azure AKS
**Event Streaming**: Kafka (Redpanda Cloud, Strimzi, or managed)
**Runtime**: Dapr (Pub/Sub, State, Jobs API, Secrets, Service Invocation)
**CI/CD**: GitHub Actions
**Prohibited**: AWS (outside scope), manual deployments

## Code Quality Standards (HOW)

### 1. Python Code Standards

- Type hints MUST be present on all function signatures
- Async/await MUST be used for all I/O operations (database, HTTP, MCP)
- Pydantic models MUST validate all request/response data
- Error handling MUST use HTTPException, never bare except
- Logging MUST use Python logging module, not print statements

### 2. TypeScript/Next.js Standards

- Server Components by default, Client Components only when interactive
- No inline styles - Tailwind CSS classes only
- API calls MUST go through centralized /lib/api.ts client
- Environment variables MUST be prefixed with NEXT_PUBLIC_ for client access
- Strict TypeScript mode MUST be enabled

### 3. Database Standards

- All queries MUST be filtered by authenticated user_id
- Timestamps: created_at, updated_at MUST be present on all tables
- UUIDs for user IDs, integers for task/conversation IDs
- No cascading deletes - explicit soft deletes where needed
- Indexes MUST be present on all foreign keys and filter columns

### 4. API Design Standards

- RESTful endpoints: /api/{user_id}/tasks, not /tasks?user_id=X
- HTTP status codes: 200 (success), 201 (created), 401 (unauthorized), 404 (not found)
- JSON responses only, no XML or plain text
- Error responses: {"error": "description"} format
- All endpoints MUST be documented in /specs/api/ folder

### 5. MCP Tool Standards

- Every tool MUST accept user_id as first parameter
- Tools MUST return structured JSON, not plain strings
- Tools MUST be idempotent where possible (safe to retry)
- Tool schemas MUST be documented in /specs/api/mcp-tools.md
- No tools may access data across users

## Testing & Validation Requirements

### Acceptance Criteria

- Every feature MUST have acceptance criteria in /specs/features/
- Demo video MUST show feature working as specified
- No feature is "complete" until it passes all acceptance tests
- Edge cases MUST be documented and handled

### Performance Requirements

- API response time MUST be < 500ms for CRUD operations
- Chat response time MUST be < 3 seconds (including AI inference)
- Database queries MUST be optimized (EXPLAIN ANALYZE for slow queries)
- Frontend initial load MUST be < 2 seconds

### Security Validation

- All endpoints MUST be tested with invalid/expired JWT tokens
- All endpoints MUST be tested with wrong user_id in URL
- No SQL injection possible (SQLModel ORM required)
- No XSS possible (React auto-escapes, FastAPI validates)

## Deployment & Operations Standards

### Docker Standards

- Multi-stage builds MUST be used to minimize image size
- Non-root user MUST run in containers
- Health check endpoints: /health MUST be present on all services
- Environment variables MUST be used for all configuration
- No secrets in Dockerfiles or images

### Kubernetes Standards

- Resource requests/limits MUST be defined for all pods
- Readiness and liveness probes MUST be configured
- ConfigMaps for configuration, Secrets for sensitive data
- Helm charts MUST be used for all deployments (no raw YAML in production)
- Namespaces: todo-dev, todo-prod

### Dapr Standards

- All Kafka interactions MUST use Dapr Pub/Sub, not direct Kafka clients
- Conversation state MUST use Dapr State API, not direct database calls
- Reminders MUST be scheduled via Dapr Jobs API, not cron jobs
- Service-to-service calls MUST use Dapr Service Invocation
- Component YAML files MUST be in /dapr-components/ folder

## Documentation Requirements

### Required Files (Every Phase)

- CONSTITUTION.md - This file (project-wide principles)
- AGENTS.md - Agent behavior guide (workflow rules)
- CLAUDE.md - Claude Code instructions (references AGENTS.md)
- README.md - Setup instructions, tech stack, deployment
- /specs/ folder - All specification files with version history

### Specification Structure

```
/specs/
  ├── overview.md          # Project overview
  ├── constitution.md      # This file (symlink or copy)
  ├── features/            # Feature specifications
  │   ├── task-crud.md
  │   ├── authentication.md
  │   └── chatbot.md
  ├── api/                 # API specifications
  │   ├── rest-endpoints.md
  │   └── mcp-tools.md
  ├── database/            # Database specifications
  │   └── schema.md
  └── ui/                  # UI specifications
      ├── components.md
      └── pages.md
```

### Commit Standards

- Commit messages MUST reference Task IDs: [T-001] Implement add_task MCP tool
- Specs MUST be committed before implementation code
- No commits with "WIP" or "fix" messages without context
- Each phase in separate branch: phase-1, phase-2, etc.

## Submission & Presentation Standards

### GitHub Repository

- Public repository with clear folder structure
- All phases in main branch or clearly tagged
- .gitignore MUST exclude secrets, node_modules, __pycache__
- Environment variable templates in .env.example

### Demo Video Requirements

- Maximum 90 seconds (judges stop watching after this)
- MUST show spec-driven workflow, not just final app
- MUST demonstrate Claude Code usage and spec refinements
- Voice narration or text overlays required
- Screen recording in HD (1080p minimum)

### Deployment Requirements

- Phase II: Frontend on Vercel, backend publicly accessible
- Phase III: Chatbot functional with public URL
- Phase IV: Minikube setup instructions in README
- Phase V: Cloud deployment live with monitoring dashboard

## Forbidden Practices (WHAT NOT TO DO)

### Prohibited Development Practices

- Manual code writing (except for specs and CLAUDE.md)
- Copy-pasting code from tutorials without spec justification
- Using outdated tech (Pages Router, Django, MongoDB without approval)
- Storing secrets in code or committing .env files
- **Opening .env files in IDE or editor (use .env.example for reference)**
- Skipping phases or merging phase requirements

### Prohibited Architecture Patterns

- Stateful services (session in memory, global variables)
- Direct database access from frontend
- Tight coupling between services
- Synchronous blocking I/O in Python
- Hardcoded URLs or API keys

### Prohibited Submission Practices

- Private GitHub repositories
- Demo videos over 90 seconds
- Missing specs folder or constitution
- Plagiarized code without attribution
- Non-functional deployments

## Conflict Resolution Hierarchy

When conflicts arise, this hierarchy determines precedence:

1. **Constitution** (this file) - overrides all
2. **Phase Requirements** (in hackathon spec) - overrides specs
3. **Feature Specifications** (/specs/features/) - overrides plans
4. **Technical Plans** (/specs/api/, /specs/database/) - overrides code
5. **Implementation Code** - lowest priority, regenerated if conflicts

**Example**: If code implements a feature not in specifications, code MUST be deleted and spec updated first.

## XIII. ARCHITECTURAL DECISIONS

### Authentication Strategy

- Email/password only via Better Auth
- JWT tokens with 7-day expiration
- No refresh tokens (user re-authenticates after expiry)
- Password requirements: 8+ chars, mixed case, number, max 128 chars
- Password reset: NOT IMPLEMENTED (optional Phase V bonus)
- Multiple device login: ALLOWED
- Token storage: localStorage on frontend
- Token transmission: Authorization: Bearer <token> header

**Rationale**: Simplicity over complexity; covers 90% of use cases without refresh token complexity.

### Error Handling Standards

- Standardized error response format with error codes
- Environment-specific error details (full in dev, minimal in prod)
- HTTP status codes strictly enforced (200, 201, 400, 401, 403, 404, 422, 500, 503)
- MCP tools return {success, data/error, metadata} format
- User-friendly error messages (never expose technical details in production)
- Request IDs for debugging (production only)

**Rationale**: Consistent error handling improves debugging and user experience.

### Database Strategy

- Migrations via Alembic (Python)
- Hard delete only (no soft delete for simplicity)
- SQLAlchemy connection pooling (pool_size=20, max_overflow=40)
- All timestamps stored in UTC (TIMESTAMP WITHOUT TIME ZONE)
- Zero-downtime schema changes (add columns with defaults, never drop immediately)
- Cascade deletes for related records (conversations → messages, tasks → task_tags)

**Rationale**: Standard Python tooling with proven reliability; UTC eliminates timezone complexity.

### Timezone Handling

- Storage: Always UTC in database
- API: ISO 8601 format with Z suffix (e.g., 2024-12-25T10:30:00Z)
- Display: Convert to user's local timezone in frontend
- Input: Accept local time, convert to UTC before storage
- Natural language parsing: Use dateparser library for AI chat interface

**Rationale**: UTC storage prevents timezone bugs; client-side display respects user preferences.

### Repository Structure

- Monorepo with frontend/backend/infrastructure folders
- API versioning: /api/v1/ from day one
- No caching layer (Redis) initially
- Vercel CDN for frontend static assets
- GitHub Container Registry (ghcr.io) for Docker images

**Rationale**: Monorepo enables Claude Code to see entire context; API versioning prevents future migration pain.

### Environment Configuration

- .env files for local development (git-ignored)
- Kubernetes ConfigMaps for non-sensitive config
- Kubernetes Secrets for credentials
- Environment detection: development/staging/production
- Environment variable naming: UPPERCASE_WITH_UNDERSCORES
- **NEVER open .env files in IDE or commit to version control**

**Rationale**: Standard practice; separates config from code; supports multiple environments; prevents accidental secret exposure.

---

## Governance

This constitution governs all development practices for the Evolution of Todo project.

### Amendment Process

1. Amendments MUST be proposed with rationale and impact analysis
2. Changes MUST be documented in version control
3. Version MUST be incremented according to semantic versioning:
   - MAJOR: Backward incompatible principle removals or redefinitions
   - MINOR: New principle/section added or materially expanded guidance
   - PATCH: Clarifications, wording, typo fixes
4. Migration plan MUST be provided for breaking changes

### Compliance

- All PRs/reviews MUST verify compliance with constitution
- Complexity MUST be justified when violating simplicity principles
- Use CLAUDE.md for runtime development guidance referencing this constitution

### Enforcement

- Constitution violations MUST be caught in code review
- Unjustified complexity MUST be rejected
- Security violations MUST block deployment
- Spec-first violations MUST result in code regeneration

**Version**: 1.1.0 | **Ratified**: 2025-12-25 | **Last Amended**: 2025-12-25
