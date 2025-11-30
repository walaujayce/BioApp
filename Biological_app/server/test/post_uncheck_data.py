from config import session_requests
import json
import config 

data = {
    "id":6
}
res = session_requests.post(config.url + 'uncheck_data_bird', headers=config.head, json=data)
print(res)
print(json.loads(res.text))