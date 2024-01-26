function downloadAllFiles() {
    iii = 0
    statusText.textContent = "Downloading 0/" + files.length + " json files..."
    downloadFilesSequentially(files, 0)
    
}

let iii = 0
function downloadFilesSequentially(files, index) {
    if (index >= files.length) {
        statusText.textContent = "..."
        return
    }
    let file = files[index]
    fetch(`data/${file}`)
        .then(response => response.json())
        .then(data => {
            iii++
            statusText.textContent = "Downloading " + iii + "/" + files.length + " json files..."
            let nameString = `${file}`
            jsonDataFiles[nameString] = data
            downloadFilesSequentially(files, index + 1)
        })
        .catch(error => {
            console.error(`Error fetching ${file}:`, error)
            downloadFilesSequentially(files, index + 1)
        })
}

function downloadFile(fileName, i, iMax) {
    return new Promise((resolve, reject) => {
        fetch("data/" + fileName)
            .then(response => response.json())
            .then(data => {
                statusText.textContent = "Downloading " + i + "/" + iMax + " json files..."
                let nameString = `${fileName}` 
                jsonDataFiles[nameString] = data
                resolve() 
            })
            .catch(error => {
                console.error(`Error fetching ${fileName}:`, error)
                reject(error)
            });
    });
}