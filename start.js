fconst { server } = require('./server');
const open = require('open').default || require('open');

const PORT = process.env.PORT || 4000;

server.on('listening', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  // Open the default browser to the chatbot page (adjust path if needed)
  open(`http://localhost:${PORT}/index.html`).catch(err => {
    console.error('Failed to open browser:', err);
  });
});
