const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const scrape = async (url) => {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const title = $('title').text();
        let result = [];
        let keywords = [];

        $('a').each((i, link) => {
            const text = $(link).text();
            if (text) {
                result.push({
                    text: text,
                    href: $(link).attr('href')
                });
                keywords.push(text.toLowerCase());
            }
        });

        const scrapedData = { title, links: result, keywords: keywords };
        fs.writeFileSync('server/data/scraped_data.json', JSON.stringify(scrapedData, null, 2));
        console.log('Data scraped successfully.');
    } catch (err) {
        console.log('Error in scraping:', err);
    }
};

scrape('https://gohugo.io/');
