const express = require("express");
const fs = require("fs");
const axios = require("axios");
const cors = require("cors");
const https = require("https");
const path = require("path");
require('dotenv').config();

const app = express();
const port = 3001;

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const readScrapedData = () => {
  try {
    const data = fs.readFileSync('server/data/scraped_data.json', 'utf8');
    const jsonData = JSON.parse(data);
    if (!jsonData.keywords || jsonData.keywords.length === 0) {
      throw new Error('No keywords found in the scraped data.');
    }
    return jsonData;
  } catch (err) {
    console.error('Error reading scraped data:', err);
    return { title: '', links: [], keywords: [] };
  }
};

const containsKeyword = (message, keywords) => {
  const lowerCaseMessage = message.toLowerCase().trim();
  const matchedKeywords = keywords.filter(keyword => {
    const cleanKeyword = keyword.trim().toLowerCase();
    const isMatched = lowerCaseMessage.includes(cleanKeyword);
    console.log(`Checking keyword: "${cleanKeyword}", matched: ${isMatched}`);
    return isMatched;
  });

  console.log('Keywords checked:', matchedKeywords);
  return matchedKeywords.length > 0;
};


const chat = async (ques, data) => {
  const promptInstruction = `You are provided with the following data: ${JSON.stringify(data.links)}. Only use this data to answer the questions. Do not use any external information or search the internet. Your response should be based solely on the provided data. If any question is out of context, just say: 'Sorry, the question is not relevant to my data.'`;

  const contents = [
    {
      parts: [{ text: promptInstruction }],
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

  const candidates = response.candidates || [];
  if (!candidates.length) {
    return false;
  }

  const firstCandidate = candidates[0] || {};
  const content = firstCandidate.content || {};
  const parts = content.parts || [];
  if (!parts.length) {
    return false;
  }

  const responseText = parts[0].text.toLowerCase();
  const isRelevant = data.links.some(item => responseText.includes(item.text.toLowerCase()));
  const irrelevantPhrases = [
    "sorry, the question is not relevant to my data.",
    "i can't assist you with the question which is out of my available data."
  ];

  const isIrrelevant = irrelevantPhrases.some(phrase => responseText.includes(phrase.toLowerCase()));

  return isRelevant && !isIrrelevant;
};

app.post("/crawl", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }
  try {
    const data = readScrapedData();
    if (data.keywords.length === 0) {
      return res.status(500).json({ error: "No keywords found in the scraped data." });
    }
    data.source = 'scraped_data.json';
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in /crawl route:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/chat", async (req, res) => {
  const { msg, data } = req.body;
  if (!msg) {
    return res.status(400).json({ error: "Message is required" });
  }
  if (!containsKeyword(msg, data.keywords)) {
    console.log("The question is not relevant to the provided data.");
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
