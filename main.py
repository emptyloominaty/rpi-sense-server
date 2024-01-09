import os
import server
import senselog
import ntplib

from flask import Flask, jsonify, render_template, send_from_directory
from time import ctime

def resetData():
    return {
    "startTime": 0,
    "timer": 10,
    "version": 1,
    "temperature": [],
    "pressure": [],
    "humidity": [],
    "time": []
}

data = resetData()

temperature = 20.5
humidity = 50
pressure = 980
time = 1704756570

def get_internet_time():
    try:
        ntp_client = ntplib.NTPClient()
        response = ntp_client.request('pool.ntp.org', timeout=3)  
        internet_time = ctime(response.tx_time)
        return internet_time
    except (ntplib.NTPClient.NTPException, ntplib.NTPException, ntplib.NTPNoResponse, OSError) as e:
        print(f"Error fetching internet time: {e}")
        return None

# Get the current internet time
current_time = get_internet_time()
if current_time:
    print(f"The current internet time is: {current_time}")
else:
    print("Unable to fetch internet time.")

#TODO
time = current_time


app = Flask(__name__)



@app.route('/get_data')
def get_data():
    return jsonify(data)

@app.route('/list_json_files')
def list_json_files():
    files = [file for file in os.listdir("data") if file.endswith('.json')]
    return jsonify(files)

@app.route('/data/<path:filename>')
def serve_json(filename):
    return send_from_directory('data', filename, mimetype='application/json')


@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
    
