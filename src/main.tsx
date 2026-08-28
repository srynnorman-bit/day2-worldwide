import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely handle cross-origin script errors and unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message === 'Script error.' || !event.filename) {
      console.warn('Captured cross-origin script event:', event.message);
      if (typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      return true;
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.warn('Unhandled rejection caught:', event.reason);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
