// This script copies the _redirects file to the build directory
// Run this after the build process

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist. Run build first.');
  process.exit(1);
}

// Copy _redirects file to dist
const redirectsSource = path.join(__dirname, 'public', '_redirects');
const redirectsDest = path.join(distDir, '_redirects');

try {
  if (fs.existsSync(redirectsSource)) {
    fs.copyFileSync(redirectsSource, redirectsDest);
    console.log('Successfully copied _redirects file to dist directory');
  } else {
    // Create _redirects file if it doesn't exist
    fs.writeFileSync(redirectsDest, '/* /index.html 200');
    console.log('Created _redirects file in dist directory');
  }
} catch (error) {
  console.error('Error copying _redirects file:', error);
  process.exit(1);
}
