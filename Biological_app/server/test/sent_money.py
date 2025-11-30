from config import session_requests
import json
import config 
import time

data = {
    "name":"grorge",
    "money":"1"
}
res= session_requests.get(config.url + 'money', headers=config.head)
print(res)
print(json.loads(res.text))

res= session_requests.post(config.url + 'money', headers=config.head, json=data)
print(res)
print(json.loads(res.text))

data["money"] = "-1"
res= session_requests.post(config.url + 'money', headers=config.head, json=data)
print(res)
print(json.loads(res.text))
