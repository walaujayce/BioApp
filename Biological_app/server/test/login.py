
import requests as re
import json
import config
from config import session_requests
data = {
    "phone":"admin",
    "password":"admin",
}
# data = {
#     "username":"Grorge1234",
#     "password":"Grorge456",
# }
# data = {
#     "username":"grorge",
#     "password":"grorge",
# }
data = {
    "phone":"+886900000002",
    "password":"grorge",
}
res= session_requests.post(config.url + 'login', json=data)#successful
print(res)
print(json.loads(res.text))

res= re.get(config.url + 'login_check', headers=config.head)#error when no header
print(res)
print(res.text)
