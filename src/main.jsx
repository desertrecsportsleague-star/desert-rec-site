import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import JarvisPanel from './JarvisPanel.jsx'
import JarvisWebsiteManager from './JarvisWebsiteManager.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <JarvisPanel />
    <div style={{maxWidth: '1120px', margin: '0 auto', padding: '0 16px 40px'}}>
      <JarvisWebsiteManager />
    </div>
  </StrictMode>,
)
