// Configuration file for environment variables
const config = {
  // API URL - use environment variable or fallback to localhost for development
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
};

export default config;