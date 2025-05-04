// Dedicated handler for root path in Vercel
module.exports = (req, res) => {
  console.log('Root path handler invoked');
  
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
  
  // Direct HTML response for root path
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.statusCode = 200;
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reuse API</title>
      <script>
        // Redirect to API documentation
        window.location.href = "/api-docs";
      </script>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          text-align: center;
          padding: 40px;
        }
        h1 {
          color: #333;
        }
        a {
          color: #0070f3;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <h1>Reuse API</h1>
      <p>If you are not redirected automatically, <a href="/api-docs">click here</a> to access the API documentation.</p>
    </body>
    </html>
  `);
}; 