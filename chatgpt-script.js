// Simple AI Chatbot logic (randomized responses)
document.addEventListener('DOMContentLoaded', function() {
  const chatbotContainer = document.getElementById('chatbot-container');
  const openBtn = document.getElementById('openChatbot');
  const closeBtn = document.getElementById('closeChatbot');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');
  const messages = document.getElementById('chatbot-messages');
  const chatbotHeader = document.getElementById('chatbot-header');

  function appendMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = sender === 'user' ? 'user-msg' : 'bot-msg';
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  // --- ChatGPT API integration ---
  async function fetchChatGPTResponse(message) {
    try {
      const response = await fetch('http://localhost:4000/api/chatgpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }
      const data = await response.json();
      return data.reply || "🤖 No reply from AI.";
    } catch (error) {
      console.error('Error fetching ChatGPT response:', error);
      return "Sorry, there was an error connecting to the AI service.";
    }
  }

  // Chatbot message handling
  const chatbotForm = document.getElementById('chatbot-form');
  if (chatbotForm) {
    chatbotForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const inputElem = document.getElementById('chatbot-input');
      const input = inputElem.value.trim();
      if (!input) return;
      if (typeof addChatbotMessage === 'function') addChatbotMessage(input, 'user');
      inputElem.value = '';
      // Show typing indicator
      if (typeof addChatbotMessage === 'function') addChatbotMessage('...', 'bot', true);
      // Fetch mock ChatGPT response
      const response = await fetchChatGPTResponse(input);
      // Remove typing indicator
      const messagesDiv = document.getElementById('chatbot-messages');
      if (messagesDiv && messagesDiv.lastChild && messagesDiv.lastChild.classList.contains('bot')) {
        messagesDiv.removeChild(messagesDiv.lastChild);
      }
      if (typeof addChatbotMessage === 'function') addChatbotMessage(response, 'bot');
    });
  }

  // Show/hide chatbot with techpearl-style class
  const chatbot = document.getElementById('chatbot-container');
  openBtn.addEventListener('click', function() {
    chatbot.classList.add('active');
    openBtn.style.display = 'none';
  });
  closeBtn.addEventListener('click', function() {
    chatbot.classList.remove('active');
    openBtn.style.display = 'flex';
  });
  // Chatbot open/close logic: clicking the header toggles the chatbot box
  // Use only one set of variables and logic to avoid redeclaration

  function showChatbotBox() {
    chatbot.classList.add('active');
    openBtn.style.display = 'none';
  }
  function hideChatbotBox() {
    chatbot.classList.remove('active');
    openBtn.style.display = 'flex';
  }

  if (openBtn && chatbot) {
    openBtn.addEventListener('click', showChatbotBox);
  }
  if (chatbotHeader && chatbot) {
    chatbotHeader.style.cursor = 'pointer';
    chatbotHeader.addEventListener('click', hideChatbotBox);
  }

  // On page load, only show the icon, hide the chatbot box
  window.addEventListener('DOMContentLoaded', function() {
    if (chatbot) chatbot.classList.remove('active');
    if (openBtn) openBtn.style.display = 'flex';
  });
});
