const https = require('https');
const fs = require('fs');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync('.ssl/localhost.key'),
  cert: fs.readFileSync('.ssl/localhost.crt'),
};

app.prepare().then(() => {
  https.createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      
      // Handle static files and API routes
      if (parsedUrl.pathname.startsWith('/_next/') || 
          parsedUrl.pathname.startsWith('/static/') ||
          parsedUrl.pathname.startsWith('/api/')) {
        await handle(req, res, parsedUrl);
        return;
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  }).listen(3000, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log('> Ready on https://market-king.jp:3000');
  });
});