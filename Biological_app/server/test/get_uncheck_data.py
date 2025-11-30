from config import session_requests
import json
import config 

data = {
    "st":0, 
    "num":10,
    # "lon":122,
    # "lat":25,
    # "upload": "true",
}
res= session_requests.get(config.url + 'uncheck_data_bird', headers=config.head, params=data)
print(res)
print(res.text)
# print(json.loads(res.text))