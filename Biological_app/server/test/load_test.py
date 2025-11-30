from config import session_requests
import config 
import time
import threading
import requests
import random
from collections import Counter
from multiprocessing import Pool

def post_data():
    try:
        data = {
            "name": "admin",
            "description": "梅花鹿" + str(random.randint(0, 50000)),
            "photo": "https://www.merit-times.com/news_pic/20210314/1509732_1067191.jpg",
            "lon": 122.3545645645645648238,
            "lat": 25.5564564231564123542354654,
            "time": int(time.time()),
        }
        start_time = time.time()
        res = session_requests.post(config.url + 'data_bird_test', headers=config.head, json=data, timeout=100)
        end_time = time.time()
        return res.status_code, end_time - start_time
    except requests.exceptions.RequestException as e:
        return 500, 0
    except:
        return 700, 0
    

def get_data():
    try:
        data = {
            "st": 0,
            "num": 10,
        }
        start_time = time.time()
        res = session_requests.get(config.url + 'data_bird', headers=config.head, params=data, timeout=100)
        end_time = time.time()
        return res.status_code, end_time - start_time
    except requests.exceptions.RequestException as e:
        return 500, 0
    except:
        return 700, 0

def worker_thread(write_ratio, requests_per_thread):
    local_status_counter = Counter()
    local_api_calls = {"GET": 0, "POST": 0}
    request_times = []

    for _ in range(requests_per_thread):
        r = random.random()
        if r < write_ratio:
            status_code, request_time = post_data()
            local_api_calls["POST"] += 1
        else:
            status_code, request_time = get_data()
            local_api_calls["GET"] += 1

        local_status_counter[status_code] += 1
        if status_code == 200:
            request_times.append(request_time)
    if len(request_times) == 0:
        request_times.append(0)
    return {
        "status_codes": local_status_counter,
        "api_calls": local_api_calls,
        "avg_time": sum(request_times) / len(request_times),
        "max_time": max(request_times),
        "min_time": min(request_times)
    }

def worker_process(args):
    write_ratio, requests_per_thread, threads_per_process = args
    threads = []
    results = []

    for _ in range(threads_per_process):
        t = threading.Thread(target=lambda q: q.append(worker_thread(write_ratio, requests_per_thread)), args=(results,))
        threads.append(t)
        t.start()

    for t in threads:
        t.join()

    process_result = {
        "status_codes": Counter(),
        "api_calls": {"GET": 0, "POST": 0},
        "max_time": 0,
        "min_time": 1000000000,
        "avg_time": 0.0
    }
    for result in results:
        process_result["status_codes"] += result["status_codes"]
        process_result["api_calls"]["GET"] += result["api_calls"]["GET"]
        process_result["api_calls"]["POST"] += result["api_calls"]["POST"]
        process_result["max_time"] = max(process_result["max_time"], result["max_time"])
        process_result["min_time"] = min(process_result["min_time"], result["min_time"])
        process_result["avg_time"] = (process_result["avg_time"] + result["avg_time"] * requests_per_thread)
    process_result["avg_time"] /= threads_per_process * len(results)
    return process_result

def test_load(n_processes, threads_per_process, write_ratio, num):
    requests_per_thread = num // (n_processes * threads_per_process)
    start_time = time.time()
    with Pool(processes=n_processes) as pool:
        process_args = [(write_ratio, requests_per_thread, threads_per_process) for _ in range(n_processes)]
        results = pool.map(worker_process, process_args)

    end_time = time.time()

    global_status_counter = Counter()
    global_api_calls = {"GET": 0, "POST": 0}
    for result in results:
        global_status_counter += result["status_codes"]
        global_api_calls["GET"] += result["api_calls"]["GET"]
        global_api_calls["POST"] += result["api_calls"]["POST"]

    all_times = []
    for result in results:
        all_times.extend([result["avg_time"], result["max_time"], result["min_time"]])

    print("Finished all processes and threads")
    print(f"Time taken for all requests: {end_time - start_time:.2f} seconds")
    print("Status codes statistics:")
    for code, count in global_status_counter.items():
        print(f"Status Code {code}: {count} times")
    print("API calls statistics:")
    print(f"GET: {global_api_calls['GET']} times")
    print(f"POST: {global_api_calls['POST']} times")
    print("Request time statistics:")
    print(f"Average request time: {sum(all_times) / len(all_times):.4f} seconds")
    print(f"Maximum request time: {max(all_times):.4f} seconds")
    print(f"Minimum request time: {min(all_times):.4f} seconds")


if __name__ == "__main__":
    n_processes = 500
    threads_per_process = 1
    write_ratio = 0.5
    num = 500

    test_load(n_processes, threads_per_process, write_ratio, num)
