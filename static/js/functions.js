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
            time.push(convertTime(originalJson.time[i]))
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


let fetchValues = function () {
    let ping0 = performance.now()
    fetch('/get_values')
        .then(response => response.json())
        .then(data => {
            current.temperature = data.temperature
            current.humidty = data.humidity
            current.pressure = data.pressure
            current.time = data.time
            current.c = data.c

            current.ping = (performance.now() - ping0)

            elements.Ping.textContent = Math.round(current.ping * 100) / 100 + "ms"

            const date = new Date(current.time * 1000)
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            const seconds = String(date.getSeconds()).padStart(2, '0')
            

            elements.temperatureHVal.textContent = current.temperature.toFixed(1) + " C"
            elements.pressureHVal.textContent = (current.pressure / 1000).toFixed(3) + " bar"
            elements.humidityHVal.textContent = current.humidity + " %"

            elements.Time.textContent = `${hours}:${minutes}:${seconds}`
        })
        .catch(error => console.error('Error fetching values:', error))
}



let convertTime = function (time) {
    const date = new Date(time * 1000)
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
}

let openWindow = function () {
    let htmlStr = "<div class='windowBody'> <div class='windowHeader'><span> </span> <div onclick='closeWindow()'>x</div></div>"

    htmlStr += '<div><input type="range" onchange="options.maxValues = Number(this.value); document.getElementById(\'maxValuesText\').textContent = Number(this.value);" step="50" value="' + options.maxValues + '" min="100" max="4000">' +
        '<span id="maxValuesText">' + options.maxValues + '</span></div>'

    /*htmlStr += '<select name="jsonDataDropdown" id="jsonDataDropdown"  onchange="changeFile(this)">>'
    htmlStr += '<option value="Current Data"> Current Data </option>'
    Object.keys(jsonDataFiles).forEach((filename) => {
        htmlStr += '<option value="' + filename + '">' + filename + '</option>'
    });
    htmlStr += '</select>'*/

    let optionsArray = [];
    Object.keys(jsonDataFiles).forEach((filename) => {
        optionsArray.push('<option value="' + filename + '">' + filename + '</option>')
    });
    optionsArray.push('<option value="Current Data">Current Data</option>')

    optionsArray.reverse();

    htmlStr += '<select name="jsonDataDropdown" id="jsonDataDropdown" onchange="changeFile(this)">' + optionsArray.join('') + '</select>'

    htmlStr += '<select name="dayDropdown" id="dayDropdown" onchange="show = this.value"> <option value="day">file</option> <option value="multifile-day">day</option> <option value="week">week</option> <option value="month">month</option> <option value="year">year</option>  </select >'



    htmlStr += "</div>"
    elements.window.innerHTML = htmlStr
}

let sortJson = function () {
    // Combine arrays into an array of objects
    let combinedArray = jsonData.time.map((value, index) => ({
        temperature: jsonData.temperature[index],
        humidity: jsonData.humidity[index],
        pressure: jsonData.pressure[index],
        time: value
    }));

    // Sort the array of objects based on the 'time' property
    combinedArray.sort((a, b) => a.time - b.time);

    // Extract sorted values back into separate arrays in the jsonData object
    jsonData.temperature = combinedArray.map(obj => obj.temperature);
    jsonData.humidity = combinedArray.map(obj => obj.humidity);
    jsonData.pressure = combinedArray.map(obj => obj.pressure);
    jsonData.time = combinedArray.map(obj => obj.time);
}


function changeFile(selectElement) {
    let selectedFilename = selectElement.value;
    let selectedJsonData = ""
    if (selectedFilename !== "Current Data") {
        selectedJsonData = jsonDataFiles[selectedFilename]
        if (show == "day") {
            jsonData = JSON.parse(JSON.stringify(selectedJsonData))

        } else if (show == "multifile-day") {
            let dayArray = []

            let a = JSON.parse(JSON.stringify(selectedJsonData))
            let parts = selectedFilename.split("-");
            let year = parseInt(parts[0]);
            let month = parseInt(parts[1]);
            let day = parseInt(parts[2]);
            Object.keys(jsonDataFiles).forEach(function (key) {
                let parts2 = key.split("-");
                let year2 = parseInt(parts2[0]);
                let month2 = parseInt(parts2[1]);
                let day2 = parseInt(parts2[2]);

                if (year2 == year && month2 == month && day2 == day) {
                    dayArray.push(key)
                }
            });

            concatenatedArrayT = []
            concatenatedArrayH = []
            concatenatedArrayP = []
            concatenatedArrayTT = []
            for (let i = 0; i < dayArray.length; i++) {
                concatenatedArrayT = concatenatedArrayT.concat(jsonDataFiles[dayArray[i]].temperature)
                concatenatedArrayH = concatenatedArrayH.concat(jsonDataFiles[dayArray[i]].humidity)
                concatenatedArrayP = concatenatedArrayP.concat(jsonDataFiles[dayArray[i]].pressure)
                concatenatedArrayTT = concatenatedArrayTT.concat(jsonDataFiles[dayArray[i]].time)
            }

            jsonData = JSON.parse(JSON.stringify(selectedJsonData))
            jsonData.temperature = concatenatedArrayT
            jsonData.humidity = concatenatedArrayH
            jsonData.pressure = concatenatedArrayP
            jsonData.time = concatenatedArrayTT

            sortJson()

        } else if (show == "week") {
            let a = JSON.parse(JSON.stringify(selectedJsonData))
            let parts = selectedFilename.split("-");
            let year = parseInt(parts[0]);
            let month = parseInt(parts[1]);
            let day = parseInt(parts[2]);




        } else if (show == "month") {
            let a = JSON.parse(JSON.stringify(selectedJsonData))
            let parts = selectedFilename.split("-");
            let year = parseInt(parts[0]);
            let month = parseInt(parts[1]);

        } else if (show == "year") {
            let a = JSON.parse(JSON.stringify(selectedJsonData))
            let parts = selectedFilename.split("-");
            let year = parseInt(parts[0]);

        }
    } else {
        jsonData = JSON.parse(JSON.stringify(currentJson))
    }

    updateCharts(true)
   
}


let closeWindow = function () {
    elements.window.innerHTML = ""
    localStorage.setItem("maxValues", options.maxValues)
}