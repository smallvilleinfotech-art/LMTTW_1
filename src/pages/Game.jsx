import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { updatePlayerScore } from '../lib/queries'
import { isConfigured } from '../lib/supabase'
import { DEMO_QUESTIONS, ANS_STYLES } from '../lib/data'
import TimerCircle from '../components/TimerCircle'

const COLOR_CLASSES = ['ans-red', 'ans-blue', 'ans-yellow', 'ans-green']

export default function Game() {
  const navigate = useNavigate()
  const { activeQuestions, playerScore, playerId, addScore, showToast } = useStore()

  // Always fall back to demo if no questions loaded
  const qs = Array.isArray(activeQuestions) && activeQuestions.length > 0
    ? activeQuestions
    : DEMO_QUESTIONS

  const [qIdx,     setQIdx]     = useState(0)
  const [answered, setAnswered] = useState(false)
  const [chosen,   setChosen]   = useState(null)
  const [timeLeft, setTimeLeft] = useState(20)
  const [pts,      setPts]      = useState(0)
  const [phase,    setPhase]    = useState('question') // 'question' | 'result'

  const timerRef    = useRef(null)
  const answeredRef = useRef(false)   // ref so interval callback always sees latest value

  const q   = qs[qIdx] || qs[0]
  const lim = q?.timeLimit ?? 20

  // ── Mount / question change ──────────────────────────────
  useEffect(() => {
    answeredRef.current = false
    setAnswered(false)
    setChosen(null)
    setPts(0)
    setPhase('question')
    setTimeLeft(lim)

    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          if (!answeredRef.current) {
            answeredRef.current = true
            setAnswered(true)
            setChosen(null)
            setTimeout(() => setPhase('result'), 400)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [qIdx])

  // ── Pick answer ──────────────────────────────────────────
  function handleAnswer(idx) {
    if (answeredRef.current) return
    answeredRef.current = true
    clearInterval(timerRef.current)
    setAnswered(true)
    setChosen(idx)

    const correct = idx === q.correct
    if (correct) {
      const earned = Math.max(100, Math.floor(800 * (timeLeft / lim)))
      setPts(earned)
      addScore(earned)
    }
    setTimeout(() => setPhase('result'), 500)
  }

  // ── Next question / end game ─────────────────────────────
  async function handleNext() {
    if (qIdx + 1 >= qs.length) {
      // Save final score to Supabase
      if (isConfigured && playerId) {
        try {
          const correct = Math.round(playerScore / 800)
          await updatePlayerScore(playerId, playerScore, correct)
        } catch(e) { console.warn('Score save failed:', e) }
      }
      navigate('/leaderboard')
    } else {
      setQIdx(i => i + 1)
    }
  }

  const total    = qs.length
  const progress = ((qIdx + 1) / total) * 100

  // ── RESULT PHASE ─────────────────────────────────────────
  if (phase === 'result') {
    const wasCorrect = chosen === q.correct
    return (
      <div className="min-h-screen bg-[#46178F] flex flex-col items-center justify-center px-5 pb-10">
        <div className="w-full max-w-lg text-center animate-fadeUp">

          <div className="text-8xl leading-none animate-bounceIn">
            {wasCorrect ? '🎉' : '😔'}
          </div>

          <h2 className="font-montserrat font-black text-white text-4xl mt-4 mb-2">
            {wasCorrect ? 'Correct!' : 'Not quite…'}
          </h2>

          {/* Show correct answer if wrong */}
          {!wasCorrect && (
            <div className="bg-green-900/30 border border-green-500/40 rounded-2xl px-5 py-3 mb-4 text-green-300 font-bold text-sm">
              ✅ Correct answer: <span className="text-white font-black">{q.opts[q.correct]}</span>
            </div>
          )}

          {/* Verse */}
          {q.verse ? (
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 my-4
                            text-white/85 text-sm font-semibold italic leading-relaxed">
              "{q.verse}"
            </div>
          ) : null}

          {/* Points */}
          <div
            className="font-montserrat font-black text-5xl"
            style={{ color: '#FFA602', textShadow: '0 0 24px rgba(255,166,2,0.4)' }}
          >
            {wasCorrect ? `+${pts.toLocaleString()}` : '+0'}
            <span className="text-lg text-white/40 ml-1 font-nunito">pts</span>
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
            {qIdx + 1 >= qs.length ? '🏆 SEE LEADERBOARD' : 'NEXT QUESTION ›'}
          </button>

        </div>
      </div>
    )
  }

  // ── QUESTION PHASE ────────────────────────────────────────
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
          {q.ref ? (
            <div className="inline-flex items-center gap-1.5 mt-3 bg-purple-50 border border-purple-200
                            rounded-full px-4 py-1 text-[#5B2BA6] text-sm font-bold italic">
              {q.ref}
            </div>
          ) : null}
          {/* Timer */}
          <div className="absolute -top-5 right-5">
            <TimerCircle timeLeft={timeLeft} total={lim} />
          </div>
        </div>

        {/* Answer buttons */}
        <div className="grid grid-cols-2 gap-3">
          {q.opts.map((opt, i) => {
            const style = ANS_STYLES[i]
            let extra = ''
            if (answered) {
              if (i === q.correct)   extra = 'outline outline-[3px] outline-green-400 brightness-110'
              else if (i === chosen) extra = 'opacity-30 scale-95'
              else                   extra = 'opacity-50'
            }
            return (
              <button
                key={i}
                onClick={() => !answered && handleAnswer(i)}
                disabled={answered}
                className={`
                  ${COLOR_CLASSES[i]} ${extra}
                  rounded-2xl p-4 flex items-center gap-3 text-left
                  font-montserrat font-black text-white text-base
                  border-b-[5px] transition-all duration-200 shadow-lg
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
