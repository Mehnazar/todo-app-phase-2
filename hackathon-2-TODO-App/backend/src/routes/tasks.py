"""Task CRUD endpoints with user isolation"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional
from src.db import get_session
from src.models import Task
from src.middleware.auth import get_current_user

router = APIRouter(prefix="/api/v1", tags=["tasks"])


# Request/Response Models
class CreateTaskRequest(BaseModel):
    """Request model for creating a new task"""
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=1000)


class UpdateTaskRequest(BaseModel):
    """Request model for updating a task"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    completed: Optional[bool] = None


class TaskResponse(BaseModel):
    """Response model for a task"""
    id: int
    user_id: str
    title: str
    description: str
    completed: bool
    created_at: str
    updated_at: str


def serialize_task(task: Task) -> TaskResponse:
    """
    Serialize a Task model to response format.

    Args:
        task: Task model instance

    Returns:
        TaskResponse with ISO 8601 timestamps
    """
    return TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        created_at=task.created_at.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z'),
        updated_at=task.updated_at.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z')
    )


@router.get("/{user_id}/tasks", response_model=list[TaskResponse])
async def list_tasks(
    user_id: str,
    current_user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
) -> list[TaskResponse]:
    """
    List all tasks for a user.

    Args:
        user_id: User ID from path parameter
        current_user: Authenticated user ID from JWT token
        db: Database session

    Returns:
        List of tasks ordered by created_at descending

    Raises:
        HTTPException: 403 if user_id doesn't match authenticated user
    """
    # Enforce user isolation - user can only access their own tasks
    if user_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": {
                    "code": "FORBIDDEN",
                    "message": "You can only access your own tasks",
                    "details": {"user_id": user_id},
                    "timestamp": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
                }
            }
        )

    # Query tasks for the user
    result = await db.execute(
        select(Task)
        .where(Task.user_id == user_id)
        .order_by(Task.created_at.desc())
    )
    tasks = result.scalars().all()

    return [serialize_task(task) for task in tasks]


@router.post("/{user_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    user_id: str,
    request: CreateTaskRequest,
    current_user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
) -> TaskResponse:
    """
    Create a new task for a user.

    Args:
        user_id: User ID from path parameter
        request: Task creation data
        current_user: Authenticated user ID from JWT token
        db: Database session

    Returns:
        Created task

    Raises:
        HTTPException: 403 if user_id doesn't match authenticated user
    """
    # Enforce user isolation
    if user_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": {
                    "code": "FORBIDDEN",
                    "message": "You can only create tasks for yourself",
                    "details": {"user_id": user_id},
                    "timestamp": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
                }
            }
        )

    # Create task
    now = datetime.utcnow()
    task = Task(
        user_id=user_id,
        title=request.title,
        description=request.description,
        completed=False,
        created_at=now,
        updated_at=now
    )

    db.add(task)
    await db.commit()
    await db.refresh(task)

    return serialize_task(task)


@router.get("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    user_id: str,
    task_id: int,
    current_user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
) -> TaskResponse:
    """
    Get a single task by ID.

    Args:
        user_id: User ID from path parameter
        task_id: Task ID
        current_user: Authenticated user ID from JWT token
        db: Database session

    Returns:
        Task details

    Raises:
        HTTPException: 403 if user_id doesn't match authenticated user
        HTTPException: 404 if task not found or user doesn't own it
    """
    # Enforce user isolation
    if user_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": {
                    "code": "FORBIDDEN",
                    "message": "You can only access your own tasks",
                    "details": {"user_id": user_id},
                    "timestamp": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
                }
            }
        )

    # Query task with user isolation
    result = await db.execute(
        select(Task)
        .where(Task.id == task_id)
        .where(Task.user_id == user_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "TASK_NOT_FOUND",
                    "message": "Task not found",
                    "details": {"task_id": task_id},
                    "timestamp": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
                }
            }
        )

    return serialize_task(task)


@router.put("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: str,
    task_id: int,
    request: UpdateTaskRequest,
    current_user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
) -> TaskResponse:
    """
    Update a task.

    Args:
        user_id: User ID from path parameter
        task_id: Task ID
        request: Task update data
        current_user: Authenticated user ID from JWT token
        db: Database session

    Returns:
        Updated task

    Raises:
        HTTPException: 403 if user_id doesn't match authenticated user
        HTTPException: 404 if task not found or user doesn't own it
    """
    # Enforce user isolation
    if user_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": {
                    "code": "FORBIDDEN",
                    "message": "You can only update your own tasks",
                    "details": {"user_id": user_id},
                    "timestamp": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
                }
            }
        )

    # Query task with user isolation
    result = await db.execute(
        select(Task)
        .where(Task.id == task_id)
        .where(Task.user_id == user_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "TASK_NOT_FOUND",
                    "message": "Task not found",
                    "details": {"task_id": task_id},
                    "timestamp": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
                }
            }
        )

    # Update fields if provided
    if request.title is not None:
        task.title = request.title
    if request.description is not None:
        task.description = request.description
    if request.completed is not None:
        task.completed = request.completed

    # Always update updated_at timestamp
    task.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(task)

    return serialize_task(task)


@router.delete("/{user_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    user_id: str,
    task_id: int,
    current_user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
) -> None:
    """
    Delete a task.

    Args:
        user_id: User ID from path parameter
        task_id: Task ID
        current_user: Authenticated user ID from JWT token
        db: Database session

    Raises:
        HTTPException: 403 if user_id doesn't match authenticated user
        HTTPException: 404 if task not found or user doesn't own it
    """
    # Enforce user isolation
    if user_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": {
                    "code": "FORBIDDEN",
                    "message": "You can only delete your own tasks",
                    "details": {"user_id": user_id},
                    "timestamp": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
                }
            }
        )

    # Query task with user isolation
    result = await db.execute(
        select(Task)
        .where(Task.id == task_id)
        .where(Task.user_id == user_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "TASK_NOT_FOUND",
                    "message": "Task not found",
                    "details": {"task_id": task_id},
                    "timestamp": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
                }
            }
        )

    # Delete task
    await db.delete(task)
    await db.commit()


@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=TaskResponse)
async def toggle_task_completion(
    user_id: str,
    task_id: int,
    current_user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
) -> TaskResponse:
    """
    Toggle task completion status.

    Args:
        user_id: User ID from path parameter
        task_id: Task ID
        current_user: Authenticated user ID from JWT token
        db: Database session

    Returns:
        Updated task

    Raises:
        HTTPException: 403 if user_id doesn't match authenticated user
        HTTPException: 404 if task not found or user doesn't own it
    """
    # Enforce user isolation
    if user_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": {
                    "code": "FORBIDDEN",
                    "message": "You can only update your own tasks",
                    "details": {"user_id": user_id},
                    "timestamp": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
                }
            }
        )

    # Query task with user isolation
    result = await db.execute(
        select(Task)
        .where(Task.id == task_id)
        .where(Task.user_id == user_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "TASK_NOT_FOUND",
                    "message": "Task not found",
                    "details": {"task_id": task_id},
                    "timestamp": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
                }
            }
        )

    # Toggle completion status
    task.completed = not task.completed
    task.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(task)

    return serialize_task(task)
