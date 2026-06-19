import { useState, useEffect, useCallback } from 'react'
import { ChevronRight, RefreshCw, Route, Truck, FileText, Users, MapPin, AlertCircle, ChevronDown, CheckCircle, Clock } from 'lucide-react'
import Header from '../components/Header'
import { getRoutes, getRouteDetail, syncRoutes } from '../lib/api'

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = 'cyan' }) {
  const colors = {
    cyan:   'text-hub-accent  bg-hub-accent/10  border-hub-accent/20',
    green:  'text-hub-green   bg-hub-green/10   border-hub-green/20',
    yellow: 'text-hub-yellow  bg-hub-yellow/10  border-hub-yellow/20',
    purple: 'text-hub-accent2 bg-hub-accent2/10 border-hub-accent2/20',
  }
  return (
    <div className="rounded-xl border border-hub-border bg-hub-card p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-hub-muted uppercase tracking-wider">{label}</p>
        <p className="text-xl font-display font-bold text-hub-text mt-0.5">{value ?? '—'}</p>
      </div>
    </div>
  )
}

// ─── Vehicle status badge ─────────────────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === 'out_for_delivery') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-hub-green/10 text-hub-green border border-hub-green/20">
        🟢 Out for delivery
      </span>
    )
  }
  if (status === 'inactive') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-hub-yellow/10 text-hub-yellow border border-hub-yellow/20">
        🟠 Inactive
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-hub-border/50 text-hub-muted border border-hub-border">
      ⚫ Unknown
    </span>
  )
}

// ─── Route detail panel ───────────────────────────────────────────────────────
function RouteDetailPanel({ routeName, onClose }) {
  const [detail, setDetail]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    setLoading(true)
    setError(null)
    getRouteDetail(routeName)
      .then(setDetail)
      .catch(e => setError(e.response?.data?.message || e.message))
      .finally(() => setLoading(false))
  }, [routeName])

  const toggle = code => setExpanded(prev => ({ ...prev, [code]: !prev[code] }))

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl h-screen bg-hub-card border-l border-hub-border overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-hub-border bg-hub-bg/50 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <Route size={16} className="text-hub-accent" />
              <h2 className="font-display font-semibold text-hub-text">{routeName}</h2>
            </div>
            {detail && (
              <p className="text-xs text-hub-muted mt-0.5">
                ASM: {detail.asmName || '—'} · {detail.distributorCount} distributors ·{' '}
                {detail.totalVehicles} vehicles · {detail.totalInvoices} invoices
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-hub-muted hover:text-hub-text transition-colors px-2 py-1 text-sm rounded hover:bg-hub-border/30">
            ✕ Close
          </button>
        </div>

        <div className="p-5 flex-1">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-hub-accent/30 border-t-hub-accent rounded-full animate-spin" />
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-4">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {detail && !loading && (
            <div className="space-y-3">
              {detail.distributors.map(dist => (
                <div key={dist.distributorCode} className="border border-hub-border rounded-xl overflow-hidden">
                  {/* Distributor header */}
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 bg-hub-bg/40 hover:bg-hub-bg/70 transition-colors"
                    onClick={() => toggle(dist.distributorCode)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-hub-accent flex-shrink-0" />
                      <div className="text-left min-w-0">
                        <p className="text-sm font-medium text-hub-text truncate">
                          {dist.distributorCode} — {dist.distributorName || '—'}
                        </p>
                        <p className="text-xs text-hub-muted">
                          {dist.city} · {dist.tsoeName ? `TSOE: ${dist.tsoeName}` : ''} ·{' '}
                          {dist.invoiceCount} invoices · {dist.vehicleCount} vehicles
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-hub-muted flex-shrink-0 transition-transform ${expanded[dist.distributorCode] ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Distributor drill-down */}
                  {expanded[dist.distributorCode] && (
                    <div className="border-t border-hub-border p-4 space-y-3 bg-hub-card">
                      {dist.vehicles.length === 0 ? (
                        <p className="text-xs text-hub-muted text-center py-3">No active vehicles found for this distributor.</p>
                      ) : (
                        dist.vehicles.map(v => (
                          <div key={v.vehicleNo} className="border border-hub-border rounded-lg p-3 bg-hub-bg/30">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Truck size={13} className="text-hub-accent" />
                                  <span className="font-mono text-sm font-semibold text-hub-text">{v.vehicleNo}</span>
                                </div>
                                <p className="text-xs text-hub-muted">Device: {v.deviceName}</p>
                                {v.location && (
                                  <p className="text-xs text-hub-muted flex items-center gap-1 mt-0.5">
                                    <MapPin size={11} className="text-hub-accent" /> {v.location}
                                  </p>
                                )}
                                {v.lastSeen && (
                                  <p className="text-xs text-hub-muted mt-0.5">Last seen: {v.lastSeen}</p>
                                )}
                                {v.distanceKm !== null && (
                                  <p className="text-xs text-hub-muted font-mono mt-0.5">{v.distanceKm} km from hub</p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1.5">
                                <StatusBadge status={v.status} />
                                {v.battery && (
                                  <span className="text-xs font-mono text-hub-muted">{v.battery}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
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

// ─── Main page ────────────────────────────────────────────────────────────────
export default function RoutesPage() {
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [syncing, setSyncing]     = useState(false)
  const [error, setError]         = useState(null)
  const [selected, setSelected]   = useState(null)
  const [filter, setFilter]       = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    getRoutes()
      .then(setData)
      .catch(e => setError(e.response?.data?.message || e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleSync = async () => {
    setSyncing(true)
    try { await syncRoutes(); load() } catch { /* ignore */ } finally { setSyncing(false) }
  }

  const filtered = (data?.routes || []).filter(r =>
    !filter ||
    r.routeName.toLowerCase().includes(filter.toLowerCase()) ||
    r.asmName.toLowerCase().includes(filter.toLowerCase())
  )

  const totalVehicles    = (data?.routes || []).reduce((s, r) => s + (r.vehicleCount || 0), 0)
  const totalDistributors = (data?.routes || []).reduce((s, r) => s + r.distributorCount, 0)
  const totalInvoices    = (data?.routes || []).reduce((s, r) => s + (r.invoiceCount || 0), 0)

  return (
    <div className="min-h-screen">
      <Header
        title="Route Management"
        status={null}
        refreshing={syncing}
        onRefresh={handleSync}
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Route}     label="Total Routes"      value={data?.total ?? '—'}   color="cyan" />
          <StatCard icon={Users}     label="Total Distributors" value={totalDistributors}    color="purple" />
          <StatCard icon={Truck}     label="Active Vehicles"   value={totalVehicles}         color="green" />
          <StatCard icon={FileText}  label="Total Invoices"    value={totalInvoices}         color="yellow" />
        </div>

        {/* Route table */}
        <div className="rounded-xl border border-hub-border bg-hub-card overflow-hidden">
          <div className="px-5 py-4 border-b border-hub-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Route size={16} className="text-hub-accent" />
              <h2 className="font-display font-semibold text-sm text-hub-text">All Routes</h2>
              {data && (
                <span className="px-2 py-0.5 rounded-full bg-hub-accent/10 text-hub-accent text-xs font-mono border border-hub-accent/20">
                  {data.total}
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="Filter by route or ASM…"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="bg-hub-bg border border-hub-border rounded-lg px-3 py-1.5 text-xs text-hub-text placeholder-hub-muted focus:outline-none focus:border-hub-accent/50 w-52"
            />
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-hub-accent/30 border-t-hub-accent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-hub-muted text-sm">Loading routes…</p>
            </div>
          ) : error ? (
            <div className="p-8 flex flex-col items-center gap-3">
              <AlertCircle size={28} className="text-hub-muted" />
              <p className="text-hub-muted text-sm text-center">{error}</p>
              <p className="text-xs text-hub-muted">Make sure ROUTE_SHEET_ID is set in your .env</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Route size={32} className="text-hub-border mx-auto mb-3" />
              <p className="text-hub-muted text-sm">No routes found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-hub-border">
                    {['Route', 'ASM', 'Distributors', 'Invoices', 'Vehicles', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-hub-muted uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(route => (
                    <tr
                      key={route.routeName}
                      className="border-b border-hub-border/50 hover:bg-hub-bg/30 cursor-pointer transition-colors"
                      onClick={() => setSelected(route.routeName)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Route size={14} className="text-hub-accent flex-shrink-0" />
                          <span className="text-sm font-medium text-hub-text">{route.routeName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-hub-muted">{route.asmName || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-hub-text">{route.distributorCount}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-hub-text">{route.invoiceCount ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-mono ${route.vehicleCount > 0 ? 'text-hub-green' : 'text-hub-muted'}`}>
                          {route.vehicleCount ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-hub-accent hover:text-hub-text transition-colors flex items-center gap-1 text-xs ml-auto">
                          View <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <RouteDetailPanel routeName={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
