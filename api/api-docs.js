// Simple API docs endpoint for Vercel
module.exports = (req, res) => {
  console.log('API docs endpoint requested');
  
  // Set the correct content-type for HTML
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.statusCode = 200;
  
  // Render Swagger UI using CDN resources
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Reuse API Documentation</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css" />
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          .topbar {
            display: none;
          }
          .swagger-ui .info .title {
            color: #3B82F6;
          }
          .swagger-ui .opblock.opblock-post {
            background: rgba(16, 185, 129, 0.05);
            border-color: #10B981;
          }
          .swagger-ui .opblock.opblock-post .opblock-summary-method {
            background: #10B981;
          }
          .swagger-ui .opblock.opblock-get {
            background: rgba(59, 130, 246, 0.05);
            border-color: #3B82F6;
          }
          .swagger-ui .opblock.opblock-get .opblock-summary-method {
            background: #3B82F6;
          }
          .swagger-ui .btn.execute {
            background-color: #3B82F6;
            border-color: #2563EB;
          }
          .swagger-ui .btn.execute:hover {
            background-color: #2563EB;
          }
          .swagger-ui section.models {
            border-color: #E5E7EB;
          }
          .swagger-ui section.models.is-open h4 {
            border-color: #E5E7EB;
          }
          .swagger-ui .opblock-tag {
            border-color: #F3F4F6;
          }
          .back-link {
            display: block;
            margin: 10px 20px;
            color: #3B82F6;
            text-decoration: none;
            font-size: 14px;
          }
          .back-link:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <a href="/" class="back-link">← Back to Dashboard</a>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = function() {
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
              layout: "StandaloneLayout",
              defaultModelsExpandDepth: 1,
              defaultModelExpandDepth: 1,
              displayRequestDuration: true,
              docExpansion: 'list',
              filter: true,
              requestSnippetsEnabled: true,
              tryItOutEnabled: true
            });
            window.ui = ui;
          };
        </script>
      </body>
    </html>
  `);
}; 