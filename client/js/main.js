let run = function () {

    elements.temperatureHVal.textContent = current.temperature.toFixed(1) +" C"
    elements.pressureHVal.textContent = (current.pressure/1000).toFixed(3) + " bar"
    elements.humidityHVal.textContent = current.humidity + " %"

}

setInterval(run, 10000);
