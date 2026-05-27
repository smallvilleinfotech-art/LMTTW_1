import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isConfigured } from '../lib/supabase'
import { fetchLeaderboard } from '../lib/queries'
import { useStore } from '../lib/store'
import { DEMO_LEADERBOARD, randomEmoji } from '../lib/data'
import Podium from '../components/Podium'
import { KBtn } from '../components/UI'

export default function Leaderboard() {
  const navigate = useNavigate()
  const { sessionId, playerName, playerScore } = useStore()
  const [rows, setRows] = useState([])

  useEffect(() => {
    async function load() {
      let data = []
      if (isConfigured && sessionId) {
        try {
          data = (await fetchLeaderboard(sessionId)).map(p => ({ ...p, emoji: randomEmoji() }))
        } catch(e) { console.warn(e) }
      }
      if (!data.length) {
        data = [...DEMO_LEADERBOARD]
        if (playerScore > 0) {
          data.unshift({ name: playerName || 'You 🌟', score: playerScore, correct: Math.round(playerScore / 800), emoji: '⭐' })
          data.sort((a, b) => b.score - a.score)
        }
      }
      setRows(data)
    }
    load()
  }, [])

  const top  = rows.slice(0, 3)
  const rest = rows.slice(3, 8)

  return (
    <div className="min-h-screen bg-[#46178F] flex flex-col items-center pb-12">
      <div className="w-full max-w-lg px-5 pt-8 animate-fadeUp">

        <h2 className="font-montserrat font-black text-white text-4xl text-center mb-1">🏆 Leaderboard</h2>
        <p className="text-white/50 text-sm font-semibold text-center mb-7">Top Bible scholars 🕊️</p>

        {/* Podium */}
        {top.length >= 1 && <Podium rows={top} />}

        {/* Rows 4-8 */}
        <div className="flex flex-col gap-2 mb-7">
          {rest.map((p, i) => (
            <div
              key={i}
              className="bg-white/8 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 animate-slideInLeft"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="font-montserrat font-black text-white/35 text-lg w-6">{i + 4}</div>
              <div className="w-10 h-10 rounded-full bg-[#5B2BA6] border-2 border-white/15 flex items-center justify-center text-xl">
                {p.emoji}
              </div>
              <div className="flex-1">
                <div className="font-black text-white text-sm font-nunito">{p.name}</div>
                <div className="text-white/38 text-xs font-bold">{p.correct} correct answers</div>
              </div>
              <div className="font-montserrat font-black text-[#FFA602] text-xl">{p.score.toLocaleString()}</div>
            </div>
          ))}
        </div>

        <KBtn onClick={() => navigate('/')} variant="ghost">🏠 BACK TO HOME</KBtn>
      </div>
    </div>
  )
}
