"""
Automated demo script for Phase I Console Application.

Demonstrates all 5 core features without user interaction.
"""

import sys
import io
from task_manager import TaskManager

# Fix UTF-8 encoding on Windows for Unicode checkboxes
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


def print_section(title: str) -> None:
    """Print a section header."""
    print(f"\n{'=' * 50}")
    print(f"  {title}")
    print('=' * 50)


def demo_phase_1() -> None:
    """Run automated demonstration of all Phase I features."""
    manager = TaskManager()

    print("🎯 Evolution of Todo - Phase I Console Application Demo")
    print("Demonstrating Spec-Driven Development with Claude Code")

    # Feature 1: Add Task
    print_section("Feature 1: Add Task")
    task1 = manager.add_task("Buy groceries", "Milk, eggs, bread, apples")
    print(f'✓ Task #{task1["id"]} created: "{task1["title"]}"')
    print(f'  Description: {task1["description"]}')

    task2 = manager.add_task("Call mom")
    print(f'✓ Task #{task2["id"]} created: "{task2["title"]}"')

    task3 = manager.add_task("Finish project report", "Include charts and summary")
    print(f'✓ Task #{task3["id"]} created: "{task3["title"]}"')

    # Feature 2: View Task List
    print_section("Feature 2: View Task List")
    print(manager.format_task_list())

    # Feature 5: Toggle Complete
    print_section("Feature 5: Toggle Complete")
    manager.toggle_complete(2)
    print('✓ Task #2 marked as complete')
    print("\nUpdated task list:")
    print(manager.format_task_list())

    # Feature 3: Update Task
    print_section("Feature 3: Update Task")
    manager.update_task(1, title="Buy groceries and fruits")
    print('✓ Task #1 title updated')
    manager.update_task(3, description="Include charts, summary, and recommendations")
    print('✓ Task #3 description updated')
    print("\nUpdated task list:")
    print(manager.format_task_list())

    # Feature 4: Delete Task
    print_section("Feature 4: Delete Task")
    deleted = manager.delete_task(2)
    if deleted:
        print(f'✓ Task #{deleted["id"]} deleted: "{deleted["title"]}"')
    print("\nFinal task list:")
    print(manager.format_task_list())

    # Show validation
    print_section("Validation Examples")
    print("Testing input validation:")

    try:
        manager.add_task("")
    except ValueError as e:
        print(f"✓ Empty title rejected: {e}")

    try:
        manager.add_task("a" * 201)
    except ValueError as e:
        print(f"✓ Long title rejected: {e}")

    try:
        manager.add_task("Valid title", "a" * 1001)
    except ValueError as e:
        print(f"✓ Long description rejected: {e}")

    # Show error handling
    print_section("Error Handling Examples")
    print("Testing error handling:")

    task = manager.get_task(999)
    if task is None:
        print("✓ Non-existent task (ID 999) returns None")

    task = manager.delete_task(999)
    if task is None:
        print("✓ Deleting non-existent task returns None (no error)")

    print_section("Demo Complete!")
    print("✅ All 5 features demonstrated successfully")
    print("✅ Validation working correctly")
    print("✅ Error handling graceful")
    print("\n📖 See README.md for interactive usage")
    print("📝 See specs/phase-1/spec.md for detailed specification")


if __name__ == "__main__":
    demo_phase_1()
