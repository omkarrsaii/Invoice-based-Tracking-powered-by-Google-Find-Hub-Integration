import { useState, useEffect, useCallback } from 'react'
import { ChevronRight, Route, Truck, FileText, Users, MapPin, AlertCircle, ChevronDown } from 'lucide-react'
import Header from '../components/Header'
import { getRoutes, getRouteDetail, syncRoutes } from '../lib/api'
import StatCard from '../components/StatCard'

function StatusBadge({ status }) {
  if (status === 'out_for_delivery') return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border"
          style={{ background:'rgba(94,159,43,.12)', color:'#5E9F2B', borderColor:'rgba(94,159,43,.25)' }}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />Out for delivery
    </span>
  )
  if (status === 'inactive') return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-m-amber-50 border-m-amber/25 text-m-amber">
      Inactive
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-m-bg border border-m-border text-m-muted">Unknown</span>
  )
}

function RouteDetailPanel({ routeName, onClose }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    setLoading(true); setError(null)
    getRouteDetail(routeName)
      .then(setDetail)
      .catch(e => setError(e.response?.data?.message || e.message))
      .finally(() => setLoading(false))
  }, [routeName])

  const toggle = code => setExpanded(p => ({ ...p, [code]: !p[code] }))

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-m-text/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl h-screen bg-m-surface border-l border-m-border overflow-y-auto flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-m-border bg-m-bg sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <Route size={15} className="text-m-blue" />
              <h2 className="font-bold text-m-text">{routeName}</h2>
            </div>
            {detail && (
              <p className="text-xs text-m-muted mt-0.5">
                ASM: {detail.asmName || '—'} · {detail.distributorCount} distributors · {detail.totalVehicles} vehicles · {detail.totalInvoices} invoices
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-m-muted hover:text-m-text transition-colors px-2 py-1 text-sm rounded-lg hover:bg-m-border/30">✕ Close</button>
        </div>

        <div className="p-5 flex-1">
          {loading && <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-m-border rounded-full animate-spin" style={{ borderTopColor:'#1467B2' }} /></div>}
          {error && (
            <div className="flex items-center gap-2 text-m-red bg-m-red-50 border border-m-red/25 rounded-xl p-4">
              <AlertCircle size={15} /><span className="text-sm">{error}</span>
            </div>
          )}
          {detail && !loading && (
            <div className="space-y-3">
              {detail.distributors.map(dist => (
                <div key={dist.distributorCode} className="border border-m-border rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 bg-m-bg hover:bg-m-blue-50/50 transition-colors"
                    onClick={() => toggle(dist.distributorCode)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:'#1467B2' }} />
                      <div className="text-left min-w-0">
                        <p className="text-sm font-semibold text-m-text truncate">{dist.distributorCode} — {dist.distributorName || '—'}</p>
                        <p className="text-xs text-m-muted">{dist.city} · {dist.tsoeName ? `TSOE: ${dist.tsoeName}` : ''} · {dist.invoiceCount} invoices · {dist.vehicleCount} vehicles</p>
                      </div>
                    </div>
                    <ChevronDown size={15} className={`text-m-muted flex-shrink-0 transition-transform ${expanded[dist.distributorCode] ? 'rotate-180' : ''}`} />
                  </button>

                  {expanded[dist.distributorCode] && (
                    <div className="border-t border-m-border p-4 space-y-3 bg-m-surface">
                      {dist.vehicles.length === 0 ? (
                        <p className="text-xs text-m-muted text-center py-3">No active vehicles for this distributor.</p>
                      ) : dist.vehicles.map(v => (
                        <div key={v.vehicleNo} className="border border-m-border rounded-xl p-3 bg-m-bg">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Truck size={12} className="text-m-blue" />
                                <span className="font-mono text-sm font-bold text-m-text">{v.vehicleNo}</span>
                              </div>
                              <p className="text-xs text-m-muted">Device: {v.deviceName}</p>
                              {v.location && <p className="text-xs text-m-muted flex items-center gap-1 mt-0.5"><MapPin size={10} className="text-m-green" />{v.location}</p>}
                              {v.lastSeen && <p className="text-xs text-m-muted mt-0.5">Last seen: {v.lastSeen}</p>}
                              {v.distanceKm !== null && <p className="text-xs text-m-muted font-mono mt-0.5">{v.distanceKm} km from hub</p>}
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                              <StatusBadge status={v.status} />
                              {v.battery && <span className="text-xs font-mono text-m-muted">{v.battery}%</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RoutesPage() {
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [syncing, setSyncing]   = useState(false)
  const [error, setError]       = useState(null)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter]     = useState('')

  const load = useCallback(() => {
    setLoading(true); setError(null)
    getRoutes().then(setData).catch(e => setError(e.response?.data?.message || e.message)).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleSync = async () => {
    setSyncing(true)
    try { await syncRoutes(); load() } catch { /* ignore */ } finally { setSyncing(false) }
  }

  const filtered = (data?.routes || []).filter(r =>
    !filter || r.routeName.toLowerCase().includes(filter.toLowerCase()) || r.asmName.toLowerCase().includes(filter.toLowerCase())
  )

  const totalVehicles     = (data?.routes || []).reduce((s, r) => s + (r.vehicleCount || 0), 0)
  const totalDistributors = (data?.routes || []).reduce((s, r) => s + r.distributorCount, 0)
  const totalInvoices     = (data?.routes || []).reduce((s, r) => s + (r.invoiceCount || 0), 0)

  return (
    <div className="min-h-screen bg-m-bg">
      <Header title="Route Management" status={null} refreshing={syncing} onRefresh={handleSync} />
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Route}    label="Total Routes"       value={data?.total ?? '—'} color="blue"  />
          <StatCard icon={Users}    label="Total Distributors" value={totalDistributors}   color="teal"  />
          <StatCard icon={Truck}    label="Active Vehicles"    value={totalVehicles}        color="green" />
          <StatCard icon={FileText} label="Total Invoices"     value={totalInvoices}        color="amber" />
        </div>

        <div className="bg-m-surface rounded-xl border border-m-border shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-m-border flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Route size={15} className="text-m-blue" />
              <h2 className="font-bold text-sm text-m-text">All Routes</h2>
              {data && <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background:'#EBF3FF', color:'#1467B2' }}>{data.total}</span>}
            </div>
            <input
              type="text" placeholder="Filter by route or ASM…" value={filter}
              onChange={e => setFilter(e.target.value)}
              className="bg-m-bg border border-m-border rounded-xl px-3 py-1.5 text-xs text-m-text placeholder-m-muted/60 focus:outline-none focus:border-m-blue/40 w-52 transition-colors"
            />
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="w-7 h-7 border-2 border-m-border rounded-full animate-spin mx-auto mb-3" style={{ borderTopColor:'#1467B2' }} />
              <p className="text-m-muted text-sm">Loading routes…</p>
            </div>
          ) : error ? (
            <div className="p-8 flex flex-col items-center gap-3">
              <AlertCircle size={24} className="text-m-muted" />
              <p className="text-m-muted text-sm text-center">{error}</p>
              <p className="text-xs text-m-muted">Make sure ROUTE_SHEET_ID is set in your .env</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center"><Route size={28} className="text-m-border mx-auto mb-3" /><p className="text-m-muted text-sm">No routes found.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-m-border bg-m-bg">
                    {['Route','ASM','Distributors','Invoices','Vehicles',''].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-m-muted uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(route => (
                    <tr key={route.routeName} className="border-b border-m-border/60 hover:bg-m-bg cursor-pointer transition-colors group" onClick={() => setSelected(route.routeName)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Route size={13} className="text-m-blue flex-shrink-0" />
                          <span className="text-sm font-semibold text-m-text group-hover:text-m-blue transition-colors">{route.routeName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-m-muted">{route.asmName || '—'}</td>
                      <td className="px-4 py-3 text-sm font-mono text-m-text">{route.distributorCount}</td>
                      <td className="px-4 py-3 text-sm font-mono text-m-text">{route.invoiceCount ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-mono font-bold ${route.vehicleCount > 0 ? 'text-m-green-dk' : 'text-m-muted'}`}>{route.vehicleCount ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ChevronRight size={14} className="text-m-border group-hover:text-m-muted ml-auto transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {selected && <RouteDetailPanel routeName={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
