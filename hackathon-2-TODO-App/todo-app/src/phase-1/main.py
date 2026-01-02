"""
Console-based Todo List Manager - Phase I Implementation.

Entry point with interactive menu loop for task management.
References: specs/phase-1/spec.md
"""

import sys
import io
from task_manager import TaskManager

# Fix UTF-8 encoding on Windows for Unicode checkboxes
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


def print_menu() -> None:
    """Display the main menu options."""
    print("\n=== Todo List Manager ===")
    print("1. Add Task")
    print("2. View Tasks")
    print("3. Update Task")
    print("4. Delete Task")
    print("5. Toggle Complete")
    print("6. Exit")


def add_task_interactive(manager: TaskManager) -> None:
    """
    Interactive flow for adding a new task.

    Args:
        manager: TaskManager instance
    """
    print("\n> Add Task")
    title = input("Enter title: ").strip()

    if not title:
        print("✗ Title cannot be empty.")
        return

    description = input("Enter description (optional): ").strip()

    try:
        task = manager.add_task(title, description)
        print(f'✓ Task #{task["id"]} created: "{task["title"]}"')
    except ValueError as e:
        print(f"✗ {str(e)}")


def view_tasks_interactive(manager: TaskManager) -> None:
    """
    Display all tasks.

    Args:
        manager: TaskManager instance
    """
    print("\n> Your Tasks:")
    print(manager.format_task_list())


def update_task_interactive(manager: TaskManager) -> None:
    """
    Interactive flow for updating a task.

    Args:
        manager: TaskManager instance
    """
    print("\n> Update Task")
    try:
        task_id = int(input("Enter task ID: ").strip())
    except ValueError:
        print("✗ Invalid task ID. Please enter a number.")
        return

    task = manager.get_task(task_id)
    if task is None:
        print(f"✗ Task #{task_id} not found.")
        return

    print(f'Current title: "{task["title"]}"')
    new_title = input("New title (press Enter to keep current): ").strip()

    print(f'Current description: "{task["description"]}"')
    new_description = input("New description (press Enter to keep current): ").strip()

    # Only update if user provided new values
    title_update = new_title if new_title else None
    description_update = new_description if new_description else None

    if title_update is None and description_update is None:
        print("✗ No changes made.")
        return

    try:
        manager.update_task(task_id, title_update, description_update)
        print(f"✓ Task #{task_id} updated")
    except ValueError as e:
        print(f"✗ {str(e)}")


def delete_task_interactive(manager: TaskManager) -> None:
    """
    Interactive flow for deleting a task with confirmation.

    Args:
        manager: TaskManager instance
    """
    print("\n> Delete Task")
    try:
        task_id = int(input("Enter task ID: ").strip())
    except ValueError:
        print("✗ Invalid task ID. Please enter a number.")
        return

    task = manager.get_task(task_id)
    if task is None:
        print(f"✗ Task #{task_id} not found.")
        return

    confirmation = input(f'Confirm delete "{task["title"]}"? (y/n): ').strip().lower()

    if confirmation in ['y', 'yes']:
        manager.delete_task(task_id)
        print(f"✓ Task #{task_id} deleted")
    else:
        print("✗ Deletion cancelled.")


def toggle_complete_interactive(manager: TaskManager) -> None:
    """
    Interactive flow for toggling task completion status.

    Args:
        manager: TaskManager instance
    """
    print("\n> Toggle Complete")
    try:
        task_id = int(input("Enter task ID: ").strip())
    except ValueError:
        print("✗ Invalid task ID. Please enter a number.")
        return

    task = manager.toggle_complete(task_id)
    if task is None:
        print(f"✗ Task #{task_id} not found.")
        return

    status = "complete" if task["completed"] else "incomplete"
    print(f"✓ Task #{task_id} marked as {status}")


def main() -> None:
    """Main application loop."""
    manager = TaskManager()

    print("Welcome to Todo List Manager!")
    print("Manage your tasks with simple commands.")

    while True:
        print_menu()
        choice = input("\nChoose an option (1-6): ").strip()

        if choice == "1":
            add_task_interactive(manager)
        elif choice == "2":
            view_tasks_interactive(manager)
        elif choice == "3":
            update_task_interactive(manager)
        elif choice == "4":
            delete_task_interactive(manager)
        elif choice == "5":
            toggle_complete_interactive(manager)
        elif choice == "6":
            print("\nGoodbye! Your tasks will be cleared (in-memory only).")
            break
        else:
            print("✗ Invalid option. Please choose 1-6.")


if __name__ == "__main__":
    main()
