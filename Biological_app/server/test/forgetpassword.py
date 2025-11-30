import requests as re
import json
import config
from config import session_requests

data = {
    "email":"g12332196@yahoo.com"
}
res= session_requests.post(config.url + 'forgetpassword', json=data)#successful
print(res)
print(json.loads(res.text))