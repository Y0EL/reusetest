// Entry point for Vercel serverless
try {
  console.log('Loading server module...');
  const serverless = require('../dist/server.js');
  console.log('Server module loaded successfully');
  
  // Simple health check handler as fallback
  const healthHandler = (req, res) => {
    console.log('Direct health check invoked');
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({
      status: 'ok',
      message: 'Health check from fallback handler',
      timestamp: new Date().toISOString()
    }));
  };

  // Root path handler for serving index.html
  const rootHandler = (req, res) => {
    console.log('Root path handler invoked');
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Path to the public directory and index.html
      const publicPath = path.join(__dirname, '../public');
      const indexPath = path.join(publicPath, 'index.html');
      
      if (fs.existsSync(indexPath)) {
        console.log('Serving index.html from public directory');
        res.setHeader('Content-Type', 'text/html');
        res.statusCode = 200;
        const indexContent = fs.readFileSync(indexPath, 'utf8');
        res.end(indexContent);
      } else {
        console.log('index.html not found, serving fallback response');
        res.setHeader('Content-Type', 'text/html');
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
          </head>
          <body>
            <h1>Reuse API</h1>
            <p>If you are not redirected automatically, <a href="/api-docs">click here</a> to access the API documentation.</p>
          </body>
          </html>
        `);
      }
    } catch (error) {
      console.error('Error in root handler:', error);
      res.setHeader('Content-Type', 'text/html');
      res.statusCode = 500;
      res.end('<html><body><h1>Server Error</h1><p>Sorry, there was an error serving this page.</p></body></html>');
    }
  };

  // Express app or direct handler
  module.exports = (req, res) => {
    try {
      // Set CORS headers for all responses
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
      
      // Handle preflight OPTIONS request
      if (req.method === 'OPTIONS') {
        console.log('Handling OPTIONS preflight request');
        res.statusCode = 204;
        res.end();
        return;
      }
      
      // Check if the request is for the root path
      if (req.url === '/' || req.url === '') {
        console.log('Root path requested, using direct handler');
        return rootHandler(req, res);
      }
      
      // Check if the request is for health endpoint
      if (req.url === '/health' || req.url === '/api/health') {
        console.log(`Health endpoint requested via ${req.url}`);
        
        // Try using the server if it's an Express app
        if (typeof serverless === 'function') {
          console.log('Using server handler for health check');
          return serverless(req, res);
        } else {
          console.log('Using fallback handler for health check');
          return healthHandler(req, res);
        }
      }
      
      // For all other paths, pass to the server
      if (typeof serverless === 'function') {
        return serverless(req, res);
      } else {
        throw new Error('Server module is not a function');
      }
    } catch (err) {
      console.error('Error in handler:', err);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.statusCode = 500;
      res.end(JSON.stringify({
        error: 'Internal Server Error',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }));
    }
  };
} catch (err) {
  console.error('Failed to initialize server:', err);
  
  // Export a fallback handler that just returns the error
  module.exports = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.statusCode = 500;
    res.end(JSON.stringify({
      error: 'Server Initialization Failed',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }));
  };
} 