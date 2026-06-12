// Configuration for API endpoints
import { loadRuntimeConfig } from './utils/runtimeConfig.js';

// Initial config with fallback values
let config = {
  // Use environment variables in production, fallback to localhost for development
  apiUrl: import.meta.env.VITE_API_URL || 'https://clean-u8gn.onrender.com'
};

// Try to load runtime configuration
(async () => {
  try {
    const runtimeConfig = await loadRuntimeConfig();
    if (runtimeConfig && runtimeConfig.apiUrl) {
      config.apiUrl = runtimeConfig.apiUrl;
      console.log('API URL set to:', config.apiUrl);
    }
  } catch (error) {
    console.error('Failed to load runtime configuration:', error);
  }
})();

export default config;
