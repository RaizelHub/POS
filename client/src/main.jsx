import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext.jsx';
import { FeatureFlagProvider } from './context/FeatureFlagContext.jsx';

// Register Service Worker for offline POS application shell caching
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && (import.meta.env.PROD || window.location.protocol === 'https:')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('[SW] Service Worker registered successfully:', registration.scope);
      },
      (err) => {
        console.warn('[SW] Service Worker registration failed:', err);
      }
    );
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CustomThemeProvider>
      <FeatureFlagProvider>
        <App />
      </FeatureFlagProvider>
    </CustomThemeProvider>
  </StrictMode>
);
