import { useStore } from '../lib/store'

// ── Toast ──────────────────────────────────────────────────────────────────
export function Toast() {
  const { toastMsg, toastVisible } = useStore()
  return (
    <div className={`
      fixed bottom-6 left-1/2 z-[999] px-5 py-3 rounded-full
      bg-[#1A1A2E] text-white text-sm font-bold border border-white/10
      shadow-2xl pointer-events-none text-center max-w-[88vw]
      transition-all duration-300
      ${toastVisible
        ? '-translate-x-1/2 translate-y-0 opacity-100'
        : '-translate-x-1/2 translate-y-4 opacity-0'
      }
    `}>
      {toastMsg}
    </div>
  )
}

// ── KButton ────────────────────────────────────────────────────────────────
export function KBtn({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }) {
  const base = 'w-full py-4 rounded-xl font-montserrat font-black text-base uppercase tracking-wide transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-[#5B2BA6] hover:bg-[#8B60C8] text-white shadow-lg hover:-translate-y-0.5 active:scale-95',
    yellow:  'bg-[#FFA602] hover:bg-[#FFB82E] text-[#1A1A2E] shadow-lg hover:-translate-y-0.5 active:scale-95',
    red:     'bg-[#E21B3C] hover:bg-[#F03252] text-white shadow-lg hover:-translate-y-0.5 active:scale-95',
    ghost:   'bg-transparent text-white/80 border-2 border-white/30 hover:bg-white/10 hover:text-white active:scale-95',
    white:   'bg-white text-[#46178F] hover:bg-gray-100 shadow-md active:scale-95',
    danger:  'bg-red-100 text-red-600 hover:bg-red-200 active:scale-95',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

// ── KInput ─────────────────────────────────────────────────────────────────
export function KInput({ id, value, onChange, placeholder, type = 'text', maxLength, inputMode, className = '' }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      inputMode={inputMode}
      className={`
        w-full border-[2.5px] border-gray-200 rounded-xl px-4 py-3.5
        font-nunito font-bold text-[#1A1A2E] text-lg
        placeholder:text-gray-300 placeholder:font-semibold placeholder:text-sm
        outline-none transition-all duration-200
        focus:border-[#5B2BA6] focus:ring-4 focus:ring-purple-100
        ${className}
      `}
    />
  )
}

// ── Modal ──────────────────────────────────────────────────────────────────
export function Modal({ open, icon, title, desc, confirmLabel = 'Confirm', onConfirm, onClose, confirmVariant = 'primary' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[500] bg-black/70 backdrop-blur-sm flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-fadeUp text-center">
        <div className="text-6xl mb-3">{icon}</div>
        <h3 className="font-montserrat font-black text-[#46178F] text-2xl mb-2">{title}</h3>
        <p className="text-gray-500 font-semibold text-sm mb-6 leading-relaxed">{desc}</p>
        <div className="flex gap-3">
          <KBtn onClick={onConfirm} variant={confirmVariant}>{confirmLabel}</KBtn>
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-xl bg-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Spinner ────────────────────────────────────────────────────────────────
export function Spinner({ className = '' }) {
  return (
    <div className={`w-10 h-10 border-[3px] border-white/10 border-t-[#FFA602] rounded-full animate-spin mx-auto ${className}`} />
  )
}

// ── LiveBadge ──────────────────────────────────────────────────────────────
export function LiveBadge() {
  return (
    <span className="flex items-center gap-1.5 bg-green-900/30 border border-green-500/40 rounded-full px-2.5 py-1 text-green-400 text-xs font-black tracking-wide">
      <span className="w-2 h-2 rounded-full bg-green-400 animate-blink" />
      LIVE
    </span>
  )
}

// ── SetupBanner ────────────────────────────────────────────────────────────
export function SetupBanner({ onSetup }) {
  return (
    <div className="w-full bg-gradient-to-r from-[#E21B3C] to-[#B8102D] flex items-center justify-between px-5 py-2.5 gap-3 flex-wrap">
      <p className="text-white text-sm font-bold">⚠️ Supabase not configured — running in demo mode.</p>
      <button
        onClick={onSetup}
        className="bg-white/20 border border-white/40 rounded-lg text-white text-xs font-black px-3 py-1.5 hover:bg-white/30 transition-colors whitespace-nowrap"
      >
        Configure →
      </button>
    </div>
  )
}
