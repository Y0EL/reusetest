// Simple API docs endpoint for Vercel
module.exports = (req, res) => {
  console.log('API docs endpoint requested');
  
  // Set the correct content-type for HTML
  res.setHeader('Content-Type', 'text/html');
  res.statusCode = 200;
  
  // Render HTML with proper Swagger UI initialization
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Reuse API Documentation</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
          }
          #swagger-ui {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          .topbar {
            display: none;
          }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        
        <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = function() {
            // Begin Swagger UI call region
            const ui = SwaggerUIBundle({
              url: "https://raw.githubusercontent.com/Y0EL/reusetest/main/apps/backend/swagger.yaml",
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
              ],
              layout: "StandaloneLayout"
            });
            // End Swagger UI call region
            window.ui = ui;
          };
        </script>
      </body>
    </html>
  `);
}; 