import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isConfigured } from '../lib/supabase'
import { insertQuiz, insertQuestion, insertAnswers } from '../lib/queries'
import { useStore } from '../lib/store'
import { CATEGORIES, CAT_EMOJI } from '../lib/data'
import { KBtn } from '../components/UI'

const BLANK_Q = () => ({
  id:        Date.now() + Math.random(),
  body:      '',
  ref:       '',
  verse:     '',
  timeLimit: 20,
  opts:      ['', '', '', ''],
  correct:   -1,
})

const DOT_COLORS = ['#E21B3C', '#1368CE', '#FFA602', '#26890C']

export default function Create() {
  const navigate     = useNavigate()
  const { showToast } = useStore()

  const [title,    setTitle]    = useState('')
  const [category, setCategory] = useState('Gospel')
  const [desc,     setDesc]     = useState('')
  const [blocks,   setBlocks]   = useState([BLANK_Q()])
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  // ── Block helpers ────────────────────────────────────────
  function updateBlock(id, patch) {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b))
  }
  function updateOpt(id, optIdx, val) {
    setBlocks(prev => prev.map(b => {
      if (b.id !== id) return b
      const opts = [...b.opts]
      opts[optIdx] = val
      return { ...b, opts }
    }))
  }
  function removeBlock(id) {
    setBlocks(prev => prev.filter(b => b.id !== id))
  }

  // ── Validate ─────────────────────────────────────────────
  function validate() {
    if (!title.trim()) { showToast('⚠️ Enter a quiz title'); return false }
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i]
      if (!b.body.trim()) {
        showToast(`⚠️ Question ${i + 1}: enter the question text`)
        return false
      }
      if (b.opts.some(o => !o.trim())) {
        showToast(`⚠️ Question ${i + 1}: fill in all 4 answer options`)
        return false
      }
      if (b.correct < 0) {
        showToast(`⚠️ Question ${i + 1}: pick the correct answer (A/B/C/D)`)
        return false
      }
    }
    return true
  }

  // ── Save ─────────────────────────────────────────────────
  async function save() {
    if (!validate()) return
    setSaving(true)
    try {
      if (isConfigured) {
        // Insert quiz row
        const quiz = await insertQuiz({ title: title.trim(), category, description: desc.trim() })
        if (!quiz || !quiz.id) throw new Error('Quiz insert returned no ID')

        // Insert questions + answers one by one
        for (let i = 0; i < blocks.length; i++) {
          const b = blocks[i]
          const q = await insertQuestion(quiz.id, {
            body:      b.body.trim(),
            reference: b.ref.trim(),
            verseText: b.verse.trim(),
            timeLimit: Number(b.timeLimit) || 20,
            position:  i + 1,
          })
          if (!q || !q.id) throw new Error(`Question ${i + 1} insert returned no ID`)
          await insertAnswers(q.id, b.opts.map(o => o.trim()), b.correct)
        }
        showToast(`✅ "${title}" saved! ${blocks.length} question${blocks.length > 1 ? 's' : ''}`)
      } else {
        // Demo mode — just simulate
        await new Promise(r => setTimeout(r, 700))
        showToast(`✅ "${title}" saved in demo mode!`)
      }

      setSaved(true)
      // Navigate after a short delay so toast is visible
      setTimeout(() => navigate('/host'), 1200)

    } catch (e) {
      console.error('Save error:', e)
      showToast('❌ Save failed: ' + (e.message || 'Unknown error').slice(0, 60))
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <div className="min-h-screen bg-[#46178F] flex items-center justify-center">
        <div className="text-center animate-bounceIn">
          <div className="text-8xl mb-4">✅</div>
          <h2 className="font-montserrat font-black text-white text-3xl mb-2">Quiz Saved!</h2>
          <p className="text-white/60 font-semibold">Taking you to your quizzes…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#46178F] flex flex-col items-center pb-14">
      <div className="w-full max-w-2xl px-5 pt-8 animate-fadeUp">

        <h2 className="font-montserrat font-black text-white text-3xl mb-1">✏️ Create a Bible Quiz</h2>
        <p className="text-white/45 text-sm font-semibold mb-6">
          Build your quiz — saved to your Supabase database
        </p>

        {/* ── Quiz Details ── */}
        <div className="bg-white rounded-3xl p-6 mb-4 shadow-md">
          <h3 className="font-montserrat font-black text-[#46178F] text-lg mb-4">📘 Quiz Details</h3>
          <div className="grid grid-cols-2 gap-3">

            <div className="col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                Quiz Title *
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. The Life of David"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 font-nunito font-bold
                           text-[#1A1A2E] text-sm outline-none focus:border-[#5B2BA6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 font-nunito font-bold
                           text-[#1A1A2E] text-sm outline-none focus:border-[#5B2BA6] transition-colors"
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                Default Time
              </label>
              <select
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 font-nunito font-bold
                           text-[#1A1A2E] text-sm outline-none focus:border-[#5B2BA6] transition-colors"
              >
                {[10, 15, 20, 30, 45, 60].map(t => (
                  <option key={t}>{t} sec</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                Description (optional)
              </label>
              <input
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Brief description…"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 font-nunito font-bold
                           text-[#1A1A2E] text-sm outline-none focus:border-[#5B2BA6] transition-colors"
              />
            </div>

          </div>
        </div>

        {/* ── Questions ── */}
        <div className="bg-white rounded-3xl p-6 mb-4 shadow-md">
          <h3 className="font-montserrat font-black text-[#46178F] text-lg mb-4">❓ Questions</h3>
          <div className="flex flex-col gap-4">
            {blocks.map((b, idx) => (
              <QuestionBlock
                key={b.id}
                block={b}
                num={idx + 1}
                total={blocks.length}
                onChange={patch => updateBlock(b.id, patch)}
                onOptChange={(oi, v) => updateOpt(b.id, oi, v)}
                onRemove={() => removeBlock(b.id)}
              />
            ))}
          </div>
          <button
            onClick={() => setBlocks(prev => [...prev, BLANK_Q()])}
            className="w-full mt-4 py-3.5 border-2 border-dashed border-purple-200 rounded-2xl
                       text-[#5B2BA6] font-montserrat font-black text-sm
                       hover:border-[#5B2BA6] hover:bg-purple-50 transition-all"
          >
            ✚ Add Another Question
          </button>
        </div>

        {/* ── Save bar ── */}
        <div className="flex gap-3">
          <KBtn onClick={save} disabled={saving} className="flex-1">
            {saving ? '⏳ Saving to Supabase…' : '💾 SAVE TO SUPABASE'}
          </KBtn>
          <button
            onClick={() => navigate('/host')}
            className="px-6 py-4 bg-white rounded-xl text-[#5B2BA6] font-bold text-sm
                       hover:bg-gray-50 transition-colors shadow"
          >
            ← Back
          </button>
        </div>

      </div>
    </div>
  )
}

// ── Question Block Component ─────────────────────────────────────────────────
function QuestionBlock({ block, num, total, onChange, onOptChange, onRemove }) {
  return (
    <div className="bg-purple-50 border-2 border-purple-100 rounded-2xl p-4">

      <div className="flex items-center justify-between mb-3">
        <span className="font-montserrat font-black text-[#46178F] text-sm">
          Question {num}
        </span>
        {total > 1 && (
          <button
            onClick={onRemove}
            className="bg-red-100 text-red-500 text-xs font-black px-3 py-1 rounded-lg
                       hover:bg-red-200 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      {/* Question text */}
      <div className="mb-3">
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
          Question *
        </label>
        <textarea
          value={block.body}
          onChange={e => onChange({ body: e.target.value })}
          placeholder="Type your Bible question here…"
          rows={2}
          className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 font-nunito font-bold
                     text-[#1A1A2E] text-sm outline-none focus:border-[#5B2BA6] transition-colors resize-none"
        />
      </div>

      {/* Reference + time */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            Bible Reference
          </label>
          <input
            value={block.ref}
            onChange={e => onChange({ ref: e.target.value })}
            placeholder="e.g. John 3:16"
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 font-nunito font-bold
                       text-[#1A1A2E] text-sm outline-none focus:border-[#5B2BA6] transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            Time Limit
          </label>
          <select
            value={block.timeLimit}
            onChange={e => onChange({ timeLimit: parseInt(e.target.value) })}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 font-nunito font-bold
                       text-[#1A1A2E] text-sm outline-none focus:border-[#5B2BA6] transition-colors"
          >
            {[10, 15, 20, 30, 45, 60].map(t => (
              <option key={t} value={t}>{t} sec</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            Verse Text (shown after answer)
          </label>
          <input
            value={block.verse}
            onChange={e => onChange({ verse: e.target.value })}
            placeholder="e.g. For God so loved the world… — John 3:16"
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 font-nunito font-bold
                       text-[#1A1A2E] text-sm outline-none focus:border-[#5B2BA6] transition-colors"
          />
        </div>
      </div>

      {/* Answer options */}
      <div className="mb-3">
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
          Answer Options * (fill all 4)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {block.opts.map((opt, oi) => (
            <div key={oi} className="relative">
              <div
                className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full pointer-events-none"
                style={{ background: DOT_COLORS[oi] }}
              />
              <input
                value={opt}
                onChange={e => onOptChange(oi, e.target.value)}
                placeholder={`Option ${['A', 'B', 'C', 'D'][oi]}`}
                className="w-full border-2 border-gray-200 rounded-xl pl-8 pr-3 py-2 font-nunito
                           font-bold text-[#1A1A2E] text-sm outline-none focus:border-[#5B2BA6] transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Correct answer */}
      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
          Correct Answer *
        </label>
        <div className="flex gap-2">
          {['A', 'B', 'C', 'D'].map((ltr, i) => (
            <button
              key={ltr}
              type="button"
              onClick={() => onChange({ correct: i })}
              className={`px-4 py-1.5 rounded-full border-2 font-black text-sm transition-all
                ${block.correct === i
                  ? 'bg-[#26890C] border-[#26890C] text-white'
                  : 'bg-white border-gray-200 text-gray-400 hover:border-[#5B2BA6]'
                }`}
            >
              {ltr}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
