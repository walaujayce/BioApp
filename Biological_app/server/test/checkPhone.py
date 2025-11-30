
import requests as re
import json
import config
from config import session_requests

data = {
    "username":"Grorge1234",
    "verifyid":"123456",
}

res= re.post(config.url + 'checkPhone', json=data)#error when no header
print(res)
print(res.text)
