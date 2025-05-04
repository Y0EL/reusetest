import { App } from '@/app';
import { initializeOpenAI } from './utils/initializeOpenAI';
import { SubmissionRoute } from './routes/submission.route';
import { logger } from '@utils/logger';
import HealthRoute from './routes/health.route';
import { optimizeForVercel } from './utils/vercel';

// Deteksi environment Vercel
const isVercel = process.env.VERCEL === '1';

// Log platform information
logger.info(`Running on platform: ${isVercel ? 'Vercel' : 'Standard Node.js'}`);
if (isVercel) {
  logger.info(`Vercel region: ${process.env.VERCEL_REGION || 'unknown'}`);
  logger.info(`Node.js version: ${process.version}`);
}

// Initialize OpenAI helper
const openAIHelper = initializeOpenAI();

// Create routes
const submissionRoute = new SubmissionRoute();
const healthRoute = new HealthRoute();

// Initialize app with routes
const app = new App([healthRoute, submissionRoute]);

// Apply Vercel optimizations
optimizeForVercel(app.getServer());

// Start server only if not imported as a module
if (require.main === module) {
  try {
    app.listen();
    logger.info('Server started successfully in standalone mode');
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
} else {
  logger.info('Server exported as a module (for serverless)');
}

export { openAIHelper };

// Export for serverless functions
module.exports = app.getServer();