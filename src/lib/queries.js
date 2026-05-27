import { supabase } from './supabase'
import { CAT_EMOJI } from './data'

// ── Quizzes ──────────────────────────────────────────────────────────────────
export async function fetchQuizzes() {
  const { data, error } = await supabase
    .from('quizzes')
    .select('id, title, category, emoji, played, created_at, questions(count)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(q => ({
    ...q,
    questionCount: q.questions?.[0]?.count ?? 0,
  }))
}

export async function deleteQuiz(id) {
  const { error } = await supabase.from('quizzes').delete().eq('id', id)
  if (error) throw error
}

export async function insertQuiz({ title, category, description }) {
  const { data, error } = await supabase
    .from('quizzes')
    .insert({ title, category, description, emoji: CAT_EMOJI[category] || '📖' })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Questions + Answers ──────────────────────────────────────────────────────
export async function insertQuestion(quizId, { body, reference, verseText, timeLimit, position }) {
  const { data, error } = await supabase
    .from('questions')
    .insert({ quiz_id: quizId, body, reference, verse_text: verseText, time_limit: timeLimit, position })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function insertAnswers(questionId, answers, correctIndex) {
  const rows = answers.map((body, idx) => ({
    question_id: questionId,
    body,
    is_correct: idx === correctIndex,
    position: idx,
  }))
  const { error } = await supabase.from('answers').insert(rows)
  if (error) throw error
}

export async function fetchQuestionsForQuiz(quizId) {
  const { data, error } = await supabase
    .from('questions')
    .select('id, body, reference, verse_text, position, time_limit, answers(id, body, is_correct, position)')
    .eq('quiz_id', quizId)
    .order('position')
  if (error) throw error
  return data.map(q => {
    const sorted = [...(q.answers || [])].sort((a, b) => a.position - b.position)
    return {
      q:         q.body,
      ref:       q.reference || '',
      verse:     q.verse_text || '',
      opts:      sorted.map(a => a.body),
      correct:   sorted.findIndex(a => a.is_correct),
      timeLimit: q.time_limit || 20,
    }
  })
}

// ── Game Sessions ────────────────────────────────────────────────────────────
export async function createSession(quizId, pin) {
  const { data, error } = await supabase
    .from('game_sessions')
    .insert({ quiz_id: quizId, pin, status: 'waiting' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSessionStatus(sessionId, status) {
  const { error } = await supabase
    .from('game_sessions')
    .update({ status })
    .eq('id', sessionId)
  if (error) throw error
}

export async function findSessionByPin(pin) {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('id, quiz_id, status')
    .eq('pin', pin)
    .single()
  if (error) throw error
  return data
}

// ── Players ──────────────────────────────────────────────────────────────────
export async function joinSession(sessionId, name) {
  const { data, error } = await supabase
    .from('players')
    .insert({ session_id: sessionId, name, score: 0, correct: 0 })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePlayerScore(playerId, score, correct) {
  const { error } = await supabase
    .from('players')
    .update({ score, correct })
    .eq('id', playerId)
  if (error) throw error
}

export async function fetchLeaderboard(sessionId) {
  const { data, error } = await supabase
    .from('players')
    .select('name, score, correct')
    .eq('session_id', sessionId)
    .order('score', { ascending: false })
    .limit(10)
  if (error) throw error
  return data
}

// ── Stats ────────────────────────────────────────────────────────────────────
export async function fetchStats() {
  const [{ count: qc }, { count: pc }, { count: gc }] = await Promise.all([
    supabase.from('quizzes').select('*', { count:'exact', head:true }),
    supabase.from('players').select('*', { count:'exact', head:true }),
    supabase.from('game_sessions').select('*', { count:'exact', head:true }),
  ])
  return { quizzes: qc ?? 0, players: pc ?? 0, games: gc ?? 0 }
}
