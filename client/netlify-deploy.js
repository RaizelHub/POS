// This script is used for Netlify deployment
// It builds the project and ensures the _redirects file is in place

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting Netlify deployment build process...');

// Log environment variables (without sensitive values)
console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VITE_API_URL is set:', !!process.env.VITE_API_URL);

try {
  // Create a .env.production file if it doesn't exist
  const envPath = path.join(__dirname, '.env.production');
  if (!fs.existsSync(envPath)) {
    console.log('Creating .env.production file...');
    fs.writeFileSync(
      envPath,
      `VITE_API_URL=https://clean-u8gn.onrender.com\n`
    );
    console.log('.env.production file created');
  } else {
    console.log('.env.production file already exists');
  }

  // Run the Vite build
  console.log('Building the project with Vite...');
  execSync('vite build', { stdio: 'inherit' });

  // Ensure the dist directory exists
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    console.error('Error: dist directory does not exist after build.');
    process.exit(1);
  }

  // Create _redirects file in dist
  const redirectsDest = path.join(distDir, '_redirects');
  fs.writeFileSync(redirectsDest, '/* /index.html 200');
  console.log('Created _redirects file in dist directory');

  // Create a runtime config file that can be loaded by the app
  const runtimeConfig = {
    apiUrl: process.env.VITE_API_URL || 'https://clean-u8gn.onrender.com'
  };

  const configPath = path.join(distDir, 'config.json');
  fs.writeFileSync(configPath, JSON.stringify(runtimeConfig, null, 2));
  console.log('Created runtime config.json in dist directory');

  console.log('Netlify build completed successfully!');
} catch (error) {
  console.error('Error during Netlify build:', error);
  process.exit(1);
}
