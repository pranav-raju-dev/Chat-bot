### Data scraping from website was done using cheerio package 
### Bot was self restricted responses from internet using Keyword match
#### Under execution
    - Also we can restrict bot using NLP pacakges *compromise* & *natural*
```FolderStructure
    chatbot_project/
    ├── node_modules
    ├── public/
    │   ├── app.js
    │   ├── index.html
    │   └── styles.css
    ├── server/
    │   ├── data/
    │   │   └── scraped_data.json
    │   ├── index.js
    │   ├── scrape_data_cleanup.js
    │   └── scrape.js
    │   
    ├── .env
    ├── .gitignore
    ├── license
    ├── README.md
    ├── package.json
    └── package-lock.json
```
#### clone project 
```
https://github.com/darshan1005/ChatBot.git
```
or
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
  
# Note : 
```
``
This setup provides a basic chatbot UI, handling user input and displaying bot responses. Adjust the YOUR_API_KEY and your_endpoint placeholders with your actual Gemini API details.
``

``
The scraping technique was implememted in 2 ways , single page scraping (scrape.js) & multiple pages scrape (scrape_multiple.js). When performing mutiple pages scraping the payload(data -> scraped_data.json) size may be very high where chatbot couldn't respond to the user inputs, to solve that implementation of payload chuncks could solve this issue.
``
```
# output
![Screenshot 2024-06-19 101429](https://github.com/darshan1005/ChatBot/assets/114302987/56c5bc54-100b-43bc-ae72-31e94cb4daf3)
