let processData = function (originalData, chunkSize, average) {
    let filteredData = []
    let sum = 0
    let count = 0

    let nullVal = false
    let nullSegment = false

    for (let i = 0; i < originalData.length; i++) {
        nullVal = false
        sum += originalData[i]

        if (originalData[i] == null) {
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

let updateCharts = function (process = false, type2 = "day", offset = true) {
    if (type2 === "current-data") {
        type2 = "day"
    }

    if (process) {
        processJson(jsonData, getChunkSize(jsonData), options.average,type2)
    }

    if (options.tempOffset!==0 && offset) {
        for (let i = 0; i<jsonData.temperature.length; i++) {
            if (jsonData.temperature[i]!==null && jsonData.temperature[i]!==0) {
                jsonData.temperature[i] -= options.tempOffset
            }
        }
    }

    temperatureChart.data.datasets[0].data = jsonData.temperature
    temperatureChart.data.labels = jsonData.time
    temperatureChart.data.datasets[0].borderColor = getTempGradient()
    temperatureChart.update()

    pressureChart.data.datasets[0].data = jsonData.pressure
    pressureChart.data.labels = jsonData.time
    pressureChart.data.datasets[0].borderColor = getPressureGradient()
    pressureChart.update()

    humidityChart.data.datasets[0].data = jsonData.humidity
    humidityChart.data.labels = jsonData.time
    humidityChart.data.datasets[0].borderColor = getHumidityGradient()
    humidityChart.update()
}

let updateGradients = function() {
    temperatureChart.data.datasets[0].borderColor = getTempGradient()
    temperatureChart.update()
    pressureChart.data.datasets[0].borderColor = getPressureGradient()
    pressureChart.update()
    humidityChart.data.datasets[0].borderColor = getHumidityGradient()
    humidityChart.update()
}

let getTempGradient = function() {
    let filteredData = jsonData.temperature.filter(value => value !== null && value !== 0);
    let minValue = Math.min(...filteredData)
    let maxValue = Math.max(...filteredData)
    let range = maxValue - minValue

    let gradient = elements.chartT.getContext("2d").createLinearGradient(0, temperatureChart.chartArea.bottom, 0, temperatureChart.chartArea.top)

    let blueStop = Math.max((18 - minValue) / range, 0)
    let lightblueStop = Math.min(Math.max((20 - minValue) / range, blueStop), 1)
    let greenStop = Math.min(Math.max((22 - minValue) / range, lightblueStop), 1)
    let yellowStop = Math.min(Math.max((23 - minValue) / range, greenStop), 1)
    let redStop = Math.min((maxValue - minValue) / range, 1)

    gradient.addColorStop(blueStop, '#4284f5')
    gradient.addColorStop(lightblueStop, '#42a4f5')
    gradient.addColorStop(greenStop, 'green')
    gradient.addColorStop(yellowStop, 'yellow')
    gradient.addColorStop(redStop, 'red')
    return gradient
}
let getHumidityGradient = function() {
    let filteredData = jsonData.humidity.filter(value => value !== null && value !== 0);
    let minValue = Math.min(...filteredData)
    let maxValue = Math.max(...filteredData)
    let range = maxValue - minValue

    let gradient = elements.chartH.getContext("2d").createLinearGradient(0, humidityChart.chartArea.bottom, 0, humidityChart.chartArea.top)

    let blueStop = Math.max((10 - minValue) / range, 0)
    let lightblueStop = Math.min(Math.max((30 - minValue) / range, blueStop), 1)
    let greenStop = Math.min(Math.max((50 - minValue) / range, lightblueStop), 1)
    let yellowStop = Math.min(Math.max((70 - minValue) / range, greenStop), 1)
    let redStop = Math.min((maxValue - minValue) / range, 1)

    gradient.addColorStop(blueStop, '#4284f5')
    gradient.addColorStop(lightblueStop, '#42a4f5')
    gradient.addColorStop(greenStop, 'green')
    gradient.addColorStop(yellowStop, 'yellow')
    gradient.addColorStop(redStop, 'red')
    return gradient
}
let getPressureGradient = function() {
    let filteredData = jsonData.pressure.filter(value => value !== null && value !== 0);
    let minValue = Math.min(...filteredData)
    let maxValue = Math.max(...filteredData)
    let range = maxValue - minValue

    let gradient = elements.chartP.getContext("2d").createLinearGradient(0, pressureChart.chartArea.bottom, 0, pressureChart.chartArea.top)

    let blueStop = Math.max((950 - minValue) / range, 0)
    let lightblueStop = Math.min(Math.max((970 - minValue) / range, blueStop), 1)
    let greenStop = Math.min(Math.max((1000 - minValue) / range, lightblueStop), 1)
    let yellowStop = Math.min(Math.max((1020 - minValue) / range, greenStop), 1)
    let redStop = Math.min((maxValue - minValue) / range, 1)

    gradient.addColorStop(blueStop, '#4284f5')
    gradient.addColorStop(lightblueStop, '#42a4f5')
    gradient.addColorStop(greenStop, 'green')
    gradient.addColorStop(yellowStop, 'yellow')
    gradient.addColorStop(redStop, 'red')
    return gradient
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

            if (currentData) {
                jsonData.temperature.push(current.temperature-options.tempOffset)
                jsonData.humidity.push(current.humidity)
                jsonData.pressure.push(current.pressure)
                jsonData.time.push(convertTime(current.time,"day"))
                if (!starting) {
                    updateCharts(false, "day", false)
                }
            }


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
        return `${day}.${month}. ${hours}:${minutes}`
    } else if (type == "month") {
        return `${day}.${month}. ${hours}`
    } else if (type == "year") {
        return `${day}.${month}`
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

            i = i + (count-1)
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

    htmlStr += '<button onclick="downloadAllFiles()">Download All Data ('+filesList.length+')</button><br>'

    htmlStr += '<button onclick="storeLoggingData()">Store</button><br>'

    htmlStr += '<button onclick="options.last24h = !options.last24h; document.getElementById(`last24h`).textContent = options.last24h  ">Current Data shows last 24h</button> <span id="last24h">' + options.last24h + '</span> <br>'

    htmlStr += '<label for="numberInput">Temp Offset: -</label>' +
        '  <input type="number" id="numberInput" onchange="options.tempOffset = Number(this.value);" step="0.1" value="options.tempOffset"><br>'
    htmlStr += '<div><label for="maxValuesInput">Max Values: </label>'
    htmlStr += '<input id="maxValuesInput" type="range" onchange="options.maxValues = Number(this.value); document.getElementById(\'maxValuesText\').textContent = Number(this.value);" step="50" value="' + options.maxValues + '" min="100" max="4000">' +
        '<span id="maxValuesText">' + options.maxValues + '</span></div>'

    dates = {}

    // Y
    for (let i = 0; i < filesList.length; i++) {
        dates[filesList[i].split('-')[0]] = {}
    }
    // M
    for (let i = 0; i < filesList.length; i++) {
        dates[filesList[i].split('-')[0]][filesList[i].split('-')[1]] = {}
    }
    // D
    for (let i = 0; i < filesList.length; i++) {
        let day = filesList[i].split('-')[2]
        if (dates[filesList[i].split('-')[0]][filesList[i].split('-')[1]][day] === undefined) {
            dates[filesList[i].split('-')[0]][filesList[i].split('-')[1]][day] = []
        }
        dates[filesList[i].split('-')[0]][filesList[i].split('-')[1]][day].push(filesList[i])
    }

    let yearsArray = ['<option value="Current Data">Current Data</option>']

    for (const [key, value] of Object.entries(dates)) {
        yearsArray.push('<option value="' + key + '">' + key + '</option>')
    }
 
    htmlStr += '<select id="selectYear" onchange="changeYear(this.value)">' + yearsArray.join('') + '</select>'
    htmlStr += '<select id="selectMonth" onchange="changeMonth(this.value)"></select>'
    htmlStr += '<select id="selectDay" onchange="changeDay(this.value)"></select>'
    htmlStr += '<select onchange="selectedTimeFrame = this.value"> <option value="current-data">Current Data</option> <option value="day">day</option> <option value="week">week</option> <option value="month">month</option> <option value="year">year</option>  </select >'
    htmlStr += '<button onclick="loadData()" >Confirm</button>'

    htmlStr += "</div>"
    elements.window.innerHTML = htmlStr
    document.getElementById("numberInput").value = options.tempOffset
}

let dates = {}
let yearSelected = "2024"
let monthSelected = "01"
let daySelected = "01"
let selectedTimeFrame = "current-data"

let changeYear = function(year) {
    yearSelected = year
    let selectElement = document.getElementById("selectMonth")
    let monthsArray = ['<option value="-">-</option>']
    for (const [key, value] of Object.entries(dates[year])) {
        monthsArray.push('<option value="' + key + '">' + key + '</option>')
    }
    selectElement.innerHTML = monthsArray.join('');
}
let changeMonth = function(month) {
    monthSelected = month
    let selectElement = document.getElementById("selectDay")
    let daysArray = ['<option value="-">-</option>']
    for (const [key, value] of Object.entries(dates[yearSelected][month])) {
        daysArray.push('<option value="' + key + '">' + key + '</option>')
    }
    selectElement.innerHTML = daysArray.join('');
}

let changeDay = function (day) {
    daySelected = day
}

let getCurrentDay = function () {
    const currentDate = new Date()
    const currentDay = currentDate.getDate()
    return  currentDay.toString().padStart(2, '0')
}
let getCurrentMonth = function () {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    return  currentMonth.toString().padStart(2, '0')
}

let getCurrentYear = function() {
    const currentDate = new Date();
    return currentDate.getFullYear();
}

let loadData = async function () {
    currentData = false
    if (selectedTimeFrame === "current-data") {
		daySelected = getCurrentDay().toString().padStart(2, '0');
		monthSelected = getCurrentMonth().toString().padStart(2, '0');
		yearSelected = getCurrentYear().toString();
		
        currentData = true
        if (options.last24h) {
            let filesArray = []

            if (dates[yearSelected][monthSelected][daySelected]) {
                for (let i = 0; i < dates[yearSelected][monthSelected][daySelected].length; i++) {
                    filesArray.push(dates[yearSelected][monthSelected][daySelected][i])
                }
            }
            if (daySelected > 1) {
                if (dates[yearSelected][monthSelected][convertDayString(daySelected,-1)] !== undefined) {
                    for (let i = 0; i < dates[yearSelected][monthSelected][convertDayString(daySelected,-1)].length; i++) {
                        filesArray.push(dates[yearSelected][monthSelected][convertDayString(daySelected,-1)][i]);
                    }
                }
            } else {
                let previousMonth = (parseInt(monthSelected) - 2 + 12) % 12 + 1;
                let lastDayOfPreviousMonth = new Date(parseInt(yearSelected), parseInt(monthSelected) - 1, 0).getDate();
                if (dates[yearSelected][previousMonth][convertDayString(lastDayOfPreviousMonth)] !== undefined) {
                    for (let i = 0; i < dates[yearSelected][previousMonth][convertDayString(lastDayOfPreviousMonth)].length; i++) {
                        filesArray.push(dates[yearSelected][previousMonth][convertDayString(lastDayOfPreviousMonth)][i]);
                    }
                }
            }
            await concatArrays(filesArray)
        } else {
            jsonData = JSON.parse(JSON.stringify(currentJson))
        }
        currentData = true
    } else if (selectedTimeFrame === "day") {
        let filesArray = []
        for (let i = 0; i < dates[yearSelected][monthSelected][daySelected].length; i++) {
            filesArray.push(dates[yearSelected][monthSelected][daySelected][i])
        }
        await concatArrays(filesArray)
    } else if (selectedTimeFrame === "week") {
        let filesArray = []
        for (let j = 0; j < 7; j++) {
            if (dates[yearSelected][monthSelected][convertDayString(daySelected,j)] !== undefined) {
                for (let i = 0; i < dates[yearSelected][monthSelected][convertDayString(daySelected,j)].length; i++) {
                    filesArray.push(dates[yearSelected][monthSelected][convertDayString(daySelected,j)][i])
                }
            }
        }
        await concatArrays(filesArray)
    } else if (selectedTimeFrame === "month") {
        let filesArray = []
        for (const [key, value] of Object.entries(dates[yearSelected][monthSelected])) {
            for (let i = 0; i < value.length; i++) {
                filesArray.push(value[i])
            }
        }
        await concatArrays(filesArray)
    } else if (selectedTimeFrame === "year") {
        let filesArray = []
        for (const [key, month] of Object.entries(dates[yearSelected])) {
            for (const [key2, day] of Object.entries(dates[yearSelected][convertMonthString(key)])) {
                for (let i = 0; i < day.length; i++) {
                    filesArray.push(day[i])
                }
            }
        }
        await concatArrays(filesArray)
    }

    updateCharts(true, selectedTimeFrame)
}

function convertMonthString(monthString) {
    return parseInt(monthString, 10).toString().padStart(2, '0')
}
function convertDayString(monthString,add = 0) {
    return (parseInt(monthString, 10)+add).toString().padStart(2, '0')
}

let concatArrays = async function (filesArray) {
    concatenatedArrayT = []
    concatenatedArrayH = []
    concatenatedArrayP = []
    concatenatedArrayTT = []
    for (let i = 0; i < filesArray.length; i++) {
        if (jsonDataFiles[filesArray[i]] === undefined) {
            await downloadFile(filesArray[i],i,filesArray.length)
        }
        concatenatedArrayT = concatenatedArrayT.concat(jsonDataFiles[filesArray[i]].temperature)
        concatenatedArrayH = concatenatedArrayH.concat(jsonDataFiles[filesArray[i]].humidity)
        concatenatedArrayP = concatenatedArrayP.concat(jsonDataFiles[filesArray[i]].pressure)
        concatenatedArrayTT = concatenatedArrayTT.concat(jsonDataFiles[filesArray[i]].time)
    }
    statusText.textContent = "..."
    if (currentData) {
        jsonData = JSON.parse(JSON.stringify(currentJson))
        concatenatedArrayT = concatenatedArrayT.concat(currentJson.temperature)
        concatenatedArrayH = concatenatedArrayH.concat(currentJson.humidity)
        concatenatedArrayP = concatenatedArrayP.concat(currentJson.pressure)
        concatenatedArrayTT = concatenatedArrayTT.concat(currentJson.time)
    } else {
        jsonData = JSON.parse(JSON.stringify(jsonDataFiles[filesArray[0]]))
    }


    jsonData.temperature = concatenatedArrayT
    jsonData.humidity = concatenatedArrayH
    jsonData.pressure = concatenatedArrayP
    jsonData.time = concatenatedArrayTT
	
    if (currentData) {
        let remove = 0;
        for (let i = 0; i < jsonData.time.length; i++) {
            if (jsonData.time[i] < ((Date.now()/1000) - 86400)) {
                remove = i
            }
        }
        if (remove != 0) {
            jsonData.temperature.splice(0, remove);
            jsonData.humidity.splice(0, remove);
            jsonData.pressure.splice(0, remove);
            jsonData.time.splice(0, remove);
        }
    }

    sortJson()
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

let closeWindow = function () {
    elements.window.innerHTML = ""
    localStorage.setItem("maxValues", options.maxValues)
    localStorage.setItem("tempOffset", options.tempOffset)
    localStorage.setItem("last24h", options.last24h)
}