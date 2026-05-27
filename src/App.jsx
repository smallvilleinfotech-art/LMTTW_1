import { Routes, Route } from 'react-router-dom'
import Topbar    from './components/Topbar'
import { Toast, SetupBanner } from './components/UI'
import { isConfigured } from './lib/supabase'
import { useNavigate } from 'react-router-dom'

import Home        from './pages/Home'
import Host        from './pages/Host'
import Game        from './pages/Game'
import Leaderboard from './pages/Leaderboard'
import Create      from './pages/Create'
import Settings    from './pages/Settings'

function BannerWrapper() {
  const navigate = useNavigate()
  if (isConfigured) return null
  return <SetupBanner onSetup={() => navigate('/settings')} />
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-[#46178F]">
      <Topbar />
      <BannerWrapper />
      <main className="flex-1">
        <Routes>
          <Route path="/"            element={<Home />}        />
          <Route path="/host"        element={<Host />}        />
          <Route path="/game"        element={<Game />}        />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/create"      element={<Create />}      />
          <Route path="/settings"    element={<Settings />}    />
        </Routes>
      </main>
      <Toast />
    </div>
  )
}
