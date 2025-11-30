from config import session_requests
import json
import config 

data = {
    "account":"Grorge123",
	"admin":"true"
}
res = session_requests.get(config.url + 'admin', headers=config.head, params={"queryname":"Grorge123"})
print(res)
print(json.loads(res.text))#false
res = session_requests.get(config.url + 'admin', headers=config.head, params={"queryname":"admin"})
print(res)
print(json.loads(res.text))#true
res = session_requests.post(config.url + 'admin', headers=config.head, json=data)
print(res)
print(json.loads(res.text))#success
res = session_requests.get(config.url + 'admin', headers=config.head, params={"queryname":"Grorge123"})
print(res)
print(json.loads(res.text))#true
data["admin"] = "false"
res = session_requests.post(config.url + 'admin', headers=config.head, json=data)
print(res)
print(json.loads(res.text))#success
res = session_requests.get(config.url + 'admin', headers=config.head, params={"queryname":"Grorge123"})
print(res)
print(json.loads(res.text))#false
