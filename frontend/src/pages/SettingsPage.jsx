import { useState, useEffect } from 'react'
import { Settings, Clock, Terminal, CheckCircle, AlertTriangle, RefreshCw, Bug, Image } from 'lucide-react'
import { updateScheduler, triggerRefreshSync } from '../lib/api'
import { useDevices } from '../hooks/useDevices'
import Header from '../components/Header'
import api from '../lib/api'

const INTERVALS = [10, 15, 20, 30, 60]
const MB = '#1467B2'

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-m-surface rounded-xl border border-m-border shadow-card p-6 card-accent">
      <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-m-border">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:'#EBF3FF' }}>
          <Icon size={15} style={{ color:MB }} />
        </div>
        <h2 className="font-bold text-m-text text-sm">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const { status, refreshing, refresh, refetch } = useDevices()
  const [selectedInterval, setSelectedInterval] = useState(status?.scheduler?.interval || 10)
  const [saving, setSaving]       = useState(false)
  const [syncing, setSyncing]     = useState(false)
  const [saveMsg, setSaveMsg]     = useState(null)
  const [syncResult, setSyncResult] = useState(null)
  const [debugFiles, setDebugFiles] = useState([])
  const [showDebug, setShowDebug]   = useState(false)

  useEffect(() => {
    if (showDebug) {
      api.get('/debug/snapshots').then(r => setDebugFiles(r.data.files || [])).catch(() => {})
    }
  }, [showDebug])

  async function saveScheduler() {
    setSaving(true); setSaveMsg(null)
    try {
      await updateScheduler(selectedInterval)
      setSaveMsg({ ok: true, text: `Scheduler updated to every ${selectedInterval} minutes` })
      refetch()
    } catch (err) { setSaveMsg({ ok: false, text: err.response?.data?.error || err.message }) }
    finally { setSaving(false); setTimeout(() => setSaveMsg(null), 4000) }
  }

  async function runSyncNow() {
    setSyncing(true); setSyncResult(null)
    try {
      const r = await triggerRefreshSync()
      setSyncResult({ ok: true, text: `Synced ${r.count} devices in ${r.duration}s` })
      refetch()
    } catch (err) { setSyncResult({ ok: false, text: err.response?.data?.message || err.message }) }
    finally { setSyncing(false) }
  }

  const sessionOk = status?.session === 'ok'

  return (
    <div className="min-h-screen bg-m-bg">
      <Header title="Settings" status={status} refreshing={refreshing} onRefresh={refresh} />
      <div className="p-6 max-w-2xl space-y-5 animate-fade-in">

        {/* Fetch interval */}
        <SectionCard icon={Clock} title="Fetch Interval">
          <p className="text-sm text-m-muted mb-4">How often to pull device locations automatically.</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {INTERVALS.map(iv => (
              <button key={iv} onClick={() => setSelectedInterval(iv)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  selectedInterval === iv ? 'text-white border-transparent shadow-sm' : 'bg-m-bg border-m-border text-m-muted hover:text-m-text hover:border-m-blue/30'
                }`}
                style={selectedInterval === iv ? { background:MB } : {}}>
                {iv === 60 ? '1 hour' : `${iv} min`}
              </button>
            ))}
          </div>
          {saveMsg && (
            <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm border ${saveMsg.ok ? 'bg-m-green-50 border-m-green/25 text-m-green-dk' : 'bg-m-red-50 border-m-red/25 text-m-red'}`}>
              {saveMsg.ok ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}{saveMsg.text}
            </div>
          )}
          <button onClick={saveScheduler} disabled={saving}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold border-none disabled:opacity-40 transition-all"
            style={{ background:MB }}
            onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.filter='brightness(1.1)')}
            onMouseLeave={e => (e.currentTarget.style.filter='')}>
            {saving ? 'Saving…' : 'Save Interval'}
          </button>
        </SectionCard>

        {/* Manual sync */}
        <SectionCard icon={RefreshCw} title="Manual Sync">
          <p className="text-sm text-m-muted mb-4">Trigger an immediate device fetch and wait for the result.</p>
          {syncResult && (
            <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm border ${syncResult.ok ? 'bg-m-green-50 border-m-green/25 text-m-green-dk' : 'bg-m-red-50 border-m-red/25 text-m-red'}`}>
              {syncResult.ok ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}{syncResult.text}
            </div>
          )}
          <button onClick={runSyncNow} disabled={syncing || status?.sessionExpired}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 transition-all"
            style={{ background:MB }}
            onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.filter='brightness(1.1)')}
            onMouseLeave={e => (e.currentTarget.style.filter='')}>
            <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing (may take ~30s)…' : 'Sync Now'}
          </button>
        </SectionCard>

        {/* Session */}
        <SectionCard icon={Terminal} title="Session Management">
          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm mb-4 border font-medium ${
            status?.sessionExpired  ? 'bg-m-red-50 border-m-red/25 text-m-red'
            : sessionOk             ? 'bg-m-green-50 border-m-green/25 text-m-green-dk'
            : 'bg-m-amber-50 border-m-amber/25 text-m-amber'}`}>
            {status?.sessionExpired ? <><AlertTriangle size={14} /> Session Expired</>
              : sessionOk ? <><CheckCircle size={14} /> Session Active</>
              : <><AlertTriangle size={14} /> No session — login required</>}
          </div>
          <p className="text-sm text-m-muted mb-3">To create or renew your Google session, run:</p>
          <div className="bg-m-bg rounded-xl border border-m-border p-3 font-mono text-xs" style={{ color:MB }}>
            cd backend &amp;&amp; npm run setup-login
          </div>
          <p className="text-xs text-m-muted mt-3 leading-relaxed">
            A browser window opens. Log in, navigate to <span className="font-semibold" style={{ color:MB }}>google.com/android/find</span>,
            wait for your devices, then press <kbd className="px-1.5 py-0.5 bg-m-border rounded text-m-text text-xs">ENTER</kbd>.
          </p>
        </SectionCard>

        {/* System status */}
        <SectionCard icon={Settings} title="System Status">
          <div className="space-y-0 font-mono text-xs">
            {[
              ['Scheduler Running', status?.scheduler?.running ? '✓ Yes' : '✗ No'],
              ['Fetch Interval', status?.scheduler?.interval ? `${status.scheduler.interval} minutes` : '—'],
              ['Cron Expression', status?.scheduler?.cronExpr || '—'],
              ['Last Sync', status?.lastSync ? new Date(status.lastSync).toLocaleString() : 'Never'],
              ['Last Sync Count', status?.lastSyncCount || '0'],
              ['Currently Fetching', status?.fetching ? '⟳ Yes' : 'No'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2.5 border-b border-m-border/60 last:border-0">
                <span className="text-m-muted">{label}</span>
                <span className="text-m-text font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Debug */}
        <div className="bg-m-surface rounded-xl border border-m-border shadow-card p-5">
          <button onClick={() => setShowDebug(!showDebug)} className="flex items-center gap-2 w-full text-left">
            <div className="w-7 h-7 rounded-lg bg-m-amber-50 border border-m-amber/20 flex items-center justify-center flex-shrink-0">
              <Bug size={13} className="text-m-amber" />
            </div>
            <h2 className="font-bold text-m-text text-sm flex-1">Debug Snapshots</h2>
            <span className="text-xs text-m-muted">{showDebug ? '▲ hide' : '▼ show'}</span>
          </button>
          {showDebug && (
            <div className="mt-4">
              <p className="text-sm text-m-muted mb-3">
                When a fetch fails, screenshots and DOM dumps are saved to <code className="text-m-blue text-xs bg-m-blue-50 px-1.5 py-0.5 rounded">backend/data/debug/</code>.
              </p>
              {debugFiles.length === 0 ? (
                <p className="text-xs text-m-muted italic">No debug snapshots yet.</p>
              ) : (
                <div className="space-y-2">
                  {debugFiles.filter(f => f.name.endsWith('.png')).map(f => (
                    <div key={f.name} className="rounded-xl overflow-hidden border border-m-border">
                      <p className="text-xs text-m-muted px-3 py-1.5 bg-m-bg border-b border-m-border font-mono">{f.name}</p>
                      <img src={f.url} alt={f.name} className="w-full max-h-64 object-cover object-top" />
                    </div>
                  ))}
                  {debugFiles.filter(f => f.name.endsWith('.txt')).map(f => (
                    <a key={f.name} href={f.url} target="_blank" rel="noreferrer"
                       className="flex items-center gap-2 px-3 py-2 rounded-xl bg-m-bg border border-m-border hover:border-m-blue/30 text-xs text-m-muted hover:text-m-text transition-colors">
                      <Image size={11} /> {f.name} — DOM dump
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
