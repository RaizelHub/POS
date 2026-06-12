// Runtime configuration loader
// This allows loading configuration at runtime from a config.json file
// which is useful for Netlify deployments where environment variables
// might not be properly injected at build time

let runtimeConfig = null;

// Function to load the runtime configuration
export const loadRuntimeConfig = async () => {
  if (runtimeConfig) {
    return runtimeConfig;
  }

  try {
    // First try to use environment variables
    if (import.meta.env.VITE_API_URL) {
      runtimeConfig = {
        apiUrl: import.meta.env.VITE_API_URL
      };
      console.log('Using environment variables for configuration');
      return runtimeConfig;
    }

    // If environment variables are not available, try to load from config.json
    const response = await fetch('/config.json');
    if (!response.ok) {
      throw new Error('Failed to load runtime configuration');
    }

    runtimeConfig = await response.json();
    console.log('Loaded runtime configuration from config.json');
    return runtimeConfig;
  } catch (error) {
    console.error('Error loading runtime configuration:', error);
    // Fallback to default configuration
    runtimeConfig = {
      apiUrl: 'https://clean-u8gn.onrender.com'
    };
    console.log('Using fallback configuration');
    return runtimeConfig;
  }
};

// Function to get the API URL
export const getApiUrl = async () => {
  const config = await loadRuntimeConfig();
  return config.apiUrl;
};

// Default export for convenience
export default {
  loadRuntimeConfig,
  getApiUrl
};
