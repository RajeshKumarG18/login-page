const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ✅ Use native fetch if available (Node 18+), fallback to node-fetch
let fetchFn;
if (typeof fetch === 'function') {
  fetchFn = fetch;
} else {
  fetchFn = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ✅ Check if API key is missing
if (!OPENAI_API_KEY) {
  console.error("❌ Missing OpenAI API key in .env file. Add OPENAI_API_KEY=your-key");
}

app.post('/api/chatgpt', async (req, res) => {
  const { message } = req.body;
  console.log("➡️ Received message:", message);

  try {
    const response = await fetchFn('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // ✅ Use latest free model
        messages: [{ role: 'user', content: message }]
      })
    });

    const data = await response.json();
    console.log("✅ OpenAI raw response:", data);

    // Check for errors from OpenAI API
    if (data.error) {
      const errorMsg = data.error.message || "Unknown error from OpenAI.";
      console.error("⚠️ OpenAI API Error:", errorMsg);

      // Custom handling for quota errors
      if (data.error.code === "insufficient_quota") {
        return res.status(403).json({ reply: "⚠️ Quota exceeded. Please check your OpenAI plan or switch to a free model." });
      }

      return res.status(500).json({ reply: `OpenAI error: ${errorMsg}` });
    }

    const reply = data.choices?.[0]?.message?.content?.trim() || "🤖 No reply from AI.";
    res.json({ reply });

  } catch (err) {
    console.error('❌ Network or server error:', err);
    res.status(500).json({ reply: "🚫 Error connecting to OpenAI server. Please try again." });
  }
});

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = { app, server };
