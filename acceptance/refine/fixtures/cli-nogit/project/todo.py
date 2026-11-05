import json
import sys
from pathlib import Path

STORE = Path("tasks.json")


def load():
    return json.loads(STORE.read_text()) if STORE.exists() else []


def save(tasks):
    STORE.write_text(json.dumps(tasks, indent=2))


def main(argv):
    if not argv:
        print("usage: todo.py add <text> | list")
        return 2
    tasks = load()
    if argv[0] == "add":
        tasks.append({"id": len(tasks) + 1, "text": " ".join(argv[1:])})
        save(tasks)
        return 0
    if argv[0] == "list":
        for task in tasks:
            print(f"{task['id']}. {task['text']}")
        return 0
    print(f"unknown command: {argv[0]}", file=sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
