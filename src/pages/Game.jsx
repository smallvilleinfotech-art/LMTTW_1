import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { updatePlayerScore } from '../lib/queries'
import { isConfigured } from '../lib/supabase'
import { DEMO_QUESTIONS, ANS_STYLES } from '../lib/data'
import TimerCircle from '../components/TimerCircle'

const COLOR_CLASSES = ['ans-red','ans-blue','ans-yellow','ans-green']

export default function Game() {
  const navigate = useNavigate()
  const { activeQuestions, playerScore, playerId, addScore, showToast } = useStore()

  const qs = activeQuestions.length ? activeQuestions : DEMO_QUESTIONS

  const [qIdx,      setQIdx]      = useState(0)
  const [answered,  setAnswered]  = useState(false)
  const [chosen,    setChosen]    = useState(null)   // index chosen
  const [timeLeft,  setTimeLeft]  = useState(qs[0]?.timeLimit ?? 20)
  const [pts,       setPts]       = useState(0)
  const [phase,     setPhase]     = useState('question') // 'question' | 'result'

  const timerRef = useRef(null)
  const q        = qs[qIdx]

  // ── Start / restart timer ──────────────────────────────────────────────────
  const startTimer = useCallback((q) => {
    clearInterval(timerRef.current)
    const lim = q.timeLimit ?? 20
    setTimeLeft(lim)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleAnswer(null, q, lim) // timeout = wrong
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, []) // eslint-disable-line

  useEffect(() => {
    setAnswered(false)
    setChosen(null)
    setPts(0)
    setPhase('question')
    startTimer(q)
    return () => clearInterval(timerRef.current)
  }, [qIdx])

  // ── Pick answer ────────────────────────────────────────────────────────────
  function handleAnswer(idx, _q, _timeLeft) {
    if (answered) return
    clearInterval(timerRef.current)
    setAnswered(true)
    setChosen(idx)

    const question = _q ?? q
    const tl       = _timeLeft ?? timeLeft
    const lim      = question.timeLimit ?? 20
    const correct  = idx === question.correct

    if (correct) {
      const earned = Math.max(100, Math.floor(800 * (tl / lim)))
      setPts(earned)
      addScore(earned)
    }

    setTimeout(() => setPhase('result'), 600)
  }

  // ── Next question ──────────────────────────────────────────────────────────
  async function handleNext() {
    if (qIdx + 1 >= qs.length) {
      // Game over
      if (isConfigured && playerId) {
        const correct = Math.round(playerScore / 800)
        await updatePlayerScore(playerId, playerScore, correct).catch(() => {})
      }
      navigate('/leaderboard')
    } else {
      setQIdx(i => i + 1)
    }
  }

  const total    = qs.length
  const progress = ((qIdx + 1) / total) * 100
  const correct  = phase === 'result' ? q.correct : null

  // ── RESULT PHASE ──────────────────────────────────────────────────────────
  if (phase === 'result') {
    const wasCorrect = chosen === q.correct
    return (
      <div className="min-h-screen bg-[#46178F] flex flex-col items-center justify-center px-5 pb-10">
        <div className="w-full max-w-lg text-center animate-fadeUp">
          <div className="text-8xl leading-none animate-bounceIn">{wasCorrect ? '🎉' : '😔'}</div>
          <h2 className="font-montserrat font-black text-white text-4xl mt-4 mb-2">
            {wasCorrect ? 'Correct!' : 'Not quite…'}
          </h2>
          {q.verse && (
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 my-4 text-white/85 text-sm font-semibold italic leading-relaxed">
              "{q.verse}"
            </div>
          )}
          <div className="font-montserrat font-black text-5xl" style={{ color: '#FFA602', textShadow: '0 0 24px rgba(255,166,2,0.4)' }}>
            {wasCorrect ? `+${pts.toLocaleString()}` : '+0'}
            <span className="text-lg text-white/40 ml-1">pts</span>
          </div>
          <div className="text-white/50 text-sm font-bold mt-1">
            Total: {playerScore.toLocaleString()} pts
          </div>
          <button
            onClick={handleNext}
            className="mt-7 w-full max-w-xs mx-auto block py-4 bg-[#5B2BA6] hover:bg-[#8B60C8]
                       text-white font-montserrat font-black text-base uppercase rounded-xl
                       transition-colors shadow-lg"
          >
            {qIdx + 1 >= qs.length ? 'SEE LEADERBOARD 🏆' : 'NEXT QUESTION ›'}
          </button>
        </div>
      </div>
    )
  }

  // ── QUESTION PHASE ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#46178F] flex flex-col items-center pb-8 px-4">
      <div className="w-full max-w-3xl">

        {/* Progress bar */}
        <div className="flex items-center gap-4 py-3">
          <div className="flex-1">
            <div className="text-white/45 text-[10px] font-black uppercase tracking-wider mb-1.5">
              Question {qIdx + 1} of {total}
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#FFA602,#FF8C00)' }}
              />
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/40 text-[10px] font-black uppercase tracking-wider">Score</div>
            <div className="font-montserrat font-black text-[#FFA602] text-2xl leading-tight">
              {playerScore.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-3xl p-6 mb-4 relative shadow-xl text-center">
          <div className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2">
            Question {qIdx + 1}
          </div>
          <div className="font-montserrat font-black text-[#1A1A2E] text-2xl leading-tight">
            {q.q}
          </div>
          {q.ref && (
            <div className="inline-flex items-center gap-1.5 mt-3 bg-purple-50 border border-purple-200
                            rounded-full px-4 py-1 text-[#5B2BA6] text-sm font-bold italic">
              {q.ref}
            </div>
          )}
          {/* Timer — absolute top-right */}
          <div className="absolute -top-5 right-5">
            <TimerCircle timeLeft={timeLeft} total={q.timeLimit ?? 20} />
          </div>
        </div>

        {/* Answer grid */}
        <div className="grid grid-cols-2 gap-3">
          {q.opts.map((opt, i) => {
            const style = ANS_STYLES[i]
            let extra = ''
            if (answered) {
              if (i === q.correct)  extra = 'outline outline-[3px] outline-green-400 brightness-110'
              else if (i === chosen) extra = 'opacity-30 scale-95'
              else                   extra = 'opacity-50'
            }
            return (
              <button
                key={i}
                onClick={() => !answered && handleAnswer(i, q, timeLeft)}
                disabled={answered}
                className={`
                  ${COLOR_CLASSES[i]} ${extra}
                  rounded-2xl p-4 flex items-center gap-3 text-left
                  font-montserrat font-black text-white text-base
                  border-b-[5px] transition-all duration-200
                  shadow-lg
                  ${!answered ? 'hover:scale-[1.02] active:scale-95 cursor-pointer' : 'cursor-default'}
                `}
              >
                <div className="w-9 h-9 min-w-[36px] rounded-lg bg-black/20 flex items-center justify-center text-lg">
                  {style.icon}
                </div>
                <span className="leading-tight">{opt}</span>
                {answered && i === q.correct && (
                  <span className="ml-auto text-2xl animate-popIn">✅</span>
                )}
                {answered && i === chosen && i !== q.correct && (
                  <span className="ml-auto text-2xl animate-popIn">❌</span>
                )}
              </button>
            )
          })}
        </div>

      </div>
    </div>
  )
}
