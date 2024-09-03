const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

(async () => {
    try {
        // Launch the browser
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();

        // Set a realistic User-Agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

        // Go to the IMDb Top 250 page
        await page.goto('https://www.imdb.com/chart/top/', {
            waitUntil: 'networkidle2', // Wait until there are no more than 2 network connections for at least 500ms
        });

        // Wait for the UL element that contains the movie list
        await page.waitForSelector('.ipc-metadata-list', { timeout: 60000 });

        // Get the page content as a string
        const content = await page.content();

        // Load the content into Cheerio
        const $ = cheerio.load(content);

        // Object to store movie data
        const movieData = {};

        // Iterate over each list item (li) in the UL
        $('.ipc-metadata-list > li').each((i, movie) => {
            const title = $(movie).find('h3.ipc-title__text').text().trim();
            const rating = $(movie).find('.ipc-rating-star--rating').text().trim();

            if (title && rating) {
                movieData[title] = rating;
            }
        });

        // Write the extracted data to a JSON file
        fs.writeFileSync('movieData.json', JSON.stringify(movieData, null, 2));

        console.log("Movie data has been saved to movieData.json");

        // Close the browser
        await browser.close();
    } catch (error) {
        console.error('Error occurred:', error);
    }
})();
