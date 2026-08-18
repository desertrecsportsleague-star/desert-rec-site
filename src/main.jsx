import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import JarvisAdminTools from './JarvisAdminTools.jsx'
import JarvisHomepageSync from './JarvisHomepageSync.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <JarvisAdminTools />
    <JarvisHomepageSync />
  </StrictMode>,
)
