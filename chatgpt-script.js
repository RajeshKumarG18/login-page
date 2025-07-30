// Simple AI Chatbot logic (randomized responses)
document.addEventListener('DOMContentLoaded', function() {
  const chatbotContainer = document.getElementById('chatbot-container');
  const openBtn = document.getElementById('openChatbot');
  const closeBtn = document.getElementById('closeChatbot');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');
  const messages = document.getElementById('chatbot-messages');
  const chatbotHeader = document.getElementById('chatbot-header');

  // Use the same message box style as addChatbotMessage
  function appendMessage(text, sender = 'bot') {
    const messagesContainer = document.getElementById('chatbot-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `chatbot-message ${sender}`;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    msgDiv.appendChild(bubble);
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return bubble;
  }

  // --- Ollama API integration ---
  async function fetchOllamaResponseStream(message, onChunk) {
    try {
      const response = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'phi3',
          prompt: message,
          stream: true
        })
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullText = '';
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          // Ollama streams JSON lines, one per chunk
          const lines = chunk.split('\n').filter(Boolean);
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                fullText += data.response;
                if (onChunk) onChunk(fullText);
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }
      return fullText || "🤖 No reply from Ollama.";
    } catch (error) {
      console.error('Error fetching Ollama response:', error);
      return "Sorry, there was an error connecting to the Ollama AI service.";
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
      // Show typing indicator in a single bubble, then stream update it
      let botBubble = appendMessage('...', 'bot');
      await fetchOllamaResponseStream(input, (partial) => {
        if (botBubble) botBubble.textContent = partial;
      });
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
