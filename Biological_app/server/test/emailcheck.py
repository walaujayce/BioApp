from config import session_requests
import json
import config 

url = 'checkEmail/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50IjoiR3JvcmdlMTIzNCIsImV4cGlyZXMiOjE2NDU0NTYzMzkwNDEsImlhdCI6MTY0NTQ1NTEzOX0.7BQBSGWFrYh47ur-z-g4EOc_IQKYZg6tx54Sj-dWbQY'
res= session_requests.get(config.url + url)
print(res)
print(res.text)
