// Dedicated handler for root path in Vercel
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  console.log('[DEBUG] Root path handler invoked');
  
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
  
  // Serve the dashboard HTML
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.statusCode = 200;
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reuse Backend Dashboard</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --primary-color: #3B82F6;
          --primary-dark: #2563EB;
          --secondary-color: #10B981;
          --bg-color: #F9FAFB;
          --text-color: #1F2937;
          --text-light: #6B7280;
          --border-color: #E5E7EB;
          --card-bg: #FFFFFF;
          --error-color: #EF4444;
          --success-color: #10B981;
          --warning-color: #F59E0B;
          --info-color: #3B82F6;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: var(--bg-color);
          color: var(--text-color);
          line-height: 1.5;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary-color);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .logo svg {
          width: 24px;
          height: 24px;
        }
        
        .card {
          background-color: var(--card-bg);
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        h1, h2, h3 {
          margin-bottom: 1rem;
        }
        
        .endpoint {
          border: 1px solid var(--border-color);
          border-radius: 0.375rem;
          padding: 1rem;
          margin-bottom: 1rem;
        }
        
        .endpoint-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        
        .endpoint-url {
          font-family: monospace;
          background-color: #EEF2FF;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          margin-bottom: 0.5rem;
          display: inline-block;
        }
        
        .method {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
        }
        
        .method.get {
          background-color: rgba(59, 130, 246, 0.1);
          color: #2563EB;
        }
        
        .method.post {
          background-color: rgba(16, 185, 129, 0.1);
          color: #059669;
        }
        
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background-color: var(--card-bg);
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          text-align: center;
        }
        
        .stat-value {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }
        
        .stat-label {
          color: var(--text-light);
          font-size: 0.875rem;
        }

        .status {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .status.success {
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--success-color);
        }
        
        .status.error {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--error-color);
        }
        
        .btn {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          background-color: var(--primary-color);
          color: white;
          font-weight: 500;
          text-decoration: none;
          transition: background-color 0.2s;
          border: none;
          cursor: pointer;
        }
        
        .btn:hover {
          background-color: var(--primary-dark);
        }
        
        .auth-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 3rem;
          text-align: center;
        }
        
        .dashboard {
          display: none;
        }
        
        footer {
          margin-top: 4rem;
          text-align: center;
          color: var(--text-light);
          font-size: 0.875rem;
          padding: 1rem 0;
          border-top: 1px solid var(--border-color);
        }
        
        @media (max-width: 768px) {
          .stats {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <div class="logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
              <path fill-rule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clip-rule="evenodd" />
            </svg>
            Reuse Backend
          </div>
          <div id="statusIndicator" class="status success">
            <span id="statusDot" style="display: inline-block; width: 8px; height: 8px; background-color: currentColor; border-radius: 50%;"></span>
            <span id="statusText">API Online</span>
          </div>
        </header>
        
        <!-- Auth section (shown first) -->
        <div id="authSection" class="auth-section card">
          <h2>Connect with VeWorld to access the dashboard</h2>
          <p style="margin: 1rem 0 2rem;">Please login to view backend statistics, API endpoints, and more</p>
          <button id="connectButton" class="btn">Connect VeWorld Wallet</button>
        </div>
        
        <!-- Dashboard section (hidden until authenticated) -->
        <div id="dashboard" class="dashboard">
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value" id="apiCalls">--</div>
              <div class="stat-label">Total API Calls</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" id="submissions">--</div>
              <div class="stat-label">Submissions</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" id="users">--</div>
              <div class="stat-label">Unique Users</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" id="uptime">--</div>
              <div class="stat-label">Uptime</div>
            </div>
          </div>
          
          <div class="card">
            <h2>API Endpoints</h2>
            
            <div class="endpoint">
              <div class="endpoint-header">
                <span>Health Check</span>
                <span class="method get">GET</span>
              </div>
              <div class="endpoint-url">/health</div>
              <p>Check if the API is running properly</p>
              <a href="/health" target="_blank" class="btn" style="margin-top: 0.5rem; font-size: 0.875rem;">Test Endpoint</a>
            </div>
            
            <div class="endpoint">
              <div class="endpoint-header">
                <span>Submit Receipt</span>
                <span class="method post">POST</span>
              </div>
              <div class="endpoint-url">/submitReceipt</div>
              <p>Submit a receipt for processing and earn rewards</p>
            </div>
            
            <div class="endpoint">
              <div class="endpoint-header">
                <span>Remaining Submissions</span>
                <span class="method get">GET</span>
              </div>
              <div class="endpoint-url">/submitReceipt/remaining/:address</div>
              <p>Check how many submissions a wallet has remaining in the current cycle</p>
            </div>
          </div>
          
          <div class="card">
            <h2>API Documentation</h2>
            <p>For detailed API documentation and testing, visit our Swagger UI documentation.</p>
            <a href="/api-docs" class="btn" style="margin-top: 1rem;">View API Docs</a>
          </div>
        </div>
        
        <footer>
          <p>&copy; 2023 Reuse Backend API. All rights reserved.</p>
        </footer>
      </div>
      
      <!-- VeWorld integration script -->
      <script>
        // Function to update the API status indicator
        function updateStatusIndicator(online = true) {
          const indicator = document.getElementById('statusIndicator');
          const dot = document.getElementById('statusDot');
          const text = document.getElementById('statusText');
          
          if (online) {
            indicator.className = 'status success';
            text.textContent = 'API Online';
          } else {
            indicator.className = 'status error';
            text.textContent = 'API Offline';
          }
        }
        
        // Function to check if the API is online
        async function checkApiStatus() {
          try {
            const response = await fetch('/health');
            if (response.ok) {
              updateStatusIndicator(true);
            } else {
              updateStatusIndicator(false);
            }
          } catch (error) {
            updateStatusIndicator(false);
          }
        }
        
        // Function to simulate dashboard data (replace with real data in production)
        function loadDashboardData() {
          document.getElementById('apiCalls').textContent = '4,392';
          document.getElementById('submissions').textContent = '1,245';
          document.getElementById('users').textContent = '319';
          document.getElementById('uptime').textContent = '99.8%';
        }
        
        // VeWorld connection
        let walletAddress = null;
        
        async function connectWallet() {
          try {
            // Check if VeWorld is available
            if (typeof window.vechain === 'undefined') {
              alert('VeWorld wallet extension not found. Please install VeWorld wallet to continue.');
              return;
            }
            
            // Request account access
            const accounts = await window.vechain.thor.request({ method: 'eth_requestAccounts' });
            
            if (accounts && accounts.length > 0) {
              walletAddress = accounts[0];
              
              // Login successful, show dashboard
              document.getElementById('authSection').style.display = 'none';
              document.getElementById('dashboard').style.display = 'block';
              
              // Load dashboard data
              loadDashboardData();
              
              console.log('Connected wallet:', walletAddress);
            }
          } catch (error) {
            console.error('Error connecting to VeWorld wallet:', error);
            alert('Failed to connect to VeWorld wallet. Please try again.');
          }
        }
        
        // Event listeners
        document.getElementById('connectButton').addEventListener('click', connectWallet);
        
        // Check API status on load
        window.addEventListener('load', () => {
          checkApiStatus();
          
          // Check for existing connection
          if (typeof window.vechain !== 'undefined') {
            window.vechain.thor.request({ method: 'eth_accounts' })
              .then(accounts => {
                if (accounts && accounts.length > 0) {
                  walletAddress = accounts[0];
                  document.getElementById('authSection').style.display = 'none';
                  document.getElementById('dashboard').style.display = 'block';
                  loadDashboardData();
                }
              })
              .catch(console.error);
          }
        });
      </script>
    </body>
    </html>
  `);
};