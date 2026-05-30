import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { AppProvider } from './context/AppContext';
import AppShell from './components/AppShell';
import './index.css';

registerSW({ immediate: true });

/* When a new service worker takes control (after autoUpdate has
   activated a fresh deploy in the background), reload once so the
   open page swaps to the new code without the user hard-refreshing. */
if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <AppShell />
    </AppProvider>
  </StrictMode>,
);
