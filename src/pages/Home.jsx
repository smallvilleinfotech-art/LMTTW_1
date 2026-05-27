import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isConfigured, supabase } from '../lib/supabase'
import { fetchStats, findSessionByPin, joinSession, fetchQuestionsForQuiz } from '../lib/queries'
import { DEMO_QUESTIONS } from '../lib/data'
import { useStore } from '../lib/store'
import { KBtn, KInput } from '../components/UI'
import logo from '../assets/logo.png'

export default function Home() {
  const navigate  = useNavigate()
  const { setPlayer, setSession, setQuestions, showToast, resetPlayer } = useStore()

  const [pin,  setPin]  = useState('')
  const [name, setName] = useState('')
  const [stats, setStats] = useState({ quizzes: '—', players: '—', games: '—' })
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    resetPlayer()
    if (isConfigured) {
      fetchStats().then(setStats).catch(() => {})
    } else {
      setStats({ quizzes: 6, players: '1,284', games: 312 })
    }
  }, [])

  async function handleJoin() {
    if (!pin || pin.length < 4) { showToast('⚠️ Enter a valid Game PIN'); return }
    if (!name.trim())           { showToast('⚠️ Enter your name');         return }
    setJoining(true)
    try {
      if (isConfigured) {
        const session = await findSessionByPin(pin)
        if (!session)                    { showToast('❌ Game PIN not found');              setJoining(false); return }
        if (session.status === 'finished'){ showToast('❌ This game has already ended');    setJoining(false); return }
        const player = await joinSession(session.id, name.trim())
        setPlayer(name.trim(), player.id)
        setSession(session.id, session.quiz_id)
        const qs = await fetchQuestionsForQuiz(session.quiz_id)
        setQuestions(qs)
        showToast(`🎮 Joined as ${name.trim()}!`)
      } else {
        setPlayer(name.trim(), 'demo-player')
        setQuestions(DEMO_QUESTIONS)
        showToast(`🎮 Demo mode — welcome ${name.trim()}!`)
      }
      navigate('/game')
    } catch(e) {
      showToast('❌ ' + e.message.slice(0, 55))
      setJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#46178F] flex flex-col items-center pb-12">
      <div className="w-full max-w-md px-5 pt-10 flex flex-col gap-7 animate-fadeUp">

        {/* Hero */}
        <div className="text-center">
          <div className="w-32 h-32 rounded-full border-4 border-white/30 overflow-hidden mx-auto mb-5
                          bg-[#5B2BA6] flex items-center justify-center text-6xl
                          shadow-[0_0_40px_rgba(139,96,200,0.5)] animate-pulseGlow">
            <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-full"
              onError={e => { e.target.style.display = 'none'; e.target.parentNode.textContent = '✝️' }}
            />
          </div>
          <h1 className="font-montserrat font-black text-white text-4xl leading-tight">
            Lead Me to the <span className="text-[#FFA602]">Waters</span>
          </h1>
          <p className="text-white/65 font-nunito font-semibold mt-2 text-base">
            🕊️ Live Bible quizzes for your whole community
          </p>
        </div>

        {/* Join Card */}
        <div className="bg-white rounded-3xl p-7 shadow-2xl">
          <h2 className="font-montserrat font-black text-[#46178F] text-xl text-center mb-5">🎮 Join a Game</h2>
          <div className="flex flex-col gap-3">
            <KInput
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g,''))}
              placeholder="Enter Game PIN"
              maxLength={6}
              inputMode="numeric"
              className="text-center tracking-[6px] text-2xl"
            />
            <KInput
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              maxLength={22}
              className="tracking-normal text-base"
            />
            <KBtn onClick={handleJoin} disabled={joining}>
              {joining ? 'Joining…' : 'JOIN NOW'}
            </KBtn>
            <div className="flex items-center gap-3 text-gray-300 text-xs font-bold">
              <div className="flex-1 h-px bg-gray-200" />OR<div className="flex-1 h-px bg-gray-200" />
            </div>
            <KBtn onClick={() => navigate('/host')} variant="yellow">🎙️ HOST A GAME</KBtn>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon:'📖', val: stats.quizzes, label:'Quizzes' },
            { icon:'👥', val: stats.players, label:'Players' },
            { icon:'🎮', val: stats.games,   label:'Games'   },
            { icon:'✝️', val: '66',          label:'Books'   },
          ].map(s => (
            <div key={s.label} className="bg-white/10 border border-white/15 rounded-2xl py-3 px-2 text-center">
              <div className="text-xl mb-0.5">{s.icon}</div>
              <div className="font-montserrat font-black text-[#FFA602] text-xl">{s.val}</div>
              <div className="text-white/45 text-[10px] font-black uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
