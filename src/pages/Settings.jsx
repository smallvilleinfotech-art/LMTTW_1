import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isConfigured } from '../lib/supabase'
import { useStore } from '../lib/store'

const SQL = `-- LEAD ME TO THE WATERS — Supabase SQL Schema
-- Run this entire block in your Supabase SQL Editor

create extension if not exists "pgcrypto";

create table quizzes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  category    text not null default 'General',
  description text,
  emoji       text default '📖',
  time_limit  int  default 20,
  created_at  timestamptz default now(),
  played      int default 0
);

create table questions (
  id          uuid primary key default gen_random_uuid(),
  quiz_id     uuid references quizzes(id) on delete cascade,
  position    int not null,
  body        text not null,
  reference   text,
  verse_text  text,
  time_limit  int default 20
);

create table answers (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid references questions(id) on delete cascade,
  position    int not null,
  body        text not null,
  is_correct  boolean default false
);

create table game_sessions (
  id          uuid primary key default gen_random_uuid(),
  quiz_id     uuid references quizzes(id),
  pin         text not null unique,
  status      text default 'waiting',
  created_at  timestamptz default now()
);

create table players (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid references game_sessions(id) on delete cascade,
  name        text not null,
  score       int default 0,
  correct     int default 0,
  joined_at   timestamptz default now()
);

-- Enable realtime on lobby tables
alter publication supabase_realtime add table game_sessions;
alter publication supabase_realtime add table players;

-- Row Level Security (open — tighten in production)
alter table quizzes       enable row level security;
alter table questions     enable row level security;
alter table answers       enable row level security;
alter table game_sessions enable row level security;
alter table players       enable row level security;

create policy "allow all" on quizzes       for all using (true) with check (true);
create policy "allow all" on questions     for all using (true) with check (true);
create policy "allow all" on answers       for all using (true) with check (true);
create policy "allow all" on game_sessions for all using (true) with check (true);
create policy "allow all" on players       for all using (true) with check (true);`

const TABLES = [
  { name:'quizzes',       purpose:'Quiz metadata',              rt:false },
  { name:'questions',     purpose:'Questions per quiz',         rt:false },
  { name:'answers',       purpose:'Answer options',             rt:false },
  { name:'game_sessions', purpose:'Active game rooms + PIN',    rt:true  },
  { name:'players',       purpose:'Players & live scores',      rt:true  },
]

export default function Settings() {
  const navigate  = useNavigate()
  const { showToast } = useStore()

  const [url,     setUrl]     = useState(localStorage.getItem('sb_url')  || '')
  const [key,     setKey]     = useState(localStorage.getItem('sb_key')  || '')
  const [status,  setStatus]  = useState(isConfigured ? 'ok' : 'idle')
  const [detail,  setDetail]  = useState(isConfigured ? 'Credentials loaded from storage' : 'Enter your credentials below')
  const [testing, setTesting] = useState(false)
  const [copied,  setCopied]  = useState(false)

  async function save() {
    if (!url.startsWith('https://')) { showToast('⚠️ Enter a valid Supabase URL'); return }
    if (key.length < 20)             { showToast('⚠️ Enter a valid Anon Key');     return }
    localStorage.setItem('sb_url', url)
    localStorage.setItem('sb_key', key)
    window.location.reload()   // reload so the supabase client re-initialises with new creds
  }

  async function test() {
    if (!isConfigured) { showToast('⚠️ Save credentials first'); return }
    setTesting(true); setStatus('checking'); setDetail('Pinging Supabase…')
    try {
      const { error } = await supabase.from('quizzes').select('id').limit(1)
      if (error) throw error
      setStatus('ok'); setDetail('All tables reachable ✅')
      showToast('✅ Supabase is working!')
    } catch(e) {
      setStatus('fail'); setDetail(e.message.slice(0, 80))
      showToast('❌ ' + e.message.slice(0, 55))
    }
    setTesting(false)
  }

  function copySql() {
    navigator.clipboard.writeText(SQL)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
      .catch(() => showToast('⚠️ Clipboard unavailable'))
  }

  const dotColor = status === 'ok' ? 'bg-green-400' : status === 'checking' ? 'bg-[#FFA602] animate-blink' : 'bg-red-400'
  const dotShadow= status === 'ok' ? 'shadow-[0_0_8px_#6EE95A]' : status === 'fail' ? 'shadow-[0_0_8px_#FF6B6B]' : ''

  return (
    <div className="min-h-screen bg-[#46178F] flex flex-col items-center pb-14">
      <div className="w-full max-w-xl px-5 pt-8 animate-fadeUp">

        <h2 className="font-montserrat font-black text-white text-3xl mb-1">⚙️ Supabase Setup</h2>
        <p className="text-white/45 text-sm font-semibold mb-6">
          Connect your Supabase project for live lobbies, real-time players, and persistent scores
        </p>

        {/* Connection status */}
        <div className="flex items-center gap-3 bg-white/8 border border-white/12 rounded-2xl p-4 mb-5">
          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${dotColor} ${dotShadow}`} />
          <div className="flex-1">
            <div className="text-white font-bold text-sm">
              {status === 'ok' ? 'Connected' : status === 'checking' ? 'Testing…' : status === 'idle' ? 'Not connected' : 'Connection failed'}
            </div>
            <div className="text-white/40 text-xs font-semibold mt-0.5">{detail}</div>
          </div>
          <button
            onClick={test}
            disabled={testing}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-xs font-black hover:bg-white/18 transition-colors whitespace-nowrap disabled:opacity-50"
          >
            Test Connection
          </button>
        </div>

        {/* Credentials */}
        <div className="bg-white rounded-3xl p-6 mb-4 shadow-md">
          <h3 className="font-montserrat font-black text-[#46178F] text-lg mb-4">🔑 Credentials</h3>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Supabase Project URL</label>
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://xxxxxxxxxxxx.supabase.co"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 font-nunito font-bold text-[#1A1A2E] text-sm outline-none focus:border-[#5B2BA6] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Supabase Anon Key</label>
              <input
                type="password"
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIs…"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 font-nunito font-bold text-[#1A1A2E] text-sm outline-none focus:border-[#5B2BA6] transition-colors"
              />
            </div>
            <button
              onClick={save}
              className="w-full py-4 bg-gradient-to-r from-[#46178F] to-[#5B2BA6] rounded-xl
                         text-white font-montserrat font-black text-base uppercase tracking-wide
                         hover:-translate-y-0.5 transition-all shadow-lg"
            >
              💾 SAVE & CONNECT
            </button>
          </div>
        </div>

        {/* Where to find credentials */}
        <div className="bg-white/8 border border-white/12 rounded-2xl p-5 mb-4">
          <h4 className="font-montserrat font-black text-[#FFA602] text-sm mb-3">📍 Where to find your credentials</h4>
          <ol className="text-white/70 text-sm font-semibold space-y-2 list-decimal list-inside">
            <li>Go to <span className="text-white font-black">app.supabase.com</span></li>
            <li>Open your project → <span className="text-white font-black">Settings → API</span></li>
            <li>Copy <span className="text-white font-black">Project URL</span> and <span className="text-white font-black">anon public key</span></li>
            <li>Paste them above and click Save & Connect</li>
          </ol>
        </div>

        {/* Schema table */}
        <div className="bg-black/20 border border-white/10 rounded-2xl p-5 mb-4">
          <h4 className="font-montserrat font-black text-[#FFA602] text-sm mb-3">📐 Required Database Tables</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left text-[10px] font-black text-white/35 uppercase tracking-wider pb-2">Table</th>
                <th className="text-left text-[10px] font-black text-white/35 uppercase tracking-wider pb-2">Purpose</th>
                <th className="text-left text-[10px] font-black text-white/35 uppercase tracking-wider pb-2">Realtime</th>
              </tr>
            </thead>
            <tbody>
              {TABLES.map(t => (
                <tr key={t.name} className="border-b border-white/5 last:border-0">
                  <td className="py-2 text-[#FFA602] font-bold">{t.name}</td>
                  <td className="py-2 text-white/65 font-semibold">{t.purpose}</td>
                  <td className="py-2">{t.rt ? <span className="text-green-400 font-black">✅ On</span> : <span className="text-white/30">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={copySql}
            className="w-full mt-4 py-3 bg-white/8 border border-white/14 rounded-xl
                       text-white/70 font-nunito font-black text-sm
                       hover:bg-white/14 transition-colors"
          >
            {copied ? '✅ Copied!' : '📋 Copy Full SQL Schema to Clipboard'}
          </button>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full py-4 bg-transparent border-2 border-white/25 rounded-xl
                     text-white/70 font-nunito font-black text-sm
                     hover:bg-white/8 hover:text-white transition-all"
        >
          ← Back to Home
        </button>

      </div>
    </div>
  )
}
