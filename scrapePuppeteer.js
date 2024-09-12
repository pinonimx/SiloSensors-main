const puppeteer = require('puppeteer');

//Get IP addresses from SQL



//Create IPaddress array

//Web Scraping Function
async function scrapeDynamicValue(IPAddress) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to the IP address of the web server
    await page.goto('http://' + IPAddress, { waitUntil: 'networkidle2' });

    // Wait for the element with the dynamic content to load
    await page.waitForSelector('#monitor-level-tank');

    // Wait until the content of the element is not empty
    await page.waitForFunction(
    () => document.querySelector('#monitor-level-tank').textContent.trim() !== '',
    { timeout: 10000 } // wait for up to 10 seconds
    );

    // Extract the dynamic value from the element
    const sensorValue = await page.evaluate(() => {
    const element = document.querySelector('#monitor-level-tank');
    return element ? element.textContent.trim() : null;
    });

    // Log the extracted value to the console
    console.log('Current Sensor Value:', sensorValue);
    return sensorValue

    // Close the browser
    await browser.close();
}

//Loop through IP array and scrape value
var valueDict = []
for (obj in IPArray){
    var sensorValue = scrapeDynamicValue(obj);
    valueDict.push({
        SensorIPAddress: obj,
        Value: sensorValue,
        Timestamp: Date.now()
    })
}

//Add records to SQL




var result = [];
    request.on('row', function(columns) {
        columns.forEach(function(column) {
            result.push(column.value)
        });
        console.log(result);
        result ="";
    });
