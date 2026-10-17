#!/usr/bin/env node
// Tiny static server for previewing dist/ locally (mirrors Netlify/Cloudflare pretty URLs + 404.html).
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const DIST = path.join(__dirname, '..', 'dist');
const PORT = Number(process.env.PORT) || 8080;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
  '.xml': 'application/xml', '.txt': 'text/plain', '.pdf': 'application/pdf', '.webmanifest': 'application/manifest+json',
};

http.createServer((req, res) => {
  if (req.method === 'POST') { res.writeHead(200); return res.end('ok'); } // simulate Netlify Forms locally
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = path.join(DIST, p);
  if (!file.startsWith(DIST)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  else if (!fs.existsSync(file) && fs.existsSync(file + '.html')) file += '.html';
  if (!p.endsWith('/') && !path.extname(p) && fs.existsSync(path.join(DIST, p, 'index.html'))) {
    res.writeHead(301, { Location: p + '/' }); return res.end();
  }
  const status = fs.existsSync(file) ? 200 : 404;
  if (status === 404) file = path.join(DIST, '404.html');
  const type = TYPES[path.extname(file)] || 'application/octet-stream';
  // gzip text responses, like Netlify / Cloudflare do in production
  if (/text|javascript|json|xml|svg|manifest/.test(type) && /gzip/.test(req.headers['accept-encoding'] || '')) {
    res.writeHead(status, { 'Content-Type': type, 'Content-Encoding': 'gzip', 'Cache-Control': 'no-cache' });
    return fs.createReadStream(file).pipe(zlib.createGzip()).pipe(res);
  }
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Serving dist/ at http://localhost:${PORT}`));
