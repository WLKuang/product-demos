import { HashRouter, Route, Routes } from 'react-router-dom'
import { Portfolio } from './pages/Portfolio'
import { MembershipApp } from './demos/membership/MembershipApp'
import { VenueApp } from './demos/venue/VenueApp'
import { OpsApp } from './demos/ops/OpsApp'
import { ToastProvider } from './ui'

// HashRouter so deep links work on any static host without rewrite rules.
export default function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/membership/*" element={<MembershipApp />} />
          <Route path="/venue-hire/*" element={<VenueApp />} />
          <Route path="/ops/*" element={<OpsApp />} />
        </Routes>
      </HashRouter>
    </ToastProvider>
  )
}
