import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import JarvisAdminTools from './JarvisAdminTools.jsx'
import JarvisHomepageSync from './JarvisHomepageSync.jsx'
import { TournamentPublic, TournamentRoster } from './TournamentPublic.jsx'

const params = new URLSearchParams(window.location.search)
const isTournament = window.location.pathname === '/tournaments' || params.has('tournament')
const isRoster = window.location.pathname === '/tournament-roster' || params.has('roster')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isRoster ? <TournamentRoster /> : isTournament ? <TournamentPublic /> : <App />}
    {!isTournament && !isRoster && <JarvisAdminTools />}
    {!isTournament && !isRoster && <JarvisHomepageSync />}
  </StrictMode>,
)
