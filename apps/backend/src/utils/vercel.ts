import { Application, Request, Response, NextFunction } from 'express';
import { logger } from './logger';
import path from 'path';
import fs from 'fs';

/**
 * Optimization for Vercel serverless environment to ensure proper
 * handling of API routes and static content
 */
export const optimizeForVercel = (app: Application): void => {
  // Check if running in Vercel environment
  const isVercel = !!process.env.VERCEL;
  
  if (isVercel) {
    logger.info('Applying Vercel-specific optimizations');
    
    // Add handler for serving static index.html on root path
    app.get('/', (req: Request, res: Response) => {
      logger.info('[Vercel] Root path requested, serving index.html');
      const publicPath = path.join(__dirname, '../../public');
      const indexPath = path.join(publicPath, 'index.html');
      
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        logger.warn('[Vercel] index.html not found at', indexPath);
        // Fallback response if file doesn't exist
        res.status(200).send(`
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
    });
  }

  // Special header for Vercel environment to indicate API response
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Enhanced request logging for debugging
    if (isVercel) {
      logger.info(`[Vercel] Request: ${req.method} ${req.url} (Accept: ${req.headers.accept || 'none'})`);
    }
    
    // Improved API endpoint detection
    const isApiEndpoint = 
      req.path.startsWith('/api/') || 
      req.path === '/submitReceipt' || 
      req.path === '/health' ||
      req.path.includes('/remaining/') ||
      req.headers.accept?.includes('application/json') ||
      req.headers['x-requested-with'] === 'XMLHttpRequest';
    
    if (isApiEndpoint) {
      // Set an explicit header to mark API routes
      res.setHeader('X-API-Route', 'true');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      
      // Ensure content-type is set for API responses
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      
      // Add X-API-Route to the exposed headers
      const existingExposedHeaders = (res.getHeader('Access-Control-Expose-Headers') || '') as string;
      if (!existingExposedHeaders.includes('X-API-Route')) {
        res.setHeader(
          'Access-Control-Expose-Headers', 
          `${existingExposedHeaders}${existingExposedHeaders ? ',' : ''}X-API-Route`
        );
      }
      
      // Override the res.send method to ensure JSON responses
      const originalSend = res.send;
      res.send = function(body) {
        // If the body is not already a JSON string, ensure it's sent as JSON
        if (typeof body === 'object' && body !== null && !Buffer.isBuffer(body)) {
          return originalSend.call(this, JSON.stringify(body));
        }
        return originalSend.call(this, body);
      };
      
      if (isVercel) {
        logger.info(`[Vercel] API Route: ${req.method} ${req.url}`);
      }
    } else {
      // For non-API endpoints, explicitly set HTML content type if needed
      if (req.url === '/' || req.url.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        if (isVercel) {
          logger.info(`[Vercel] HTML Route: ${req.method} ${req.url}`);
        }
      }
    }
    
    next();
  });
  
  // Log Vercel-specific information
  if (isVercel) {
    logger.info(`Running in Vercel environment`);
    logger.info(`Vercel region: ${process.env.VERCEL_REGION || 'unknown'}`);
    logger.info(`Deployment ID: ${process.env.VERCEL_DEPLOYMENT_ID || 'unknown'}`);
    logger.info(`Node.js version: ${process.version}`);
  }
}; 