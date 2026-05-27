import { create } from 'zustand'

export const useStore = create((set, get) => ({
  // ── Player / join state ──────────────────────────────────
  playerName:    '',
  playerId:      null,
  sessionId:     null,
  quizId:        null,
  playerScore:   0,

  setPlayer:   (name, id) => set({ playerName: name, playerId: id }),
  setSession:  (sid, qid) => set({ sessionId: sid, quizId: qid }),
  addScore:    (pts)      => set(s => ({ playerScore: s.playerScore + pts })),
  resetPlayer: ()         => set({ playerName:'', playerId:null, sessionId:null, quizId:null, playerScore:0 }),

  // ── Active game questions ────────────────────────────────
  activeQuestions: [],
  setQuestions: (qs) => set({ activeQuestions: Array.isArray(qs) ? qs : [] }),

  // ── Toast ─────────────────────────────────────────────────
  toastMsg:     '',
  toastVisible: false,
  showToast: (msg) => {
    set({ toastMsg: String(msg), toastVisible: true })
    setTimeout(() => set({ toastVisible: false }), 3200)
  },
}))
