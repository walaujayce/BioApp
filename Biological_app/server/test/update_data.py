from config import session_requests
import json
import config 
import time

data = {
    "id":31,
    "name":"admin2",
    "description":"test",
    "photo":"no photo url",
    "lon":25.85,
    "lat":25.32,
    "invalid": False,
    "time": time.time(),
}
res= session_requests.put(config.url + 'data_bird', headers=config.head, json=data)
print(res)
print(json.loads(res.text))