const express = require('express');
const helmet = require('helmet');
const path = require('path');
const app = express();

// Security headers - ZAP ke 6 warnings isi se fix honge
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'"],
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "font-src": ["'self'", "https:", "data:"],
      "img-src": ["'self'", "data:", "https:"],
      "connect-src": ["'self'", "https://vehicle-rental-5eb2.vercel.app", "http://localhost:5000"]
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: false // images ke liye
}));

// Hide X-Powered-By
app.disable('x-powered-by');

app.use(express.static(path.join(__dirname, 'build')));

// React Router ke liye - Express 5 fix
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Frontend running with security headers on http://localhost:${PORT}`));