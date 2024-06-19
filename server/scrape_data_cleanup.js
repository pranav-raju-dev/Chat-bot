const fs = require('fs');

const cleanKeywords = (keywords) => {
  return keywords.map(keyword => {
    // Remove leading and trailing whitespace and newlines
    let cleanedKeyword = keyword.trim();

    // Remove extra newlines and spaces within the keyword
    cleanedKeyword = cleanedKeyword.replace(/\n/g, '').replace(/\s\s+/g, ' ');

    return cleanedKeyword;
  }).filter(keyword => keyword); // Filter out empty strings
};

const cleanScrapedData = (data) => {
  if (!data || !data.keywords || !Array.isArray(data.keywords)) {
    throw new Error('Invalid scraped data format.');
  }

  // Clean keywords
  data.keywords = cleanKeywords(data.keywords);

  return data;
};

const filePath = 'server/data/scraped_data.json';

// Read the scraped data file
fs.readFile(filePath, 'utf8', (err, jsonString) => {
  if (err) {
    console.log('Error reading file:', err);
    return;
  }

  try {
    // Parse JSON data
    const data = JSON.parse(jsonString);

    // Clean up the data
    const cleanedData = cleanScrapedData(data);

    // Write cleaned data back to the file
    fs.writeFileSync(filePath, JSON.stringify(cleanedData, null, 2));
    console.log('Scraped data cleaned and saved successfully.');
  } catch (err) {
    console.log('Error parsing JSON:', err);
  }
});
