const puppeteer = require('puppeteer');
const sql = require('mssql');
const config = require('./config');  // Assuming you have a config.js for DB connection details

// Function to scrape a webpage using a specific IP address (proxy)
async function scrapeWithIP(ipAddress) {
    const browser = await puppeteer.launch({
        headless: true,  // Set to false if you want to see the browser in action
        args: [
            `--proxy-server=${ipAddress}`  // Use the proxy IP address
        ]
    });

    const page = await browser.newPage();

    try {
        // Navigate to the webpage you want to scrape
        await page.goto('https://example.com', { waitUntil: 'networkidle2' });

        // Scrape the value (e.g., extracting some data from the webpage)
        const scrapedValue = await page.evaluate(() => {
            // You can replace this selector with whatever you need to scrape
            return document.querySelector('h1').innerText;
        });

        // Get the current timestamp
        const timestamp = new Date().toISOString();

        // Store the scraped value, IP address, and timestamp in the database
        await storeInDatabase(ipAddress, scrapedValue, timestamp);

        console.log(`Scraped Value: ${scrapedValue} from IP: ${ipAddress}`);
        return { scrapedValue, ipAddress, timestamp };

    } catch (error) {
        console.error(`Error scraping with IP ${ipAddress}:`, error);
        return null;
    } finally {
        await browser.close();
    }
}

// Function to store the scraped data in the database
async function storeInDatabase(ipAddress, scrapedValue, timestamp) {
    try {
        let pool = await sql.connect(config);

        let query = `INSERT INTO SensorData (SensorIPAddress, Value, Timestamp) 
                     VALUES (@ipAddress, @scrapedValue, @timestamp)`;

        await pool.request()
            .input('ipAddress', sql.VarChar, ipAddress)
            .input('scrapedValue', sql.VarChar, scrapedValue)
            .input('timestamp', sql.DateTime, timestamp)
            .query(query);

        console.log(`Data saved to database: IP=${ipAddress}, Value=${scrapedValue}, Timestamp=${timestamp}`);
    } catch (error) {
        console.error('Error storing data in database:', error);
    }
}

// Main function to query IPs from the database and scrape webpages
async function main() {
    try {
        let pool = await sql.connect(config);

        // Query to get the list of IP addresses from the database
        let result = await pool.request().query('SELECT IPAddress FROM TankData');

        // For each IP address, scrape the webpage and store the result
        for (const row of result.recordset) {
            const ipAddress = row.IPAddress;
            await scrapeWithIP(ipAddress);
        }

    } catch (error) {
        console.error('Error querying IP addresses from database:', error);
    }
}

// Call the main function to execute the web scraping
main();
