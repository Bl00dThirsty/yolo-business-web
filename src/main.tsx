import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Keep existing bookmarks working while using the new workspace address.
if (/^\/demo(?:\/|$)/.test(window.location.pathname)) {
  window.history.replaceState(null, '', '/app' + window.location.search + window.location.hash);
}
const privateRoute = /^\/(app|connexion|invitation|suivi)(?:\/|$)/.test(window.location.pathname);
if (privateRoute) {
  const robots = document.createElement('meta');
  robots.name = 'robots';
  robots.content = 'noindex, nofollow';
  document.head.appendChild(robots);
  document.title = 'Votre espace entreprise Yolo Business';
  document.querySelector('link[rel="canonical"]')?.remove();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
