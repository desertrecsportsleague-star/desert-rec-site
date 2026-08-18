import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import JarvisPanel from './JarvisPanel.jsx'
import JarvisAdminTools from './JarvisAdminTools.jsx'
import JarvisHomepageSync from './JarvisHomepageSync.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <JarvisPanel />
    <JarvisAdminTools />
    <JarvisHomepageSync />
  </StrictMode>,
)
