import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA Service Worker for full offline caching
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('OMAS Aluminium PWA update available.');
  },
  onOfflineReady() {
    console.log('OMAS Aluminium PWA is cached and ready for 100% offline use.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
