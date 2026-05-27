// Gold / Silver / Bronze podium
const SLOTS = [
  { order: 1, cls: 'p2nd', num: '2', h: 56, bg: 'linear-gradient(to top,#607D8B,#90A4AE)', tc: '#fff', size: 54 },
  { order: 0, cls: 'p1st', num: '1', h: 76, bg: 'linear-gradient(to top,#D4900A,#FFA602)', tc: '#1A1A2E', size: 68 },
  { order: 2, cls: 'p3rd', num: '3', h: 40, bg: 'linear-gradient(to top,#6D4C41,#A1887F)', tc: '#fff', size: 54 },
]

export default function Podium({ rows }) {
  return (
    <div className="flex items-end justify-center gap-2 mb-5">
      {SLOTS.map(slot => {
        const p = rows[slot.order]
        return (
          <div key={slot.num} className="flex flex-col items-center gap-1.5">
            {/* Avatar */}
            <div
              className="rounded-full flex items-center justify-center text-2xl border-[3px]"
              style={{
                width: slot.size, height: slot.size,
                background: 'linear-gradient(135deg,rgba(67,160,71,0.35),rgba(25,118,210,0.35))',
                borderColor: slot.order === 0 ? '#FFA602' : 'rgba(255,255,255,0.2)',
                boxShadow: slot.order === 0 ? '0 0 18px rgba(255,166,2,0.45)' : 'none',
              }}
            >
              {p?.emoji ?? ''}
            </div>
            {/* Name */}
            <div className="font-black text-white text-xs text-center max-w-[84px] truncate font-nunito">
              {p?.name ?? ''}
            </div>
            {/* Score */}
            <div
              className="font-montserrat font-black text-sm"
              style={{ color: slot.order === 0 ? '#FFA602' : slot.order === 1 ? '#CFD8DC' : '#BCAAA4' }}
            >
              {p?.score?.toLocaleString() ?? ''}
            </div>
            {/* Block */}
            <div
              className="rounded-t-xl flex items-center justify-center font-montserrat font-black text-xl"
              style={{ width: 76, height: slot.h, background: slot.bg, color: slot.tc }}
            >
              {slot.num}
            </div>
          </div>
        )
      })}
    </div>
  )
}
