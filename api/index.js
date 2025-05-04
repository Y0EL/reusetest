// Entry point for Vercel serverless
try {
  console.log('Loading server module...');
  const serverless = require('../apps/backend/dist/server.js');
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
      
      // Set a 30 second timeout for submitReceipt requests
      if (req.url === '/submitReceipt' || req.url === '/api/submitReceipt') {
        console.log('Submit receipt endpoint called, setting timeout');
        
        const timeout = setTimeout(() => {
          console.error('Request timeout for submitReceipt');
          res.statusCode = 504;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            error: 'Gateway Timeout',
            message: 'Request processing took too long',
            status: 'error'
          }));
        }, 30000); // 30 seconds timeout
        
        // Clear timeout when the response finishes
        res.on('finish', () => {
          clearTimeout(timeout);
        });
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