import { useState, useEffect } from 'react'
import { History, MapPin, Filter } from 'lucide-react'
import { getDevices, getDeviceHistory } from '../lib/api'
import { useDevices } from '../hooks/useDevices'
import Header from '../components/Header'

export default function HistoryPage() {
  const { status, refreshing, refresh } = useDevices()
  const [devices, setDevices]           = useState([])
  const [selectedDevice, setSelectedDevice] = useState('all')
  const [allHistory, setAllHistory]     = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const devs = await getDevices()
        setDevices(devs)
        const histories = await Promise.all(devs.map(d => getDeviceHistory(d.id, 30).then(h => h.map(r => ({ ...r, deviceName: d.name })))))
        setAllHistory(histories.flat().sort((a, b) => new Date(b.captured_at) - new Date(a.captured_at)))
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = selectedDevice === 'all' ? allHistory : allHistory.filter(h => h.device_id === parseInt(selectedDevice))

  return (
    <div className="min-h-screen bg-m-bg">
      <Header title="History" status={status} refreshing={refreshing} onRefresh={refresh} />
      <div className="p-6 animate-fade-in">
        {/* Filter bar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center gap-2 bg-m-surface border border-m-border rounded-xl px-3 py-2 shadow-card">
            <Filter size={13} className="text-m-muted" />
            <select
              value={selectedDevice} onChange={e => setSelectedDevice(e.target.value)}
              className="bg-transparent text-sm text-m-text focus:outline-none pr-2"
            >
              <option value="all">All Devices</option>
              {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <span className="text-xs text-m-muted font-mono bg-m-surface border border-m-border px-2.5 py-1.5 rounded-xl shadow-card">{filtered.length} records</span>
        </div>

        <div className="bg-m-surface rounded-xl border border-m-border shadow-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-m-border flex items-center gap-2">
            <History size={14} className="text-m-blue" />
            <h2 className="text-sm font-bold text-m-text">Location History</h2>
          </div>

          {loading ? (
            <div className="p-12 flex flex-col items-center gap-3">
              <div className="w-7 h-7 border-2 border-m-border rounded-full animate-spin" style={{ borderTopColor:'#1467B2' }} />
              <p className="text-m-muted text-sm">Loading history…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <History size={28} className="text-m-border mx-auto mb-3" />
              <p className="text-m-muted text-sm font-medium">No history records yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-m-border bg-m-bg">
                    {['Timestamp','Device','Latitude','Longitude','Battery','Network','Maps'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-m-muted uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(h => (
                    <tr key={h.id} className="border-b border-m-border/50 hover:bg-m-bg transition-colors">
                      <td className="px-4 py-3 text-xs text-m-muted font-mono whitespace-nowrap">{new Date(h.captured_at).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-m-text font-semibold">{h.deviceName}</td>
                      <td className="px-4 py-3 text-xs text-m-text font-mono">{h.latitude || '—'}</td>
                      <td className="px-4 py-3 text-xs text-m-text font-mono">{h.longitude || '—'}</td>
                      <td className="px-4 py-3 text-xs font-mono font-semibold"
                          style={{ color: h.battery ? (parseInt(h.battery) > 40 ? '#5E9F2B' : '#DC2626') : '#94A3B8' }}>
                        {h.battery ? `${h.battery}%` : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-m-text">{h.network || '—'}</td>
                      <td className="px-4 py-3">
                        {h.latitude && h.longitude && (
                          <a href={`https://www.google.com/maps?q=${h.latitude},${h.longitude}`} target="_blank" rel="noreferrer"
                             className="flex items-center gap-1 text-m-blue text-xs hover:underline font-medium">
                            <MapPin size={10} style={{ color:'#7DC242' }} /> View
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
