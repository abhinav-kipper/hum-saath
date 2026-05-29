import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { AppProvider } from './context/AppContext';
import AppShell from './components/AppShell';
import './index.css';

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <AppShell />
    </AppProvider>
  </StrictMode>,
);
