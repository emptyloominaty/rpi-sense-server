let processData = function (originalData, chunkSize, average) {



    let filteredData = [];

    let sum = 0
    let count = 0

    for (let i = 0; i < originalData.length; i++) {
        sum += originalData[i]

        count++

        if (count === chunkSize) {
            if (average) {
                filteredData.push(sum / chunkSize)
            } else {
                filteredData.push(originalData[i])
            }   
            sum = 0
            count = 0
        }
    }



    return filteredData;
}

let processJson = function(originalJson, chunkSize, average) {
    originalJson.temperature = processData(originalJson.temperature, chunkSize, average)
    originalJson.pressure = processData(originalJson.pressure, chunkSize, average)
    originalJson.humidity = processData(originalJson.humidity, chunkSize, average)

    let count = 0
    let time = []
    for (let i = 0; i < originalJson.time.length; i++) {
        count++
        if (count === chunkSize) {
            time.push(originalJson.time[i])
            count = 0
        }
    }
    originalJson.time = time

}

let getChunkSize = function (jsonData) {
    let length = jsonData.time.length
    if (length < options.maxValues) {
        return 1;
    } else {
        return Math.round(length / options.maxValues);
    }
}

let updateCharts = function (process = false) {

    if (process) {
        processJson(jsonData, getChunkSize(jsonData), options.average);
    }


    temperatureChart.data.datasets[0].data = jsonData.temperature
    temperatureChart.data.labels = jsonData.time
    temperatureChart.update()

    pressureChart.data.datasets[0].data = jsonData.pressure
    pressureChart.data.labels = jsonData.time
    pressureChart.update()

    humidityChart.data.datasets[0].data = jsonData.humidity
    humidityChart.data.labels = jsonData.time
    humidityChart.update()
}