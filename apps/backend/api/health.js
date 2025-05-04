// Health check endpoint for Vercel
module.exports = (req, res) => {
  console.log('Health check endpoint invoked');
  
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
  
  // Set content type and status code
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  
  // Respond with health information
  res.end(JSON.stringify({
    status: 'ok',
    serverTime: new Date().toISOString(),
    environment: process.env.VERCEL ? 'vercel' : 'node',
    region: process.env.VERCEL_REGION || 'unknown',
    deployId: process.env.VERCEL_DEPLOYMENT_ID || 'unknown',
    nodeVersion: process.version
  }));
}; 