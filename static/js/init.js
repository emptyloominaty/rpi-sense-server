let options = {
    average: true,
    maxValues: 500,
    tempOffset: 0.8,
    last24h: true
}

if (localStorage.getItem("maxValues")) {
    options.maxValues = localStorage.getItem("maxValues")
}
if (localStorage.getItem("tempOffset")) {
    options.tempOffset = localStorage.getItem("tempOffset")
}
if (localStorage.getItem("last24h")) {
    options.tempOffset = localStorage.getItem("last24h")
}

let show = "day" //day, week, month, year
let optionsWindow = false


let elements = {
    app: document.getElementById("app"),
    header: document.getElementById("header"),
    temperatureHVal: document.getElementById("temperatureHVal"),
    pressureHVal: document.getElementById("pressureHVal"),
    humidityHVal: document.getElementById("humidityHVal"),
    chartT: document.getElementById("chartT"),
    chartH: document.getElementById("chartH"),
    chartP: document.getElementById("chartP"),
    statusText: document.getElementById("statusText"),
    Time: document.getElementById("Time"),
    Ping: document.getElementById("Ping"),
    window: document.getElementById("window"),
}

let jsonData = {
    "startTime": 1704704812,
    "timer": 10,
    "version": 1,
    "temperature": [27.8, 28.7, 29.6, 30.3, 27.4, 25.5, 22.6, 21.7, 20.9, 19.1, 20.0, 21.6, 21.3, 21.0, 22.3, 22.1, 22.9],
    "pressure":    [1000, 995 , 992 , 996 , 997 , 998 , 999 , 1000, 1002, 1005, 1007, 1004, 1003, 1001, 1000, 996, 997],
    "humidity": [45, 47, 49, 50, 51, 53, 52, 54, 53, 52, 51, 50, 48, 46, 47, 46, 48],
    "time": [1704704812, 1704704822, 1704704832, 1704704842, 1704704852, 1704704862, 1704704872, 1704704882, 1704704892, 1704704902, 1704704912, 1704704922, 1704704932, 1704704942, 1704704952, 1704704962, 1704704972]
}

let current = {
    temperature: 22,
    pressure: 1000,
    humidity: 50,
    time: 1704704812,
    c: 0
}

let temperatureChart
let pressureChart
let humidityChart
let currentData = true
let starting = true

let init = function () {
    statusText.textContent = "..."

    starting = false
    jsonData = JSON.parse(JSON.stringify(currentJson))


    processJson(jsonData, getChunkSize(jsonData), options.average)

    if (options.tempOffset!==0) {
        for (let i = 0; i<jsonData.temperature.length; i++) {
            if (jsonData.temperature[i]!==null && jsonData.temperature[i]!==0) {
                jsonData.temperature[i] -= options.tempOffset
            }
        }
    }

    temperatureChart = new Chart(
        elements.chartT,
        {
            type: 'line',
            data: {
                labels: jsonData.time,
                datasets: [
                    {
                        label: 'Temperature',
                        data: jsonData.temperature,
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                pointStyle: false/*,
                animation: {
                    duration: 0
                }*/
            }
        }
    )



    pressureChart = new Chart(
        elements.chartP,
        {
            type: 'line',
            data: {
                labels: jsonData.time,
                datasets: [
                    {
                        label: 'Pressure',
                        data: jsonData.pressure,
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                pointStyle: false/*,
                animation: {
                    duration: 0
                }*/
            }
          
        }
    )


    humidityChart = new Chart(
        elements.chartH,
        {
            type: 'line',
            data: {
                labels: jsonData.time,
                datasets: [
                    {
                        label: 'Humidity',
                        data: jsonData.humidity,
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                pointStyle: false/*,
                animation: {
                    duration: 0
                }*/
            }
        }
    )
}




