import { NavLink } from 'react-router-dom'
import logo from '../assets/logo.png'

const LINKS = [
  { to: '/',            icon: '🏠', label: 'Home'   },
  { to: '/host',        icon: '📋', label: 'Host'   },
  { to: '/create',      icon: '✏️', label: 'Create' },
  { to: '/leaderboard', icon: '🏆', label: 'Scores' },
  { to: '/settings',    icon: '⚙️', label: 'Setup'  },
]

export default function Topbar() {
  return (
    <nav className="w-full sticky top-0 z-50 bg-[#3B1378] border-b border-white/10 flex items-center justify-between px-5 h-14">
      {/* Brand */}
      <NavLink to="/" className="flex items-center gap-2.5 no-underline">
        <div className="w-9 h-9 rounded-full border-2 border-white/30 overflow-hidden bg-[#5B2BA6] flex items-center justify-center text-xl flex-shrink-0">
          <img
            src={logo}
            alt="LMTW"
            className="w-full h-full object-cover rounded-full"
            onError={e => { e.target.style.display = 'none'; e.target.parentNode.textContent = '✝️' }}
          />
        </div>
        <div>
          <div className="font-montserrat font-black text-white text-sm leading-tight">Lead Me to the Waters</div>
          <div className="font-nunito font-bold text-white/40 text-[10px] tracking-widest uppercase">Bible Quiz Community</div>
        </div>
      </NavLink>

      {/* Nav links */}
      <div className="flex gap-0.5">
        {LINKS.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-nunito font-black
               transition-all duration-150
               ${isActive ? 'bg-white/20 text-white' : 'text-white/55 hover:bg-white/10 hover:text-white'}`
            }
          >
            <span className="text-sm">{l.icon}</span>
            <span className="hidden sm:inline">{l.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
