from datetime import datetime
import os
import senselog
import time


from flask import Flask, jsonify, render_template, send_from_directory
from threading import Thread

def start_logging():
    senselog.start_update()
    return

app = Flask(__name__)

@app.route('/get_values')
def get_values():
    testTime = int(time.time())   
    date_object = datetime.fromtimestamp(testTime)
    print(str(date_object.hour)+":"+str(date_object.minute)+":"+str(date_object.second)+" cd:"+str(senselog.cd)+" c:"+str(senselog.c))
    
    return jsonify({
        "temperature": senselog.temperature,
        "humidity": senselog.humidity,
        "pressure": senselog.pressure,
        "time": senselog.timeApp,
        "c": senselog.c
    })

@app.route('/store_data', methods=['POST'])
def store_data():
    senselog.runStoreFunction = True
    return jsonify({'status': 'success', 'message': 'Temperature logging stored'})

#TODO
@app.route('/toggle_led', methods=['POST'])
def toggle_led():
    senselog.toggleLED = True
    return jsonify({'status': 'success', 'message': 'led'})


@app.route('/get_data')
def get_data():
    return jsonify(senselog.data)

@app.route('/list_json_files')
def list_json_files():
    files = [file for file in os.listdir("/home/user/data") if file.endswith('.json')]
    return jsonify(files)

@app.route('/data/<path:filename>')
def serve_json(filename):
    return send_from_directory('data', filename, mimetype='application/json')


@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
     script_thread = Thread(target=start_logging)
     script_thread.daemon = True
     script_thread.start()
     app.run(host='0.0.0.0', debug=False)


        
    
