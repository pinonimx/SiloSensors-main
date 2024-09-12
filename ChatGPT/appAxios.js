// app.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const http = require('http');
const { sql, poolPromise } = require('./db');
const app = express();

app.get('/scrape', async (req, res) => {
    try {
        // Connect to the database
        const pool = await poolPromise;

        // Retrieve active IP addresses
        const ipQuery = 'SELECT IPAddress FROM TankData';
        const result = await pool.request().query(ipQuery);
        const ipAddresses = result.recordset.map(row => row.IPAddress);

        if (ipAddresses.length === 0) {
            return res.status(400).send('No active IP addresses found');
        }

        // Iterate over each IP address
        for (let ip of ipAddresses) {
            try {

                const agent = new http.Agent({
                    rejectUnauthorized: false
                })
                // Use the IP address as a proxy to scrape the webpage
                const response = await axios.get('http://' + ip + "/",
                {
                    httpAgent: agent,
                    timeout: 10000
                }
                );

                // Load HTML into Cheerio for parsing
                const $ = cheerio.load(response.data);
                //console.log($.html())

                // Extract the value from the webpage (customize the selector as needed)
                //const scrapedValue = 3.1415926535;
                const scrapedValue = parseFloat($('#monitor-level-tank').text());
                //console.log(scrapedValue)

                // Store the scraped value, IP, and timestamp in the database
                const insertQuery = `INSERT INTO SensorData (SensorIPAddress, Value, timestamp) 
                                     VALUES (@ip_address, @scraped_value, GETDATE())`;
                await pool.request()
                    .input('ip_address', sql.VarChar, ip)
                    .input('scraped_value', sql.Float, scrapedValue)
                    .query(insertQuery);

            } catch (err) {
                console.error(`Error scraping with IP ${ip}:`, err.message);
            }
        }

        res.send('Scraping complete');
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).send('An error occurred');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
