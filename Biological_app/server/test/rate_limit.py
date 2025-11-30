from config import session_requests
import json
import config 
from datetime import datetime
import time

data = {
    "st":0, 
    "num":10,
}
for i in range(17):
    time.sleep(0.1)
    print(datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3])
    res= session_requests.get(config.url + 'data_bird', headers=config.head, params=data)
    print(res)
    if(res.status_code != 200):
        print(json.loads(res.text))
    else:
        print("successful")