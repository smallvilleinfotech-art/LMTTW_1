export const DEMO_QUIZZES = [
  { id:'d1', title:'The Life of Jesus',   category:'Gospel',           questions:10, played:48, emoji:'✝️',  bg:'#46178F' },
  { id:'d2', title:'Psalms & Praise',     category:'Psalms & Proverbs',questions:8,  played:31, emoji:'🎶',  bg:'#1368CE' },
  { id:'d3', title:'The Exodus Story',    category:'Old Testament',    questions:12, played:55, emoji:'🏔️',  bg:'#E21B3C' },
  { id:'d4', title:'Letters of Paul',     category:'Epistles',         questions:7,  played:22, emoji:'📜',  bg:'#FFA602' },
  { id:'d5', title:'Book of Revelation',  category:'Revelation',       questions:9,  played:18, emoji:'📿',  bg:'#26890C' },
  { id:'d6', title:'Birth of a Nation',   category:'Old Testament',    questions:11, played:37, emoji:'🌿',  bg:'#E21B3C' },
]

export const DEMO_QUESTIONS = [
  {
    q: 'Who did God command to build an ark?',
    ref: 'Genesis 6:14',
    opts: ['Moses', 'Abraham', 'Noah', 'David'],
    correct: 2,
    verse: '"Make yourself an ark of cypress wood; make rooms in it and coat it with pitch inside and out." — Genesis 6:14',
  },
  {
    q: 'How many days and nights did it rain during the flood?',
    ref: 'Genesis 7:12',
    opts: ['20 days', '40 days', '7 days', '100 days'],
    correct: 1,
    verse: '"And rain fell on the earth forty days and forty nights." — Genesis 7:12',
  },
  {
    q: "What was the name of Moses' sister?",
    ref: 'Exodus 15:20',
    opts: ['Rachel', 'Miriam', 'Deborah', 'Hannah'],
    correct: 1,
    verse: '"Then Miriam the prophet, Aaron\'s sister, took a timbrel in her hand…" — Exodus 15:20',
  },
  {
    q: 'Who wrote most of the Psalms?',
    ref: 'Psalm 3:1',
    opts: ['Solomon', 'Moses', 'David', 'Asaph'],
    correct: 2,
    verse: '"A psalm of David. LORD, how many are my foes!" — Psalm 3:1',
  },
  {
    q: "Which city were Jesus' parents travelling to when he was born?",
    ref: 'Luke 2:4',
    opts: ['Jerusalem', 'Nazareth', 'Bethlehem', 'Capernaum'],
    correct: 2,
    verse: '"So Joseph also went up from Nazareth… to Bethlehem." — Luke 2:4',
  },
]

export const DEMO_LEADERBOARD = [
  { name:'Miriam 🌿', score:9800, correct:12, emoji:'👸' },
  { name:'Elijah ⚡',  score:8750, correct:11, emoji:'⚡' },
  { name:'Daniel 🦁', score:7900, correct:10, emoji:'🦁' },
  { name:'Esther 🌸', score:7200, correct:9,  emoji:'👑' },
  { name:'Ruth 🌾',   score:6800, correct:9,  emoji:'🌾' },
  { name:'Joseph 🌈', score:6100, correct:8,  emoji:'🌈' },
  { name:'Deborah 🌟',score:5500, correct:7,  emoji:'🌟' },
]

export const LOBBY_DEMO_NAMES = [
  'Joshua 🛡️','Naomi 🌺','Gideon ⚔️','Lydia 💜','Ezra 📜',
  'Abigail 🌸','Cornelius 🏛️','Tabitha 🕊️','Barnabas ✨','Priscilla 🌿',
]

export const CATEGORIES = [
  'Old Testament','New Testament','Gospel',
  'Psalms & Proverbs','Epistles','Prophecy','Revelation',
]

export const CAT_BG = {
  'Gospel':           '#46178F',
  'Old Testament':    '#E21B3C',
  'New Testament':    '#1368CE',
  'Psalms & Proverbs':'#FFA602',
  'Epistles':         '#E65100',
  'Prophecy':         '#26890C',
  'Revelation':       '#880E4F',
}

export const CAT_EMOJI = {
  'Gospel':'✝️','Old Testament':'🏔️','New Testament':'📖',
  'Psalms & Proverbs':'🎶','Epistles':'📜','Prophecy':'📿','Revelation':'🔮',
}

export const RANDOM_EMOJIS = ['🌿','⚡','🦁','🌸','🌾','🌈','🌟','👑','📜','🕊️']
export const randomEmoji = () => RANDOM_EMOJIS[Math.floor(Math.random() * RANDOM_EMOJIS.length)]

// Answer button colour classes + Kahoot shape icons
export const ANS_STYLES = [
  { bg:'ans-red',    icon:'▲', label:'A' },
  { bg:'ans-blue',   icon:'●', label:'B' },
  { bg:'ans-yellow', icon:'◆', label:'C' },
  { bg:'ans-green',  icon:'★', label:'D' },
]
