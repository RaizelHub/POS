// Utility function to get the API URL
// This is a simpler alternative to using the config.js file

/**
 * Returns the API URL based on environment or hardcoded fallback
 * @returns {string} The API URL
 */
export const getApiUrl = () => {
  // First try to get from environment variables
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // For production, use the Render.com backend URL
  if (import.meta.env.PROD) {
    return 'https://clean-u8gn.onrender.com';
  }

  // For development, use localhost
  return 'http://localhost:8000';
};

export default getApiUrl;
