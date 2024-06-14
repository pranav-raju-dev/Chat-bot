// const express = require("express");
// const fs = require("fs");
// const axios = require("axios");
// const cheerio = require("cheerio");
// const cors = require("cors");
// const https = require("https");
// const path = require("path");
// require('dotenv').config();

// const app = express();
// const port = 3001;

// const httpsAgent = new https.Agent({
//   rejectUnauthorized: false,
// });

// app.use(cors());
// app.use(express.json());
// app.use(express.static(path.join(__dirname, '..', 'public')));

// const readScrapedData = () => {
//   try {
//     const data = fs.readFileSync('server/data/scraped_data.json', 'utf8');
//     return JSON.parse(data);
//   } catch (err) {
//     console.error('Error reading scraped data:', err);
//     return { title: '', links: [] };
//   }
// };

// const chat = async (ques, data) => {
//   const contents = [
//     {
//       parts: [{ text: `You are provided with the following data: ${JSON.stringify(data.links)}. Only use this data to answer the questions. Do not use any external information or search the internet. Your response should be based solely on the provided data.` }],
//       role: "model"
//     },
//     ...data.links.map(link => ({
//       parts: [{ text: link.text }],
//       role: "model"
//     })),
//     {
//       parts: [{ text: ques }],
//       role: "user"
//     }
//   ];

//   try {
//     const response = await axios.post(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       { contents },
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//         httpsAgent,
//       }
//     );
//     console.log("API Response:", response.data);
//     return response.data;
//   } catch (err) {
//     console.log("Error in Gemini API call", err.response ? err.response.data : err);
//     throw err;
//   }
// };

// const isResponseRelevant = (response, data) => {
//   console.log("Checking if the response is relevant");
//   const responseText = response.candidates[0].content.parts[0].text.toLowerCase();
//   return data.links.some(item => responseText.includes(item.text.toLowerCase()));
// };

// app.post("/crawl", async (req, res) => {
//   const { url } = req.body;
//   if (!url) {
//     return res.status(400).json({ error: "URL is required" });
//   }
//   try {
//     const data = readScrapedData();
//     data.source = 'scraped_data.json';
//     return res.status(200).json(data);
//   } catch (error) {
//     console.error("Error in /crawl route:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// app.post("/chat", async (req, res) => {
//   const { msg, data } = req.body;
//   if (!msg) {
//     return res.status(400).json({ error: "Message is required" });
//   }
//   try {
//     const chatBotData = await chat(msg, data);
//     if (isResponseRelevant(chatBotData, data)) {
//       console.log("The response is relevant to the provided data.");
//       return res.status(200).json(chatBotData);
//     } else {
//       console.log("The response is not relevant to the provided data.");
//       return res.status(200).json({
//         candidates: [{
//           content: {
//             parts: [{
//               text: "Sorry, I can't assist you with the question which is out of my available data."
//             }],
//             role: 'model'
//           }
//         }]
//       });
//     }
//   } catch (error) {
//     console.error("Error in /chat route:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

// index.js

const express = require("express");
const axios = require("axios");
const https = require("https");
const fs = require("fs");
const serverless = require("serverless-http");
const path = require("path");
const cors = require("cors");
const cheerio = require("cheerio");
require('dotenv').config();

const app = express();
const router = express.Router();
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const readScrapedData = () => {
  try {
    const data = fs.readFileSync('server/data/scraped_data.json', 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading scraped data:', err);
    return { title: '', links: [] };
  }
};

const chat = async (ques, data) => {
  const contents = [
    {
      parts: [{ text: `You are provided with the following data: ${JSON.stringify(data.links)}. Only use this data to answer the questions. Do not use any external information or search the internet. Your response should be based solely on the provided data.` }],
      role: "model"
    },
    ...data.links.map(link => ({
      parts: [{ text: link.text }],
      role: "model"
    })),
    {
      parts: [{ text: ques }],
      role: "user"
    }
  ];

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents },
      {
        headers: {
          "Content-Type": "application/json",
        },
        httpsAgent,
      }
    );
    console.log("API Response:", response.data);
    return response.data;
  } catch (err) {
    console.log("Error in Gemini API call", err.response ? err.response.data : err);
    throw err;
  }
};

const isResponseRelevant = (response, data) => {
  console.log("Checking if the response is relevant");
  const responseText = response.candidates[0].content.parts[0].text.toLowerCase();
  return data.links.some(item => responseText.includes(item.text.toLowerCase()));
};

router.post("/crawl", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }
  try {
    const data = readScrapedData();
    data.source = 'scraped_data.json';
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in /crawl route:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/chat", async (req, res) => {
  const { msg, data } = req.body;
  if (!msg) {
    return res.status(400).json({ error: "Message is required" });
  }
  try {
    const chatBotData = await chat(msg, data);
    if (isResponseRelevant(chatBotData, data)) {
      console.log("The response is relevant to the provided data.");
      return res.status(200).json(chatBotData);
    } else {
      console.log("The response is not relevant to the provided data.");
      return res.status(200).json({
        candidates: [{
          content: {
            parts: [{
              text: "Sorry, I can't assist you with the question which is out of my available data."
            }],
            role: 'model'
          }
        }]
      });
    }
  } catch (error) {
    console.error("Error in /chat route:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.use("/.netlify/functions/api", router);

module.exports = app;
module.exports.handler = serverless(app);
