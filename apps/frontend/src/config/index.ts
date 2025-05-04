// Configuration URL for various environments
// URL should refer to the backend API without trailing slash

// Determine backend URL based on environment and domain
const getBackendUrl = () => {
  // Production environment check
  if (process.env.NODE_ENV === 'production') {
    // Check deployment domain
    const hostname = window.location.hostname;
    
    if (hostname.includes('reusetest-frontend.vercel.app')) {
      return 'https://reusetest-frontend.vercel.app';
    }
    if (hostname.includes('reuse8.vercel.app')) {
      return 'https://reuse8.vercel.app';
    }
    if (hostname.includes('reuse-nine.vercel.app')) {
      return 'https://reuse-nine.vercel.app';
    }
    // Default production URL
    return 'https://reusetest-backend.vercel.app';
  }
  
  // Development environment
  return 'http://localhost:3000';
};

export const backendURL = getBackendUrl();

// Expose logging for debugging
console.log('Backend URL configured as:', backendURL);