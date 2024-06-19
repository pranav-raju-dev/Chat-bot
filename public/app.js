document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatBox = document.getElementById('chat-box');
    const loadingIndicator = document.getElementById('loading-indicator');
    let scrapedData = {};
    let websiteTitle = '';

    const appendMessage = (message, sender) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender);
        messageElement.innerHTML = message;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    const fetchData = async (url) => {
        try {
            const response = await fetch('/crawl', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            scrapedData = data;
            websiteTitle = data.title; 
            console.log('Scraped Data:', scrapedData);
            console.log("Scraped Data Source:", data.source);
            displayWelcomeMessage();
        } catch (error) {
            console.error('Error fetching data:', error);
            appendMessage('Error: Unable to fetch data from the server.', 'bot');
        }
    };

    const preprocessResponse = (text) => {
        text = text.replace(/\*{2}(.*?)\*{2}/g, '<strong>$1</strong>');
        text = text.replace(/\_{2}(.*?)\_{2}/g, '<em>$1</em>');
        text = text.replace(/^\*(.*)/gm, '<li>$1</li>');
        text = text.replace(/^\d\.(.*)/gm, '<li>$1</li>');
        text = `<div>${text}</div>`;
        return text;
    };

    const isRelatedToScrapedData = (msg) => {
        return scrapedData.links.some(item => msg.toLowerCase().includes(item.text.toLowerCase()));
    };

    const displayWelcomeMessage = () => {
        const welcomeMessages = [
            `Hi, You're a ${websiteTitle} BOT and have information only about the data which has been given just now.`,
            `I can provide you with information about the following topics in ${websiteTitle} only:`
        ];
        welcomeMessages.forEach(message => appendMessage(message, 'bot'));
    };

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (chatInput==''){
            document.style.button
        }
        const message = chatInput.value.trim();
        if (!message) return;

        appendMessage(message, 'user');
        chatInput.value = '';

        loadingIndicator.style.display = 'block';

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ msg: message, data: scrapedData })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            const botMessage = responseData.candidates[0].content.parts[0].text;
            const processedMessage = preprocessResponse(botMessage);

            if (!isRelatedToScrapedData(botMessage)) {
                appendMessage("Sorry, I can't assist you with the question which is out of my available data.", 'bot');
            } else {
                appendMessage(processedMessage, 'bot');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            appendMessage('Error: Unable to get a response from the server.', 'bot');
        } finally {
            loadingIndicator.style.display = 'none';
        }
    });

    // Call fetchData function with the desired URL
    fetchData('https://gohugo.io/');
});
