import requests as re

url = "http://localhost:8080/api/"
# url = "https://bioapp-backend.yikuo.dev/api/"
#admin
# accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaXNfYWRtaW4iOnRydWUsImVtYWlsIjoiZzk3MTE2QHlhaG9vLmNvbSIsInV1aWQiOiIyM2YwNjVkZS1mYjdlLTQ1NGMtOTZkNS0zMjZlYzZkNzBlZTQiLCJpYXQiOjE2OTgxMzQ1NDYsImV4cCI6MjAxMzQ5NDU0Nn0.HFCw-29tINn_nPsBPAtLnfGdAYhdEpvJKpRbd7W0CO8"
#user
# accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ikdlb3JnZTEyMzMiLCJpc19hZG1pbiI6ZmFsc2UsImVtYWlsIjoiZzEyMzMyMTk2QGdtYWlsLmNvbSIsInV1aWQiOiJlYmE5ZTNlZi01ZjY2LTRkZDItYWZlYS0zNjQ1ZjAyNjc2NDYiLCJpYXQiOjE2OTgxMzQ0OTMsImV4cCI6MjAxMzQ5NDQ5M30.K0aILVBR_a0w-zDuv5_8B0ZywVeQ_H5b9qLplJtiT2o"
#local
#admin
# accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaXNfYWRtaW4iOnRydWUsImVtYWlsIjoiYWJjQGFiYzEuY29tIiwidXVpZCI6IjE1ZTVhN2E1LWNkZTMtNGIyMS1iNDQzLWU4ZTU1YmM5ZDYyNCIsImlhdCI6MTcwMTA1NDUyOCwiZXhwIjoyMDE2NDE0NTI4fQ.IAkyUP9TND5amCCSmyzKO_72KvxE_BURg_mvstGsQa0"
#user
accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imdyb3JnZSIsImlzX2FkbWluIjpmYWxzZSwiZW1haWwiOiJhYmNAYWJjMi5jb20iLCJ1dWlkIjoiOTI2NjczZTctMGNiMi00ZmIxLTg3ZmMtOTFhZThlMTYyYzg3IiwiaWF0IjoxNzAxMDU0ODM5LCJleHAiOjIwMTY0MTQ4Mzl9.cHqfQX8PnFq5t_voMsvd4Dv5VCcpwAG9jxKWZALQ8Js"
head = {
    # "accessToken":accessToken,
    "Authorization": "Bearer " + accessToken,
    }
session_requests = re.session()
# res= session_requests.get(url + 'csrfToken')#successful
# head["CSRF-Token"] = res.text
