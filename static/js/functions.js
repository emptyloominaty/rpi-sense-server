let processData = function (originalData, chunkSize, average) {
    let filteredData = []
    let sum = 0
    let count = 0

    let nullVal = false
    let nullSegment = false

    for (let i = 0; i < originalData.length; i++) {
        nullVal = false
        sum += originalData[i]

        if (originalData[i] == null) { //TODO TEST
            nullVal = true 
            nullSegment = true
        }
        

        count++

        if (count === chunkSize) {
            if (average && !nullVal && !nullSegment) {
                filteredData.push(sum / chunkSize)
            } else {
                filteredData.push(originalData[i])
            }   
            sum = 0
            count = 0
            nullSegment = false
        }
    }

    return filteredData
}

let processJson = function(originalJson, chunkSize, average, type = "day") {
    originalJson.temperature = processData(originalJson.temperature, chunkSize, average)
    originalJson.pressure = processData(originalJson.pressure, chunkSize, average)
    originalJson.humidity = processData(originalJson.humidity, chunkSize, average)

    let count = 0
    let time = []
    for (let i = 0; i < originalJson.time.length; i++) {
        count++
        if (count === chunkSize) {
            time.push(convertTime(originalJson.time[i],type))
            count = 0
        }
    }
    originalJson.time = time

}

let getChunkSize = function (jsonData) {
    let length = jsonData.time.length
    if (length < options.maxValues) {
        return 1
    } else {
        return Math.round(length / options.maxValues)
    }
}

let updateCharts = function (process = false,type2 = "day") {

    if (process) {
        processJson(jsonData, getChunkSize(jsonData), options.average,type2)
    }

    if (options.tempOffset!==0) {
        for (let i = 0; i<jsonData.temperature.length; i++) {
            if (jsonData.temperature[i]!==null && jsonData.temperature[i]!==0) {
                jsonData.temperature[i] -= options.tempOffset
            }
        }
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
            current.humidity = data.humidity
            current.pressure = data.pressure
            current.time = data.time
            current.c = data.c

            current.ping = (performance.now() - ping0)

            elements.Ping.textContent = Math.round(current.ping * 100) / 100 + "ms"

            const date = new Date(current.time * 1000)
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            const seconds = String(date.getSeconds()).padStart(2, '0')
            

            elements.temperatureHVal.textContent = (current.temperature-options.tempOffset).toFixed(1) + " C"
            elements.pressureHVal.textContent = (current.pressure / 1000).toFixed(3) + " bar"
            elements.humidityHVal.textContent = current.humidity.toFixed(0) + " %"

            elements.Time.textContent = `${hours}:${minutes}:${seconds}`
        })
        .catch(error => console.error('Error fetching values:', error))
}



let convertTime = function (time, type) {


    const date = new Date(time * 1000)
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const month = String(date.getMonth() + 1)
    const day = String(date.getDate());

    if (type == "day") {
        return `${hours}:${minutes}`
    } else if (type == "week") {
        return `${day}.${month}. ${hours}`
    } else if (type == "month") {
        return `${day}.${month}.`
    } else if (type == "year") {
        return `${month}`
    }
    
}

let fillGapsJson = function () {
    let prevTime = jsonData.startTime
    for (let i = 0; i < jsonData.time.length; i++) {

        if (jsonData.time[i] > prevTime + 19) {
            let delta = jsonData.time[i] - prevTime
            let a = delta / jsonData.timer
            let count = 0
            for (let j = 0; j < a; j++) {
                count++
                jsonData.time.splice(i + j, 0, prevTime + (jsonData.timer * count))
                jsonData.temperature.splice(i + j, 0, null)
                jsonData.pressure.splice(i + j, 0, null)
                jsonData.humidity.splice(i + j, 0, null)
            }
            i = i + (a-1)
        }

        prevTime = jsonData.time[i]
    }

}

let storeLoggingData = function () {
    fetch('/store_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {
            console.log(data)
        })
        .catch(error => {
            console.error('Error storring logging:', error)
        })
}

let openWindow = function () {
    let htmlStr = "<div class='windowBody'> <div class='windowHeader'><span> </span> <div onclick='closeWindow()'>x</div></div>"

    htmlStr += '<button onclick="storeLoggingData()">Store</button><br>'

    htmlStr += '<label for="numberInput">Temp Offset: -</label>' +
        '  <input type="number" id="numberInput" onchange="options.tempOffset = Number(this.value);" step="0.1" value="options.tempOffset"><br>'
    htmlStr += '<div><label for="maxValuesInput">Max Values: </label>'
    htmlStr += '<input id="maxValuesInput" type="range" onchange="options.maxValues = Number(this.value); document.getElementById(\'maxValuesText\').textContent = Number(this.value);" step="50" value="' + options.maxValues + '" min="100" max="4000">' +
        '<span id="maxValuesText">' + options.maxValues + '</span></div>'

    let optionsArray = []
    Object.keys(jsonDataFiles).forEach((filename) => {
        optionsArray.push('<option value="' + filename + '">' + filename + '</option>')
    })
    optionsArray.push('<option value="Current Data">Current Data</option>')

    optionsArray.reverse()

    htmlStr += '<select name="jsonDataDropdown" id="jsonDataDropdown" onchange="changeFile(this)">' + optionsArray.join('') + '</select>'

    htmlStr += '<select name="dayDropdown" id="dayDropdown" onchange="show = this.value"> <option value="day">file</option> <option value="multifile-day">day</option> <option value="week">week</option> <option value="month">month</option> <option value="year">year</option>  </select >'



    htmlStr += "</div>"
    elements.window.innerHTML = htmlStr
    document.getElementById("numberInput").value = options.tempOffset

}

let sortJson = function () {
    // Combine arrays into an array of objects
    let combinedArray = jsonData.time.map((value, index) => ({
        temperature: jsonData.temperature[index],
        humidity: jsonData.humidity[index],
        pressure: jsonData.pressure[index],
        time: value
    }))

    // Sort the array of objects based on the 'time' property
    combinedArray.sort((a, b) => a.time - b.time)

    // Extract sorted values back into separate arrays in the jsonData object
    jsonData.temperature = combinedArray.map(obj => obj.temperature)
    jsonData.humidity = combinedArray.map(obj => obj.humidity)
    jsonData.pressure = combinedArray.map(obj => obj.pressure)
    jsonData.time = combinedArray.map(obj => obj.time)

    fillGapsJson()
}


function changeFile(selectElement) {
    let selectedFilename = selectElement.value
    let selectedJsonData = ""
    let type2 = "day"
    if (selectedFilename !== "Current Data") {
        selectedJsonData = jsonDataFiles[selectedFilename]
        if (show == "day") {
            jsonData = JSON.parse(JSON.stringify(selectedJsonData))

        } else if (show == "multifile-day") {
            let dayArray = []
            let parts = selectedFilename.split("-")
            let year = parseInt(parts[0])
            let month = parseInt(parts[1])
            let day = parseInt(parts[2])
            Object.keys(jsonDataFiles).forEach(function (key) {
                let parts2 = key.split("-")
                let year2 = parseInt(parts2[0])
                let month2 = parseInt(parts2[1])
                let day2 = parseInt(parts2[2])

                if (year2 == year && month2 == month && day2 == day) {
                    dayArray.push(key)
                }
            })

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
            type2 = "week"
            let weekArray = []
            let parts = selectedFilename.split("-")
            let year = parseInt(parts[0])
            let month = parseInt(parts[1])
            let day = parseInt(parts[2])
            let dayMax = day+6
            Object.keys(jsonDataFiles).forEach(function (key) {
                let parts2 = key.split("-")
                let year2 = parseInt(parts2[0])
                let month2 = parseInt(parts2[1])
                let day2 = parseInt(parts2[2])

                if (year2 == year && month2 == month && (day2 >= day && day2 <= dayMax)  ) {
                    weekArray.push(key)
                }
            })

            concatenatedArrayT = []
            concatenatedArrayH = []
            concatenatedArrayP = []
            concatenatedArrayTT = []
            for (let i = 0; i < weekArray.length; i++) {
                concatenatedArrayT = concatenatedArrayT.concat(jsonDataFiles[weekArray[i]].temperature)
                concatenatedArrayH = concatenatedArrayH.concat(jsonDataFiles[weekArray[i]].humidity)
                concatenatedArrayP = concatenatedArrayP.concat(jsonDataFiles[weekArray[i]].pressure)
                concatenatedArrayTT = concatenatedArrayTT.concat(jsonDataFiles[weekArray[i]].time)
            }

            jsonData = JSON.parse(JSON.stringify(selectedJsonData))
            jsonData.temperature = concatenatedArrayT
            jsonData.humidity = concatenatedArrayH
            jsonData.pressure = concatenatedArrayP
            jsonData.time = concatenatedArrayTT

            sortJson()

        } else if (show == "month") {
            type2 = "month"
            let parts = selectedFilename.split("-")
            let year = parseInt(parts[0])
            let month = parseInt(parts[1])

            let monthArray = []
           
            Object.keys(jsonDataFiles).forEach(function (key) {
                let parts2 = key.split("-")
                let year2 = parseInt(parts2[0])
                let month2 = parseInt(parts2[1])
 
                if (year2 == year && month2 == month) {
                    monthArray.push(key)
                }
            })

            concatenatedArrayT = []
            concatenatedArrayH = []
            concatenatedArrayP = []
            concatenatedArrayTT = []
            for (let i = 0; i < monthArray.length; i++) {
                concatenatedArrayT = concatenatedArrayT.concat(jsonDataFiles[monthArray[i]].temperature)
                concatenatedArrayH = concatenatedArrayH.concat(jsonDataFiles[monthArray[i]].humidity)
                concatenatedArrayP = concatenatedArrayP.concat(jsonDataFiles[monthArray[i]].pressure)
                concatenatedArrayTT = concatenatedArrayTT.concat(jsonDataFiles[monthArray[i]].time)
            }

            jsonData = JSON.parse(JSON.stringify(selectedJsonData))
            jsonData.temperature = concatenatedArrayT
            jsonData.humidity = concatenatedArrayH
            jsonData.pressure = concatenatedArrayP
            jsonData.time = concatenatedArrayTT

            sortJson()



        } else if (show == "year") {
            type2 = "year"
            let parts = selectedFilename.split("-")
            let year = parseInt(parts[0])
            let yearArray = []

            Object.keys(jsonDataFiles).forEach(function (key) {
                let parts2 = key.split("-")
                let year2 = parseInt(parts2[0])

                if (year2 == year) {
                    yearArray.push(key)
                }
            })

            concatenatedArrayT = []
            concatenatedArrayH = []
            concatenatedArrayP = []
            concatenatedArrayTT = []
            for (let i = 0; i < yearArray.length; i++) {
                concatenatedArrayT = concatenatedArrayT.concat(jsonDataFiles[yearArray[i]].temperature)
                concatenatedArrayH = concatenatedArrayH.concat(jsonDataFiles[yearArray[i]].humidity)
                concatenatedArrayP = concatenatedArrayP.concat(jsonDataFiles[yearArray[i]].pressure)
                concatenatedArrayTT = concatenatedArrayTT.concat(jsonDataFiles[yearArray[i]].time)
            }

            jsonData = JSON.parse(JSON.stringify(selectedJsonData))
            jsonData.temperature = concatenatedArrayT
            jsonData.humidity = concatenatedArrayH
            jsonData.pressure = concatenatedArrayP
            jsonData.time = concatenatedArrayTT

            sortJson()
        }
    } else {
        jsonData = JSON.parse(JSON.stringify(currentJson))
    }

    updateCharts(true,type2)
   
}


let closeWindow = function () {
    elements.window.innerHTML = ""
    localStorage.setItem("maxValues", options.maxValues)
    localStorage.setItem("tempOffset", options.tempOffset)

}