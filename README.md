# ✝️ Lead Me to the Waters — Bible Quiz App

A full Kahoot-style live Bible quiz platform built with **React + Vite + Supabase**.  
Host games, share a PIN, participants join on any device, scores update live.

---
 
## 📦 What's in this repo

```
lead-me-to-the-waters/
├── src/
│   ├── assets/
│   │   └── logo.png            ← DROP YOUR LOGO HERE (rename to logo.png)
│   ├── components/
│   │   ├── UI.jsx              ← KBtn, KInput, Modal, Toast, LiveBadge…
│   │   ├── Topbar.jsx          ← Navigation bar
│   │   ├── TimerCircle.jsx     ← SVG countdown ring
│   │   └── Podium.jsx          ← Gold / Silver / Bronze podium
│   ├── lib/
│   │   ├── supabase.js         ← Supabase client (reads .env)
│   │   ├── queries.js          ← All DB functions (fetch, insert, realtime)
│   │   ├── store.js            ← Zustand global state
│   │   └── data.js             ← Demo data + colour constants
│   ├── pages/
│   │   ├── Home.jsx            ← Join screen + community stats
│   │   ├── Host.jsx            ← Dashboard + live lobby
│   │   ├── Game.jsx            ← In-game questions + timer + scoring
│   │   ├── Leaderboard.jsx     ← Podium + ranked list
│   │   ├── Create.jsx          ← Build & save a quiz
│   │   └── Settings.jsx        ← Supabase config + SQL copy tool
│   ├── App.jsx                 ← React Router routes
│   ├── main.jsx                ← Entry point
│   └── index.css               ← Tailwind + Kahoot colour system
├── .env.example                ← Copy → .env and fill in Supabase creds
├── .gitignore                  ← node_modules + .env excluded
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🗄️ STEP 1 — Set up Supabase (backend)

### 1.1 Create a free Supabase project
1. Go to **https://app.supabase.com**
2. Click **New project**
3. Give it a name (e.g. `lead-me-to-the-waters`), pick a region, set a DB password
4. Wait ~2 minutes for it to provision

### 1.2 Run the database schema
1. In your Supabase dashboard → **SQL Editor** → **New query**
2. Paste the entire block below and click **Run**

```sql
-- ════════════════════════════════════════════
--  LEAD ME TO THE WATERS — Full DB Schema
-- ════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- Quizzes
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

-- Questions
create table questions (
  id          uuid primary key default gen_random_uuid(),
  quiz_id     uuid references quizzes(id) on delete cascade,
  position    int  not null,
  body        text not null,
  reference   text,
  verse_text  text,
  time_limit  int  default 20
);

-- Answer options
create table answers (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid references questions(id) on delete cascade,
  position    int     not null,
  body        text    not null,
  is_correct  boolean default false
);

-- Live game rooms
create table game_sessions (
  id         uuid primary key default gen_random_uuid(),
  quiz_id    uuid references quizzes(id),
  pin        text not null unique,
  status     text default 'waiting',   -- waiting | active | finished
  created_at timestamptz default now()
);

-- Players per session
create table players (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid references game_sessions(id) on delete cascade,
  name       text not null,
  score      int  default 0,
  correct    int  default 0,
  joined_at  timestamptz default now()
);

-- Enable realtime on lobby tables
alter publication supabase_realtime add table game_sessions;
alter publication supabase_realtime add table players;

-- Row Level Security (open for community use — tighten later with auth)
alter table quizzes       enable row level security;
alter table questions     enable row level security;
alter table answers       enable row level security;
alter table game_sessions enable row level security;
alter table players       enable row level security;

create policy "allow all" on quizzes       for all using (true) with check (true);
create policy "allow all" on questions     for all using (true) with check (true);
create policy "allow all" on answers       for all using (true) with check (true);
create policy "allow all" on game_sessions for all using (true) with check (true);
create policy "allow all" on players       for all using (true) with check (true);
```

### 1.3 Copy your credentials
In Supabase → **Settings → API**:

| Field | Where to find it |
|---|---|
| Project URL | "Project URL" box |
| Anon Key | "Project API keys → anon public" |

Keep these — you'll need them in Step 3.

---

## 💻 STEP 2 — Push to GitHub

### 2.1 Create the repo on GitHub
1. Go to **https://github.com/new**
2. Name it `lead-me-to-the-waters`
3. Set to **Public** or **Private** (your choice)
4. **Do NOT** tick "Add a README" (you already have one)
5. Click **Create repository**

### 2.2 Push your code
Open a terminal in the project folder and run:

```bash
# 1. Initialise git
git init

# 2. Stage all files
git add .

# 3. First commit
git commit -m "🎉 Initial commit — Lead Me to the Waters Bible Quiz App"

# 4. Point to your GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/lead-me-to-the-waters.git

# 5. Push
git branch -M main
git push -u origin main
```

Your code is now on GitHub. ✅

---

## ⚙️ STEP 3 — Add Supabase secrets to GitHub

This lets GitHub Actions (CI) and any future deployment know your credentials **without committing them to code**.

1. On GitHub → your repo → **Settings → Secrets and variables → Actions**
2. Click **New repository secret** for each:

| Secret name | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public key |

---

## 🏃 STEP 4 — Run locally

```bash
# Copy the env template
cp .env.example .env

# Open .env and fill in your two Supabase values
# VITE_SUPABASE_URL=https://xxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Install dependencies
npm install

# Drop your logo image into:
#   src/assets/logo.png

# Start dev server
npm run dev
```

Open **http://localhost:5173** — the app is running! 🎉

---

## 🌐 STEP 5 — Deploy for free (GitHub Pages)

The repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:
- Triggers on every push to `main`
- Builds the React app with your Supabase secrets injected
- Publishes to **GitHub Pages** automatically

### One-time GitHub Pages setup
1. GitHub repo → **Settings → Pages**
2. Under **Build and deployment** → Source → select **GitHub Actions**
3. Click **Save**

That's it. On the next push to `main`, GitHub Actions builds and deploys.  
Your app will be live at:
```
https://YOUR_USERNAME.github.io/lead-me-to-the-waters/
```

> **Note:** The workflow file is already in this repo at `.github/workflows/deploy.yml`

---

## 🔄 Day-to-day workflow

```bash
# Make changes to the code…

# Save and push — GitHub Actions auto-deploys
git add .
git commit -m "✨ Add new quiz category"
git push
```

That's the full loop. Every push to `main` = new live version in ~2 minutes.

---

## 🎮 How to use the app

### Host a game
1. Open the app → **📋 Host**
2. Click **🚀 Launch** on any quiz
3. A **6-digit PIN** appears on screen
4. Share the PIN with your group (project it, send on WhatsApp, etc.)
5. Watch players join live
6. Click **Start Game** when everyone is in

### Join a game (participants)
1. Open the app URL on any phone or laptop
2. Enter the **PIN** + your name → **JOIN NOW**
3. Answer questions — faster answers = more points!
4. See the live leaderboard at the end

### Create a quiz
1. Go to **✏️ Create**
2. Add title, category, questions, 4 answer options per question
3. Mark the correct answer
4. Click **💾 Save to Supabase** — instantly available for hosting

---

## 🎨 Colour System

| Name | Hex | Used for |
|---|---|---|
| Purple Deep | `#46178F` | App background |
| Purple Mid | `#5B2BA6` | Primary buttons, nav |
| Yellow | `#FFA602` | Accents, scores, Answer C |
| Red | `#E21B3C` | Answer A |
| Blue | `#1368CE` | Answer B |
| Green | `#26890C` | Answer D, correct highlight |

---

## 🛠 Tech Stack

| Layer | Tool |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS |
| State | Zustand |
| Database | Supabase (PostgreSQL) |
| Realtime | Supabase Realtime channels |
| CI/CD | GitHub Actions |
| Hosting | GitHub Pages (free) |

---

Made with ❤️ for the **Lead Me to the Waters** Bible Community 🕊️
