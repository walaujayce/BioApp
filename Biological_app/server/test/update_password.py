from config import session_requests
import json
import config 
import time

data = {
    "password":"Test12345678"
}
res= session_requests.post(config.url + 'update_password', headers=config.head, json=data)
print(res)
print(json.loads(res.text))