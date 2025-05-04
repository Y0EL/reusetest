// Simple API docs endpoint for Vercel
module.exports = (req, res) => {
  console.log('API docs endpoint requested');
  
  // Redirect ke URL Swagger
  res.setHeader('Content-Type', 'text/html');
  res.statusCode = 200;
  
  // Render a simple HTML page
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Reuse API Documentation</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 { color: #0070f3; }
          .container { margin-top: 40px; }
          a { color: #0070f3; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .info { background: #f6f8fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .endpoint { background: #eef7ff; padding: 15px; border-radius: 5px; margin: 10px 0; }
          code { font-family: Menlo, Monaco, Lucida Console, Liberation Mono, monospace; background: #f1f1f1; padding: 2px 5px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Reuse API Documentation</h1>
          <p>Welcome to the API documentation for the Reuse application.</p>
          
          <div class="info">
            <h2>Available Endpoints</h2>
            <div class="endpoint">
              <h3>Health Check</h3>
              <p>Check if the API is running properly</p>
              <p><strong>URL:</strong> <code>/health</code> or <code>/api/health</code></p>
              <p><strong>Method:</strong> GET</p>
              <p><a href="/health" target="_blank">Test Health Endpoint</a></p>
            </div>
            
            <div class="endpoint">
              <h3>Submit Receipt</h3>
              <p>Submit a receipt for processing</p>
              <p><strong>URL:</strong> <code>/submitReceipt</code></p>
              <p><strong>Method:</strong> POST</p>
              <p><strong>Body:</strong> Multipart form data with image file</p>
            </div>
          </div>
          
          <p>For more detailed documentation and testing, please use the frontend application.</p>
        </div>
      </body>
    </html>
  `);
}; 