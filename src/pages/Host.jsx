import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { isConfigured, supabase } from '../lib/supabase'
import { fetchQuizzes, deleteQuiz, createSession, updateSessionStatus, fetchQuestionsForQuiz } from '../lib/queries'
import { DEMO_QUIZZES, DEMO_QUESTIONS, LOBBY_DEMO_NAMES, CAT_BG } from '../lib/data'
import { useStore } from '../lib/store'
import { KBtn, Modal, Spinner, LiveBadge } from '../components/UI'

const CATEGORIES = ['All','Old Testament','New Testament','Gospel','Psalms & Proverbs','Epistles','Revelation']

export default function Host() {
  const navigate = useNavigate()
  const { setSession, setQuestions, showToast } = useStore()

  const [quizzes,     setQuizzes]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [filter,      setFilter]      = useState('All')
  const [search,      setSearch]      = useState('')
  const [deleteModal, setDeleteModal] = useState(null)   // { id, title }
  const [launchModal, setLaunchModal] = useState(null)   // { id, title }

  // Lobby state
  const [lobby,       setLobby]       = useState(null)   // { pin, quizTitle, sessionId }
  const [players,     setPlayers]     = useState([])
  const lobbyTimerRef = useRef(null)
  const rtChanRef     = useRef(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      if (isConfigured) {
        const data = await fetchQuizzes()
        setQuizzes(data)
      } else {
        setQuizzes(DEMO_QUIZZES)
      }
    } catch(e) {
      showToast('⚠️ Demo mode — ' + e.message.slice(0,40))
      setQuizzes(DEMO_QUIZZES)
    }
    setLoading(false)
  }

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = quizzes.filter(q =>
    (filter === 'All' || q.category === filter) &&
    (!search || q.title.toLowerCase().includes(search.toLowerCase()))
  )

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function confirmDelete() {
    const { id, title } = deleteModal
    setDeleteModal(null)
    try {
      if (isConfigured) await deleteQuiz(id)
      setQuizzes(prev => prev.filter(q => q.id !== id))
      showToast(`🗑️ "${title}" deleted`)
    } catch(e) { showToast('❌ ' + e.message.slice(0,50)) }
  }

  // ── Launch lobby ───────────────────────────────────────────────────────────
  async function confirmLaunch() {
    const { id, title } = launchModal
    setLaunchModal(null)
    const pin = String(Math.floor(100000 + Math.random() * 900000))
    setPlayers([])
    setLobby({ pin, quizTitle: title, sessionId: null })

    if (isConfigured) {
      try {
        const session = await createSession(id, pin)
        setLobby(prev => ({ ...prev, sessionId: session.id }))
        setSession(session.id, id)
        showToast(`🎙️ Lobby live! PIN: ${pin}`)

        // Realtime — watch for new players
        if (rtChanRef.current) supabase.removeChannel(rtChanRef.current)
        rtChanRef.current = supabase
          .channel('lobby-' + session.id)
          .on('postgres_changes', {
            event: 'INSERT', schema: 'public', table: 'players',
            filter: `session_id=eq.${session.id}`
          }, payload => setPlayers(prev => [...prev, payload.new.name]))
          .subscribe()
      } catch(e) {
        showToast('⚠️ Demo lobby — ' + e.message.slice(0,40))
        startDemoLobby()
      }
    } else {
      showToast(`🎙️ Demo lobby! PIN: ${pin}`)
      startDemoLobby()
    }
  }

  function startDemoLobby() {
    let i = 0
    lobbyTimerRef.current = setInterval(() => {
      if (i >= LOBBY_DEMO_NAMES.length) { clearInterval(lobbyTimerRef.current); return }
      setPlayers(prev => [...prev, LOBBY_DEMO_NAMES[i++]])
    }, 700)
  }

  async function endLobby() {
    clearInterval(lobbyTimerRef.current)
    if (rtChanRef.current) { supabase.removeChannel(rtChanRef.current); rtChanRef.current = null }
    if (isConfigured && lobby?.sessionId) await updateSessionStatus(lobby.sessionId, 'finished').catch(() => {})
    setLobby(null)
    setPlayers([])
  }

  async function startGame() {
    clearInterval(lobbyTimerRef.current)
    if (isConfigured && lobby?.sessionId) {
      await updateSessionStatus(lobby.sessionId, 'active').catch(() => {})
      const qs = await fetchQuestionsForQuiz(launchModal?.id || lobby?.sessionId).catch(() => null)
      setQuestions(qs || DEMO_QUESTIONS)
    } else {
      setQuestions(DEMO_QUESTIONS)
    }
    setLobby(null)
    navigate('/game')
  }

  // ── LOBBY VIEW ─────────────────────────────────────────────────────────────
  if (lobby) {
    return (
      <div className="min-h-screen bg-[#46178F] flex flex-col items-center pb-10">
        <div className="w-full max-w-xl px-5 pt-8 flex flex-col gap-5 animate-fadeUp text-center">
          <h2 className="font-montserrat font-black text-white text-3xl">🎙️ Game Lobby</h2>
          <div className="text-[#FFA602] font-bold text-sm">{lobby.quizTitle}</div>

          {/* PIN Card */}
          <div className="bg-white rounded-3xl p-7 shadow-2xl">
            <div className="text-xs font-black text-gray-400 tracking-[3px] uppercase mb-2">Game PIN — share this!</div>
            <div className="font-montserrat font-black text-[#46178F] text-6xl tracking-[8px] leading-none">{lobby.pin}</div>
            <div className="text-gray-400 text-xs font-bold mt-3">Players enter this PIN on the Home screen</div>
          </div>

          {/* Players */}
          <div className="bg-white/8 border border-white/12 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-montserrat font-black text-white text-base">
                {players.length > 0 ? `Players joined: ${players.length}` : 'Waiting for players…'}
              </span>
              <LiveBadge />
            </div>
            <div className="flex flex-wrap gap-2 justify-center min-h-12">
              {players.map((p, i) => (
                <span key={i} className="bg-[#5B2BA6] text-white font-bold text-sm px-4 py-1.5 rounded-full animate-popIn shadow">
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <KBtn onClick={startGame} disabled={players.length < 1}>
              🚀 START GAME
            </KBtn>
            <button
              onClick={endLobby}
              className="flex-1 py-3 bg-red-900/20 border border-red-500/30 rounded-xl text-red-300 font-bold text-sm hover:bg-red-900/35 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#46178F] flex flex-col items-center pb-12">
      {/* Header */}
      <div className="w-full max-w-4xl px-5 pt-8 pb-2 animate-fadeUp">
        <h2 className="font-montserrat font-black text-white text-3xl">📋 My Quizzes</h2>
        <p className="text-white/50 text-sm font-semibold mt-1">Create, launch and manage your Bible quiz games</p>
      </div>

      {/* Toolbar */}
      <div className="w-full max-w-4xl px-5 py-3 flex gap-3 flex-wrap items-center">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Search quizzes…"
          className="flex-1 min-w-40 bg-white/10 border border-white/18 rounded-xl px-4 py-2.5
                     text-white text-sm font-bold placeholder:text-white/30 outline-none
                     focus:border-[#FFA602] transition-colors font-nunito"
        />
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-full border text-xs font-black transition-all
                ${filter === c
                  ? 'bg-[#FFA602] border-[#FFA602] text-[#1A1A2E]'
                  : 'bg-transparent border-white/20 text-white/55 hover:text-white hover:border-white/40'
                }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="w-full max-w-4xl px-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <div className="col-span-full py-12"><Spinner /></div>}

        {!loading && filtered.map(q => (
          <QuizCard
            key={q.id}
            quiz={q}
            onLaunch={() => setLaunchModal({ id: q.id, title: q.title })}
            onDelete={() => setDeleteModal({ id: q.id, title: q.title })}
            onEdit={()   => showToast('✏️ Editor coming in next version!')}
          />
        ))}

        {!loading && (
          <button
            onClick={() => navigate('/create')}
            className="border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center
                       gap-2 p-10 text-white/35 font-montserrat font-black text-base
                       hover:border-[#FFA602] hover:text-[#FFA602] hover:bg-[#FFA602]/5 transition-all"
          >
            <span className="text-3xl">✚</span>
            Create New Quiz
          </button>
        )}
      </div>

      {/* Modals */}
      <Modal
        open={!!deleteModal}
        icon="🗑️"
        title={`Delete "${deleteModal?.title}"?`}
        desc="This permanently removes the quiz and all its questions from Supabase."
        confirmLabel="Delete"
        confirmVariant="red"
        onConfirm={confirmDelete}
        onClose={() => setDeleteModal(null)}
      />
      <Modal
        open={!!launchModal}
        icon="🚀"
        title={`Launch "${launchModal?.title}"?`}
        desc="A 6-digit PIN will be generated. Players join from the Home screen."
        confirmLabel="Launch"
        onConfirm={confirmLaunch}
        onClose={() => setLaunchModal(null)}
      />
    </div>
  )
}

function QuizCard({ quiz, onLaunch, onDelete, onEdit }) {
  const bg = CAT_BG[quiz.category] || '#5B2BA6'
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
      <div className="h-20 flex items-center justify-center text-5xl relative" style={{ background: bg }}>
        {quiz.emoji}
        <span className="absolute bottom-2 left-2.5 bg-black/40 text-white text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full">
          {quiz.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-montserrat font-black text-[#1A1A2E] text-base leading-tight mb-1.5">{quiz.title}</h3>
        <div className="flex gap-4 text-xs font-bold text-gray-400 mb-3">
          <span>❓ {quiz.questions ?? quiz.questionCount ?? 0} questions</span>
          <span>🎮 {quiz.played}× played</span>
        </div>
        <div className="flex gap-2">
          <button onClick={onLaunch} className="flex-1 py-2.5 bg-[#5B2BA6] hover:bg-[#8B60C8] text-white rounded-xl text-xs font-black uppercase transition-colors">🚀 Launch</button>
          <button onClick={onEdit}   className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-black uppercase transition-colors">✏️ Edit</button>
          <button onClick={onDelete} className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-xs font-black uppercase transition-colors">🗑</button>
        </div>
      </div>
    </div>
  )
}
