import os
import sched
import time
import random
import json
from datetime import datetime


temperature = 20.5
humidity = 50
pressure = 980
timeApp = 1704756570
c = 0
cd = 0


def resetData():

    return {
    "startTime": int(time.time()),
    "timer": 10,
    "version": 1,
    "temperature": [],
    "pressure": [],
    "humidity": [],
    "time": []
}

data = resetData()

def add_values(t,h,p,tt):
    global data

    data["temperature"].append(t)
    data["humidity"].append(h)
    data["pressure"].append(p)
    data["time"].append(tt)
    
def store_json(storeData):
    json_data = json.dumps(storeData)
    
    current_date = datetime.now().strftime('%Y-%m-%d')
    
    folder_name = 'data'
    
    if not os.path.exists(folder_name):
        os.makedirs(folder_name)
    
    random_number = random.randint(10000, 999999)
    filename = f"{folder_name}/{current_date}-{random_number}.json"
    
    with open(filename, 'w') as file:
        file.write(json_data)
    

def update_values(sc):
    global temperature
    global humidity
    global pressure
    global timeApp
    global running
    global c
    global cd
    global data

    timeApp = int(time.time())   
    c = c + 1
    if cd>0:
        cd -= 1 

    #Random data
    temperature = random.uniform(16, 26)
    humidity = random.randint(30, 70)
    pressure = random.randint(920, 1080)

    #TODO: get data from sense hat


    add_values(temperature,humidity,pressure,timeApp)
    
    date_object = datetime.fromtimestamp(timeApp)
    if c>=8640 or (date_object.hour == 23 and date_object.minute == 59): #23:59
        if cd<=0:
            c = 0
            store_json(data)
            resetData()
            cd = 4 #120

    sc.enter(10, 1, update_values, (sc,))


def start_update():
    global timeApp
    timeApp = int(time.time())  
    
    scheduler = sched.scheduler(time.time, time.sleep)
    scheduler.enter(0, 1, update_values, (scheduler,))
    scheduler.run()
    return

if __name__ == "__main__":
    start_update()