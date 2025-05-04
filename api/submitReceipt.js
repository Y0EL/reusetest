// Specialized handler for submitReceipt endpoint
const serverless = require('../apps/backend/dist/server.js');

// Handle receipt submissions with proper CORS
module.exports = (req, res) => {
  console.log('Submit receipt endpoint called via dedicated handler');
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request for submitReceipt');
    res.statusCode = 204;
    res.end();
    return;
  }
  
  // Handle POST request
  if (req.method === 'POST') {
    console.log('Processing POST request to submitReceipt');
    
    // Set a timeout to avoid hanging requests
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
    
    try {
      // Forward to the server handler
      if (typeof serverless === 'function') {
        // Modify the URL to ensure it's handled by the correct route
        req.url = '/submitReceipt';
        return serverless(req, res);
      } else {
        throw new Error('Server module is not a function');
      }
    } catch (err) {
      console.error('Error in submitReceipt handler:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Internal Server Error',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }));
    }
  } else {
    // Handle non-POST methods
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Method Not Allowed',
      message: 'Only POST method is allowed for this endpoint'
    }));
  }
}; 