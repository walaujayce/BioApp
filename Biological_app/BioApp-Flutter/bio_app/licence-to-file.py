import json

with open('licenses.json') as f:
    data = json.load(f)

print(data)