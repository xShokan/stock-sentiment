/* Production server — serves static files + proxies API using fetch */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4173;
const BACKEND = 'http://127.0.0.1:8000';
const distDir = path.join(__dirname, 'dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function serveFile(res, filePath) {
  try {
    const content = fs.readFileSync(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(content);
  } catch (e) {
    res.writeHead(404);
    res.end('Not Found');
  }
}

const server = http.createServer(async (req, res) => {
  const url = req.url;

  // API: forward to backend
  if (url.startsWith('/api/') || url === '/api') {
    try {
      const backendRes = await fetch(BACKEND + url, {
        headers: { 'Accept': 'application/json' },
      });
      const body = await backendRes.text();
      res.writeHead(backendRes.status, {
        'Content-Type': backendRes.headers.get('content-type') || 'application/json',
      });
      res.end(body);
    } catch (e) {
      res.writeHead(502);
      res.end(JSON.stringify({ error: 'Backend unavailable' }));
    }
    return;
  }

  // Static files
  const filePath = path.join(distDir, url === '/' ? 'index.html' : url);
  const ext = path.extname(filePath);

  if (ext && fs.existsSync(filePath)) {
    serveFile(res, filePath);
  } else {
    serveFile(res, path.join(distDir, 'index.html'));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`StockSense production server running on http://0.0.0.0:${PORT}`);
});
