import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext.jsx';
import { FeatureFlagProvider } from './context/FeatureFlagContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CustomThemeProvider>
      <FeatureFlagProvider>
        <App />
      </FeatureFlagProvider>
    </CustomThemeProvider>
  </StrictMode>
);

