import json
import sys
from pathlib import Path

STORE = Path("ledger.json")


def main(argv):
    records = json.loads(STORE.read_text()) if STORE.exists() else []
    if argv[:1] == ["add"]:
        records.append({"account": argv[1], "amount": float(argv[2])})
        STORE.write_text(json.dumps(records, indent=2))
    elif argv[:1] == ["total"]:
        print(sum(record["amount"] for record in records))
    else:
        print("usage: ledger.py add <account> <amount> | total")


if __name__ == "__main__":
    main(sys.argv[1:])
