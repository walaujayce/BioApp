from config import session_requests
import json
import config 
import time
import random

data = {
    "name":"admin",
    # "description":"梅花鹿" + str(random.randint(0,50000)),
    "description": "",
    "photo":"https://www.merit-times.com/news_pic/20210314/1509732_1067191.jpg",
    "lon":122.3545645645645648238,
    "lat":25.5564564231564123542354654,
    "time": int(time.time()),
}
res= session_requests.post(config.url + 'data_bird', headers=config.head, json=data)
print(res)
print(json.loads(res.text))
