// Configuration URL for various environments
// URL should refer to the backend API without trailing slash

// Determine backend URL based on environment and domain
const getBackendUrl = () => {
  // Production environment check
  if (process.env.NODE_ENV === 'production') {
    // Always use the backend URL regardless of the frontend domain
    return 'https://reusetest-backend.vercel.app';
  }
  
  // Development environment
  return 'http://localhost:3000';
};

export const backendURL = getBackendUrl();

// Expose logging for debugging
console.log('Backend URL configured as:', backendURL);