import sys

total = 0
with open(sys.argv[1]) as handle:
    for line in handle:
        try:
            total += float(line.split(",")[1])
        except ValueError:
            pass
print(int(total))
