from config import session_requests
import json
import config 

data = {
    "st":0, 
    "num":10,
}
res= session_requests.get(config.url + 'data_bird', headers=config.head, params=data)
print(res)
print(json.loads(res.text))