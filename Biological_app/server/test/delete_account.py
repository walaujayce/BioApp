from config import session_requests
import json
import config 


res= session_requests.post(config.url + 'deleteAccount', headers=config.head)
print(res)
print(json.loads(res.text))