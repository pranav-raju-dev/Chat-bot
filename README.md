### Data scraping from website was done using cheerio package 
### Bot was self restricted responses from internet using Keyword match
#### Under execution
    - Also we can restrict bot using NLP pacakges *compromise* & *natural*
```FolderStructure
    chatbot_project/
    ├── server/
    │   ├── index.js
    │   ├── scrape.js
    │   ├── clean.js
    │   ├── data/
    │   │   ├── scraped_data.json
    │   │   └── cleaned_data.json
    ├── public/
    │   ├── index.html
    │   ├── styles.css
    │   └── app.js
    ├── .env
    ├── package.json
    └── package-lock.json
```
### create a project
#### npm init
### Install Packages
#### npm install axios body-parser express cheerio dotenv cors
#### file system (fs) will be included in the Node installation no need to install seperatly.

1. check Json which must be close to this
```Package.json dependencies
  "dependencies": {
    "axios": "^1.7.2",
    "body-parser": "^1.20.2",
    "cheerio": "^1.0.0-rc.12",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2"
  }
```
2. Run the Scraping and Cleaning Scripts
    - Run node server/scrape.js to scrape the data and save it to scraped_data.json.
3. Start the Server
    - Run npm start to start the Express server.
4. Open the UI
    - Open your browser and navigate to http://localhost:3000 to interact with your chatbot.

```Conclusion
This setup provides a basic chatbot UI similar to WhatsApp, handling user input and displaying bot responses. Adjust the YOUR_API_KEY and your_endpoint placeholders with your actual Gemini API details.
```
