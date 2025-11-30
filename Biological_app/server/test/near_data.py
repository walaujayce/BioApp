from config import session_requests
import json
import config 

data = {
    "st":0, 
    "num":20,
	"lat": 25.036830,
	"lon":	121.055949,
	"upload": True,
	"sort": "id",
	"order": "DESC",
}


res= session_requests.get(config.url + 'near_data_bird', headers=config.head, params=data)
print(res)
print(json.loads(res.text))