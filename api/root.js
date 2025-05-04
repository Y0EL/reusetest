// Dedicated handler for root path in Vercel
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  console.log('[DEBUG] Root path handler invoked');
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  
  // Serve the static index.html
  try {
    const publicPath = path.join(process.cwd(), 'public');
    const indexPath = path.join(publicPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      console.log('[DEBUG] Serving index.html from public directory');
      const content = fs.readFileSync(indexPath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.statusCode = 200;
      res.end(content);
    } else {
      // Generate fallback HTML
      console.log('[DEBUG] index.html not found, generating fallback');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.statusCode = 200;
      res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reuse API</title>
          <meta http-equiv="refresh" content="0;url=/api-docs">
        </head>
        <body>
          <h1>Reuse API</h1>
          <p>Redirecting to <a href="/api-docs">API documentation</a>...</p>
        </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('[DEBUG] Error serving root path:', error);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.statusCode = 500;
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Server Error</title>
      </head>
      <body>
        <h1>Server Error</h1>
        <p>Sorry, something went wrong while serving this page.</p>
      </body>
      </html>
    `);
  }
};