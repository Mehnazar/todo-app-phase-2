# Database Migration Guide

**Project**: Evolution of Todo
**Purpose**: Database schema evolution strategy across all phases
**Migration Tool**: Alembic (Python)
**Last Updated**: 2025-12-25

---

## Migration Tool: Alembic

### Installation

```bash
# Included in backend dependencies
pip install alembic
```

### Configuration

Location: `/backend/alembic/`

```
backend/
├── alembic/
│   ├── versions/          # Migration files
│   ├── env.py             # Alembic configuration
│   └── script.py.mako     # Migration template
├── alembic.ini            # Alembic config file
└── src/
    └── models.py          # SQLModel models
```

---

## Commands

### Create New Migration

```bash
# Auto-generate migration from model changes
alembic revision --autogenerate -m "add priority and tags"

# Create empty migration (for manual SQL)
alembic revision -m "add custom indexes"
```

### Apply Migrations

```bash
# Upgrade to latest version
alembic upgrade head

# Upgrade one version
alembic upgrade +1

# Upgrade to specific version
alembic upgrade abc123
```

### Rollback Migrations

```bash
# Downgrade one version
alembic downgrade -1

# Downgrade to specific version
alembic downgrade abc123

# Rollback all migrations
alembic downgrade base
```

### View Migration Status

```bash
# Show current version
alembic current

# Show migration history
alembic history

# Show pending migrations
alembic history --verbose
```

---

## Phase Evolution

### Phase II: Initial Database Schema

**Migration**: `001_create_initial_tables.py`

```python
"""create initial tables

Revision ID: 001
Create Date: 2024-12-25 10:00:00
"""

def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(255), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('name', sa.String(255), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP, server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.String(255), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('completed', sa.Boolean, server_default='false', nullable=False),
        sa.Column('created_at', sa.TIMESTAMP, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.TIMESTAMP, server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    # Create indexes
    op.create_index('idx_tasks_user_id', 'tasks', ['user_id'])
    op.create_index('idx_tasks_completed', 'tasks', ['completed'])


def downgrade() -> None:
    op.drop_index('idx_tasks_completed', 'tasks')
    op.drop_index('idx_tasks_user_id', 'tasks')
    op.drop_table('tasks')
    op.drop_table('users')
```

---

### Phase II → Phase III: Add Conversations

**Migration**: `002_add_conversations.py`

```python
"""add conversations and messages tables

Revision ID: 002
Revises: 001
Create Date: 2024-12-26 10:00:00
"""

def upgrade() -> None:
    # Create conversations table
    op.create_table(
        'conversations',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.String(255), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.TIMESTAMP, server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    # Create messages table
    op.create_table(
        'messages',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('conversation_id', sa.Integer, sa.ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.String(255), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('role', sa.String(20), nullable=False),  # 'user' or 'assistant'
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('created_at', sa.TIMESTAMP, server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    # Create indexes
    op.create_index('idx_messages_conversation', 'messages', ['conversation_id'])
    op.create_index('idx_conversations_user', 'conversations', ['user_id'])


def downgrade() -> None:
    op.drop_index('idx_conversations_user', 'conversations')
    op.drop_index('idx_messages_conversation', 'messages')
    op.drop_table('messages')
    op.drop_table('conversations')
```

---

### Phase III → Phase V: Add Advanced Features

**Migration**: `003_add_advanced_task_features.py`

```python
"""add priority, tags, due dates, and recurrence

Revision ID: 003
Revises: 002
Create Date: 2024-12-27 10:00:00
"""

def upgrade() -> None:
    # Add columns to tasks table
    op.add_column('tasks', sa.Column('priority', sa.String(20), server_default='medium', nullable=False))
    op.add_column('tasks', sa.Column('due_date', sa.TIMESTAMP, nullable=True))
    op.add_column('tasks', sa.Column('remind_at', sa.TIMESTAMP, nullable=True))
    op.add_column('tasks', sa.Column('recurrence_pattern', sa.String(100), nullable=True))
    op.add_column('tasks', sa.Column('is_recurring', sa.Boolean, server_default='false', nullable=False))

    # Create tags table
    op.create_table(
        'tags',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(50), unique=True, nullable=False),
        sa.Column('created_at', sa.TIMESTAMP, server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    # Create task_tags join table
    op.create_table(
        'task_tags',
        sa.Column('task_id', sa.Integer, sa.ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False),
        sa.Column('tag_id', sa.Integer, sa.ForeignKey('tags.id', ondelete='CASCADE'), nullable=False),
        sa.PrimaryKeyConstraint('task_id', 'tag_id')
    )

    # Create indexes for performance
    op.create_index('idx_tasks_priority', 'tasks', ['priority'])
    op.create_index('idx_tasks_due_date', 'tasks', ['due_date'])
    op.create_index('idx_tasks_remind_at', 'tasks', ['remind_at'])
    op.create_index('idx_tasks_is_recurring', 'tasks', ['is_recurring'])


def downgrade() -> None:
    op.drop_index('idx_tasks_is_recurring', 'tasks')
    op.drop_index('idx_tasks_remind_at', 'tasks')
    op.drop_index('idx_tasks_due_date', 'tasks')
    op.drop_index('idx_tasks_priority', 'tasks')
    op.drop_table('task_tags')
    op.drop_table('tags')
    op.drop_column('tasks', 'is_recurring')
    op.drop_column('tasks', 'recurrence_pattern')
    op.drop_column('tasks', 'remind_at')
    op.drop_column('tasks', 'due_date')
    op.drop_column('tasks', 'priority')
```

---

## Migration Workflow

### Development Workflow

```bash
# 1. Modify SQLModel models in src/models.py

# 2. Generate migration
alembic revision --autogenerate -m "description"

# 3. Review generated migration file
# - Check upgrade() function
# - Check downgrade() function
# - Add any custom logic

# 4. Test migration (upgrade)
alembic upgrade head

# 5. Test rollback (downgrade)
alembic downgrade -1

# 6. Re-test upgrade
alembic upgrade head

# 7. Commit migration file to git
git add backend/alembic/versions/XXX_description.py
git commit -m "Add migration: description"
```

### Production Deployment

```bash
# Apply via CI/CD (GitHub Actions)
- name: Run database migrations
  run: |
    cd backend
    alembic upgrade head

# Or manually via kubectl
kubectl exec -it backend-pod -- alembic upgrade head
```

---

## Zero-Downtime Migration Guidelines

### Safe Operations

✅ **Adding nullable columns**
```python
op.add_column('tasks', sa.Column('new_field', sa.String(100), nullable=True))
```

✅ **Adding columns with defaults**
```python
op.add_column('tasks', sa.Column('status', sa.String(20), server_default='pending'))
```

✅ **Creating new tables**
```python
op.create_table('new_table', ...)
```

✅ **Creating indexes (concurrently in PostgreSQL)**
```python
op.create_index('idx_name', 'table', ['column'], postgresql_concurrently=True)
```

### Unsafe Operations (Require Downtime)

❌ **Dropping columns immediately**
```python
# DON'T DO THIS in production
op.drop_column('tasks', 'old_field')
```

**Instead**: Two-phase approach
1. Migration 1: Stop writing to column
2. Migration 2: Drop column after deploy complete

❌ **Renaming columns directly**
```python
# DON'T DO THIS
op.alter_column('tasks', 'old_name', new_column_name='new_name')
```

**Instead**: Three-phase approach
1. Migration 1: Add new column
2. Migration 2: Backfill data, update app to use new column
3. Migration 3: Drop old column

❌ **Adding NOT NULL constraints immediately**
```python
# DON'T DO THIS
op.add_column('tasks', sa.Column('required_field', sa.String(100), nullable=False))
```

**Instead**: Two-phase approach
1. Migration 1: Add nullable column with default
2. Migration 2: Backfill existing rows
3. Migration 3: Add NOT NULL constraint

---

## Schema Versioning

### Version Tracking

Alembic maintains schema version in the database:

```sql
-- alembic_version table (auto-created)
CREATE TABLE alembic_version (
  version_num VARCHAR(32) NOT NULL,
  PRIMARY KEY (version_num)
);
```

### Version Compatibility

**Backend must handle multiple schema versions during rolling deployments:**

```python
# Good: Handle both old and new schema
def get_task_priority(task: Task) -> str:
    # Works with schema v2 (no priority) and v3 (with priority)
    return getattr(task, 'priority', 'medium')

# Bad: Assumes latest schema
def get_task_priority(task: Task) -> str:
    return task.priority  # Fails if column doesn't exist yet
```

---

## Testing Migrations

### Local Testing

```bash
# Create test database
createdb todo_test

# Run migrations
DATABASE_URL=postgresql://localhost/todo_test alembic upgrade head

# Test downgrade
alembic downgrade -1

# Test upgrade again
alembic upgrade head

# Drop test database
dropdb todo_test
```

### Automated Testing (pytest)

```python
import pytest
from alembic.command import upgrade, downgrade
from alembic.config import Config

def test_migrations_upgrade_downgrade():
    """Test that all migrations can upgrade and downgrade"""
    config = Config("alembic.ini")

    # Upgrade to head
    upgrade(config, "head")

    # Downgrade all the way
    downgrade(config, "base")

    # Upgrade again
    upgrade(config, "head")
```

---

## Data Migration

### Backfilling Data

When adding new fields that need values for existing records:

```python
from sqlalchemy import text

def upgrade() -> None:
    # Add column
    op.add_column('tasks', sa.Column('priority', sa.String(20), nullable=True))

    # Backfill existing records
    connection = op.get_bind()
    connection.execute(
        text("UPDATE tasks SET priority = 'medium' WHERE priority IS NULL")
    )

    # Make column non-nullable
    op.alter_column('tasks', 'priority', nullable=False)


def downgrade() -> None:
    op.drop_column('tasks', 'priority')
```

---

## Troubleshooting

### Migration Conflicts

```bash
# If multiple developers create migrations simultaneously
# Resolve by updating revision chain

# Edit migration file
# Change: Revises: abc123
# To: Revises: xyz789 (the latest migration)
```

### Failed Migration

```bash
# If migration fails mid-way
# 1. Check alembic_version table
SELECT * FROM alembic_version;

# 2. Manually fix database state
# 3. Mark migration as complete
alembic stamp <version>

# Or rollback to previous version
alembic downgrade -1
```

### Locked Migrations

```bash
# PostgreSQL may lock tables during migration
# Check for long-running queries
SELECT * FROM pg_stat_activity WHERE state = 'active';

# Kill blocking query if needed
SELECT pg_terminate_backend(pid);
```

---

## References

- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [CONSTITUTION.md - Database Strategy](../../.specify/memory/constitution.md#database-strategy)
- [SPECIFICATION.md - Phase II](../../../SPECIFICATION.md#feature-4-database-persistence)

---

**Version**: 1.0.0
**Last Updated**: 2025-12-25
