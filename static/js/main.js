let run = function () {

    fetchValues()
    elements.temperatureHVal.textContent = current.temperature.toFixed(1) +" C"
    elements.pressureHVal.textContent = (current.pressure/1000).toFixed(3) + " bar"
    elements.humidityHVal.textContent = current.humidity + " %"

}
