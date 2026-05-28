import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import { ProfileProvider } from './context/ProfileContext';
import { initInstallCapture } from './lib/installPrompt';
import App from './App';
import './index.css';

// Keep the installed app fresh; updates apply on next load.
registerSW({ immediate: true });

// Capture the Android install prompt as early as possible.
initInstallCapture();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ProfileProvider>
        <App />
      </ProfileProvider>
    </BrowserRouter>
  </StrictMode>,
);
