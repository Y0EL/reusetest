// Telegram debug endpoint for Vercel integration
const telegramDebugHandler = require('../apps/backend/api/telegram-debug');

module.exports = async (req, res) => {
  console.log('[Vercel] Telegram debug endpoint triggered');
  
  try {
    // Set CORS headers to allow API calls from anywhere
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    
    // Verify this is a GET request (debug endpoint uses GET)
    if (req.method !== 'GET') {
      return res.status(405).json({
        error: 'Method not allowed',
        message: 'Only GET requests are allowed for this endpoint'
      });
    }
    
    // Pass the request to the actual telegram debug handler
    return telegramDebugHandler(req, res);
  } catch (error) {
    console.error('[Vercel] Error in Telegram debug endpoint:', error);
    
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message || 'Unknown error'
    });
  }
}; 