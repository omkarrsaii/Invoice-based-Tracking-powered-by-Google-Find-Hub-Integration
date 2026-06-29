export default function StatCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const themes = {
    blue:   { accent: '#003087', bg: '#EBF3FF',  icon: '#0052A5' },
    green:  { accent: '#5E9F2B', bg: '#F0F9E8',  icon: '#7DC242' },
    amber:  { accent: '#D97706', bg: '#FFFBEB',  icon: '#F59E0B' },
    red:    { accent: '#DC2626', bg: '#FEF2F2',  icon: '#EF4444' },
    teal:   { accent: '#0B6FCB', bg: '#EBF3FF',  icon: '#0B6FCB' },
  }
  const t = themes[color] || themes.blue

  return (
    <div className="relative bg-m-surface rounded-xl shadow-card overflow-hidden card-accent animate-slide-up"
         style={{ borderLeftColor: t.accent }}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-m-muted uppercase tracking-widest mb-2.5">{label}</p>
            <p className="text-3xl font-extrabold leading-none" style={{ color: t.accent }}>{value ?? '—'}</p>
            {sub && <p className="text-m-muted text-xs mt-2 font-mono">{sub}</p>}
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: t.bg }}>
            <Icon size={18} style={{ color: t.icon }} />
          </div>
        </div>
      </div>
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-20" style={{ background: t.accent }} />
    </div>
  )
}
