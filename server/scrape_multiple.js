const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const urlParser = require('url');

const scrapedUrls = new Set();
let allLinks = [];
let allKeywords = [];

// Helper function to clean URLs
const cleanUrl = (base, relative) => {
  const urlObj = urlParser.parse(relative);
  if (!urlObj.host) {
    return urlParser.resolve(base, relative);
  }
  return relative;
};

// Main scraping function
const scrape = async (url, depth = 1) => {
  if (scrapedUrls.has(url) || depth > 2) { 
    return;
  }

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const title = $('title').text();

    $('a').each((i, link) => {
      const text = $(link).text().trim();
      const href = $(link).attr('href');
      if (text && href) {
        const fullUrl = cleanUrl(url, href);
        allLinks.push({
          text: text,
          href: fullUrl
        });
        allKeywords.push(text.toLowerCase());
        if (!scrapedUrls.has(fullUrl)) {
          scrape(fullUrl, depth + 1);
        }
      }
    });

    scrapedUrls.add(url);
    const scrapedData = { title, links: allLinks, keywords: allKeywords };
    fs.writeFileSync('server/data/scraped_data.json', JSON.stringify(scrapedData, null, 2));
    console.log(`Data scraped successfully from ${url}`);
  } catch (err) {
    console.log(`Error in scraping ${url}:`, err);
  }
};

// Start scraping from the initial URL
scrape('https://gohugo.io/');
