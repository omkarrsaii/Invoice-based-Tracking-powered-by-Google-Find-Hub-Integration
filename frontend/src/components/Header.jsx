import { RefreshCw, Download, Wifi, WifiOff, AlertTriangle, ChevronRight } from 'lucide-react'

export default function Header({ status, refreshing, onRefresh, title }) {
  const sessionOk      = status?.session === 'ok'
  const sessionExpired = status?.sessionExpired

  return (
    <header className="sticky top-0 z-30 bg-m-surface shadow-header px-6 py-3.5 flex items-center justify-between">
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-m-muted text-xs font-medium hidden sm:inline">Marico</span>
        <ChevronRight size={13} className="text-m-border hidden sm:inline" />
        <h1 className="font-bold text-m-text text-base leading-none">{title}</h1>
        {status?.lastSync && (
          <span className="hidden sm:inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded bg-m-bg text-m-muted text-[10px] font-mono border border-m-border">
            Sync {new Date(status.lastSync).toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Session pill */}
        {sessionExpired ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-m-red/8 text-m-red border border-m-red/20">
            <AlertTriangle size={11} /> Session expired
          </span>
        ) : sessionOk ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white border"
                style={{ background: 'var(--m-green)', borderColor: 'var(--m-green)' }}>
            <Wifi size={11} /> Connected
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-m-amber/10 text-m-amber border border-m-amber/25">
            <WifiOff size={11} /> No session
          </span>
        )}

        {/* Export */}
        <a href="/api/export/csv"
           className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-m-muted hover:text-m-text bg-m-bg hover:bg-m-border/40 border border-m-border transition-colors">
          <Download size={12} /> CSV
        </a>
        <a href="/api/export/excel"
           className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
           style={{ color: 'var(--m-blue)', borderColor: 'var(--m-blue)', background: 'var(--m-blue-50, #EBF3FF)' }}
           onMouseEnter={e => e.currentTarget.style.background='#CCDFF8'}
           onMouseLeave={e => e.currentTarget.style.background='#EBF3FF'}>
          <Download size={12} /> Excel
        </a>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={refreshing || sessionExpired}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--m-blue)' }}
          onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.background='var(--m-blue-mid)')}
          onMouseLeave={e => (e.currentTarget.style.background='var(--m-blue)')}
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Syncing…' : 'Refresh'}
        </button>
      </div>
    </header>
  )
}
