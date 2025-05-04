// Telegram webhook handler for Vercel integration
const telegramHandler = require('../apps/backend/api/telegram');

module.exports = async (req, res) => {
  console.log('[Vercel] Telegram webhook endpoint triggered');
  
  try {
    // Set CORS headers to allow API calls from anywhere
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    
    // Verify this is a POST request (Telegram webhooks use POST)
    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'Method not allowed',
        message: 'Only POST requests are allowed for this endpoint'
      });
    }
    
    // Pass the request to the actual telegram handler
    return telegramHandler(req, res);
  } catch (error) {
    console.error('[Vercel] Error in Telegram webhook:', error);
    
    // Always return 200 to Telegram even on errors to avoid repeated delivery attempts
    return res.status(200).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
}; 