const express = require('express');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const app = express();
const path = require("path");

app.use(express.static(__dirname + '/public'));

app.use(express.json())

app.get('/maps', function(req, res) {
    let lat1 = req.query.lat1;
    let lon1 = req.query.lon1;
    let lat2 = req.query.lat2;
    let lon2 = req.query.lon2;
    res.sendFile(path.join(`${__dirname}/public/map.html?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}`));
});

app.post('/', async function (req, res) {
    // The scraping magic will happen here
    let lat1 = req.body.lat1;
    let lon1 = req.body.lon1;
    let lat2 = req.body.lat2;
    let lon2 = req.body.lon2;
    let unit = req.body.unit;
    let url = `http://localhost:8888/direction/map.html?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}`;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Now you can evaluate JavaScript in the context of the page or use Puppeteer's API to interact with the page.
    const content = await page.content();

    var $ = cheerio.load(content);
    console.log($('div#result').text());

    await browser.close();

    var distance = $('div#result').text();
    // And now, the JSON format we are going to expose
    var json = {
        measurement: unit == 'km' ? 'km' : 'm',
        distance: unit == 'km' ? distance / 1000 : distance 
    };

    return res.json(json);
});

app.listen('3001', () => console.log('API is running on http://localhost:3001'));