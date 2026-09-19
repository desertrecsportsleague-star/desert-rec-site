import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import JarvisAdminTools from './JarvisAdminTools.jsx'
import JarvisHomepageSync from './JarvisHomepageSync.jsx'
import JarvisRegistrationSync from './JarvisRegistrationSync.jsx'
import { TournamentPublic, TournamentRoster } from './TournamentPublic.jsx'
import FallSoftballRegistration from './FallSoftballRegistration.jsx'
import FallCaptainRoster from './FallCaptainRoster.jsx'
import FallSoftballSchedule from './FallSoftballSchedule.jsx'

const params = new URLSearchParams(window.location.search)
const isTournament = window.location.pathname === '/tournaments' || params.has('tournament')
const isRoster = window.location.pathname === '/tournament-roster' || params.has('roster')
const isFallSoftball = window.location.pathname === '/fall-softball'
const isFallCaptain = window.location.pathname === '/fall-softball-captain'
const isFallSchedule = window.location.pathname === '/fall-softball-schedule'
const special = isTournament || isRoster || isFallSoftball || isFallCaptain || isFallSchedule

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isRoster ? <TournamentRoster /> :
      isTournament ? <TournamentPublic /> :
      isFallSchedule ? <FallSoftballSchedule /> :
      isFallCaptain ? <FallCaptainRoster /> :
      isFallSoftball ? <FallSoftballRegistration /> :
      <App />}
    {!special && <JarvisAdminTools />}
    {!special && <JarvisHomepageSync />}
    {!special && <JarvisRegistrationSync />}
  </StrictMode>
)
