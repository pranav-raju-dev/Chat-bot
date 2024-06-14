const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const scrape = async (url) => {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const title = $('title').text();
        let result = [];
        $('a').each((i, link) => {
            result.push({
                text: $(link).text(),
                href: $(link).attr('href')
            });
        });
        const scrapedData = { title, links: result };
        fs.writeFileSync('server/data/scraped_data.json', JSON.stringify(scrapedData, null, 2));
        console.log('Data scraped successfully.');
    } catch (err) {
        console.log('Error in scraping:', err);
    }
};

scrape('https://myanimelist.net/anime/54900/Wind_Breaker');
