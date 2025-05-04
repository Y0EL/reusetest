document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // Initialize pages
    const pages = document.querySelectorAll('.page');
    const sidebarLinks = document.querySelectorAll('.nav-links a');

    // Theme Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    console.log('Theme Toggle Element:', themeToggle);
    
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    console.log('Prefers Dark Scheme:', prefersDarkScheme.matches);

    // Function to update theme icon
    function updateThemeIcon(theme) {
        console.log('Updating theme icon to:', theme);
        if (!themeToggle) {
            console.log('Theme toggle button not found');
            return;
        }
        const icon = themeToggle.querySelector('i');
        if (!icon) {
            console.log('Icon element not found');
            return;
        }

        // Remove all possible classes first
        icon.classList.remove('fa-sun', 'fa-moon');
        
        // Add the appropriate class
        if (theme === 'dark') {
            icon.classList.add('fa-moon');
        } else {
            icon.classList.add('fa-sun');
        }
        console.log('Icon classes after update:', icon.className);
    }

    // Initialize theme
    function initializeTheme() {
        console.log('Initializing theme');
        const savedTheme = localStorage.getItem('theme');
        console.log('Saved theme:', savedTheme);
        
        if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
        } else {
            const systemTheme = prefersDarkScheme.matches ? 'dark' : 'light';
            console.log('Using system theme:', systemTheme);
            document.documentElement.setAttribute('data-theme', systemTheme);
            updateThemeIcon(systemTheme);
        }
    }

    // Toggle theme
    if (themeToggle) {
        console.log('Adding click event listener to theme toggle');
    themeToggle.addEventListener('click', () => {
            console.log('Theme toggle clicked');
        const currentTheme = document.documentElement.getAttribute('data-theme');
            console.log('Current theme:', currentTheme);
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            console.log('Switching to theme:', newTheme);
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
    } else {
        console.log('Theme toggle button not found, skipping event listener');
    }

    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        console.log('System theme changed:', e.matches ? 'dark' : 'light');
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            updateThemeIcon(newTheme);
        }
    });

    // Initialize theme on page load
    initializeTheme();

    // Sidebar navigation with smooth scroll
    sidebarLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = pages[index];
            if (targetPage) {
                targetPage.scrollIntoView({ behavior: 'smooth' });
                
                // Update active state in sidebar
                sidebarLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const sidebar = document.querySelector('.sidebar');

    if (mobileMenuButton && sidebar) {
    mobileMenuButton.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !mobileMenuButton.contains(e.target)) {
            sidebar.classList.remove('show');
        }
    });
    }

    // Code block copy functionality
    document.querySelectorAll('pre code').forEach(block => {
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.innerHTML = '<i class="fas fa-copy"></i>';
        
        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(block.textContent);
                button.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            } catch (err) {
                button.innerHTML = '<i class="fas fa-times"></i>';
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            }
        });
        
        block.parentNode.appendChild(button);
    });

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            pages.forEach(page => {
                const content = page.textContent.toLowerCase();
                const isVisible = content.includes(searchTerm);
                page.style.display = isVisible ? 'block' : 'none';
            });
        });
    }

    // Server Status & Logs functionality
    function initializeServerPage() {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');
        const logsTableBody = document.getElementById('logsTableBody');
        const dateFilter = document.getElementById('dateFilter');
        const searchLogsInput = document.getElementById('searchLogs');

        // Check server status
        async function checkServerStatus() {
            try {
                console.log('Checking server status...');
                const response = await fetch('/api/health');
                console.log('Server status response:', response.status);
                
                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Server status data:', data);
                
                if (statusDot) {
                    statusDot.className = `status-dot ${data.status}`;
                }
                if (statusText) {
                    let statusMessage = 'Server is Offline';
                    let statusColor = '#f44336'; // Red for offline
                    
                    switch (data.status) {
                        case 'live':
                            statusMessage = 'Server is Live';
                            statusColor = '#4CAF50'; // Green for live
                            break;
                        case 'maintenance':
                            statusMessage = 'Server Maintenance';
                            statusColor = '#FFA500'; // Orange for maintenance
                            break;
                        case 'offline':
                            statusMessage = 'Server is Offline';
                            statusColor = '#f44336'; // Red for offline
                            break;
                    }
                    
                    statusText.textContent = statusMessage;
                    statusText.style.color = statusColor;
                }

                // Display environment information if available
                const envInfo = document.getElementById('envInfo');
                if (envInfo && data.environment) {
                    const env = data.environment;
                    envInfo.innerHTML = `
                        <div class="env-info">
                            <p><strong>Environment:</strong> ${env.nodeEnv}</p>
                            <p><strong>Hostname:</strong> ${env.hostname}</p>
                            <p><strong>Location:</strong> ${env.isLocal ? 'Local' : 'Internet'}</p>
                            <p><strong>Platform:</strong> ${env.platform}</p>
                            <p><strong>Uptime:</strong> ${Math.floor(env.uptime / 60)} minutes</p>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Error checking server status:', error);
                if (statusDot) statusDot.className = 'status-dot offline';
                if (statusText) {
                    statusText.textContent = 'Server is Offline';
                    statusText.style.color = '#f44336';
                }
            }
        }

        // Fetch and display logs
        async function fetchLogs() {
            try {
                console.log('Fetching logs...');
                const response = await fetch('/api/logs');
                console.log('Logs response:', response.status);
                
                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
                
                const logs = await response.json();
                console.log('Logs data:', logs);
                displayLogs(logs);
            } catch (error) {
                console.error('Error fetching logs:', error);
                // Add a message to the logs table if there's an error
                if (logsTableBody) {
                    logsTableBody.innerHTML = `
                        <tr>
                            <td colspan="6" class="error-message">Error fetching logs: ${error.message}</td>
                        </tr>
                    `;
                }
            }
        }

        // Display logs in table
        function displayLogs(logs) {
            if (!logsTableBody) return;

            logsTableBody.innerHTML = '';
            logs.forEach(log => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${new Date(log.timestamp).toLocaleString()}</td>
                    <td>${log.method}</td>
                    <td>${log.endpoint}</td>
                    <td>${log.ipAddress}</td>
                    <td><span class="status ${getStatusClass(log.status)}">${log.status}</span></td>
                    <td>${log.responseTime}ms</td>
                    <td>
                        <button onclick="showDeviceInfo(${JSON.stringify(log.deviceInfo).replace(/"/g, '&quot;')})" class="info-btn">
                            View Info
                        </button>
                    </td>
                `;
                logsTableBody.appendChild(row);
            });
        }

        // Filter logs by date
        function filterLogsByDate(date) {
            if (!logsTableBody) return;
            const rows = logsTableBody.querySelectorAll('tr');
            rows.forEach(row => {
                const timestamp = new Date(row.cells[0].textContent);
                const filterDate = new Date(date);
                const isSameDate = timestamp.toDateString() === filterDate.toDateString();
                row.style.display = isSameDate ? '' : 'none';
            });
        }

        // Search logs
        function searchLogs(query) {
            if (!logsTableBody) return;
            const rows = logsTableBody.querySelectorAll('tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
            });
        }

        // Get status class for styling
        function getStatusClass(status) {
            if (status >= 200 && status < 300) return 'success';
            if (status >= 400 && status < 500) return 'warning';
            if (status >= 500) return 'error';
            return '';
        }

        // Event listeners
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => filterLogsByDate(e.target.value));
        }

        if (searchLogsInput) {
            searchLogsInput.addEventListener('input', (e) => searchLogs(e.target.value));
        }

        // Initial setup
        checkServerStatus();
        fetchLogs();

        // Refresh data every 30 seconds
        setInterval(() => {
            checkServerStatus();
            fetchLogs();
        }, 30000);
    }

    // Initialize server page
    initializeServerPage();
});

function updateLogTable(logs) {
    const tbody = document.querySelector('#logTable tbody');
    tbody.innerHTML = '';
    
    logs.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(log.timestamp).toLocaleString()}</td>
            <td>${log.method}</td>
            <td>${log.endpoint}</td>
            <td>${log.ipAddress}</td>
            <td>${log.status}</td>
            <td>${log.responseTime}ms</td>
            <td>
                <button onclick="showDeviceInfo(${JSON.stringify(log.deviceInfo).replace(/"/g, '&quot;')})" class="info-btn">
                    View Info
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showDeviceInfo(deviceInfo) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Device Information</h2>
            <div class="device-info">
                <p><strong>User Agent:</strong> ${deviceInfo.userAgent}</p>
                <p><strong>Platform:</strong> ${deviceInfo.platform}</p>
                <p><strong>Language:</strong> ${deviceInfo.language}</p>
                ${deviceInfo.deviceMemory ? `<p><strong>Device Memory:</strong> ${deviceInfo.deviceMemory}GB</p>` : ''}
                ${deviceInfo.hardwareConcurrency ? `<p><strong>CPU Cores:</strong> ${deviceInfo.hardwareConcurrency}</p>` : ''}
                ${deviceInfo.connection ? `
                    <div class="connection-info">
                        <h3>Network Information</h3>
                        <p><strong>Connection Type:</strong> ${deviceInfo.connection.effectiveType}</p>
                        <p><strong>Round Trip Time:</strong> ${deviceInfo.connection.rtt}ms</p>
                        <p><strong>Download Speed:</strong> ${deviceInfo.connection.downlink}Mbps</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => {
        document.body.removeChild(modal);
    };
    
    window.onclick = (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    };
} 