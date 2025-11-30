from config import session_requests
import json
import config 

data = {
    "id":4,
}
res= session_requests.delete(config.url + 'data_bird', headers=config.head, params=data)
print(res)
print(json.loads(res.text))