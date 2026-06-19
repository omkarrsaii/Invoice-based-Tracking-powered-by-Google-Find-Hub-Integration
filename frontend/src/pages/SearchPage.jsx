import { useState, useRef, useEffect } from 'react'
import { Search, FileText, Truck, Building2, Route, MapPin, ChevronRight, AlertCircle } from 'lucide-react'
import Header from '../components/Header'
import { globalSearch } from '../lib/api'
import { useNavigate } from 'react-router-dom'

const TYPE_CONFIG = {
  invoice:     { icon: FileText,   color: 'text-hub-accent',  bg: 'bg-hub-accent/10',  label: 'Invoice' },
  vehicle:     { icon: Truck,      color: 'text-hub-green',   bg: 'bg-hub-green/10',   label: 'Vehicle' },
  distributor: { icon: Building2,  color: 'text-hub-accent2', bg: 'bg-hub-accent2/10', label: 'Distributor' },
  route:       { icon: Route,      color: 'text-hub-yellow',  bg: 'bg-hub-yellow/10',  label: 'Route' },
}

const FILTERS = [
  { value: '',            label: 'All' },
  { value: 'invoice',     label: 'Invoices' },
  { value: 'vehicle',     label: 'Vehicles' },
  { value: 'distributor', label: 'Distributors' },
  { value: 'route',       label: 'Routes' },
]

function ResultCard({ result }) {
  const navigate  = useNavigate()
  const config    = TYPE_CONFIG[result.type] || TYPE_CONFIG.invoice
  const Icon      = config.icon

  const handleClick = () => {
    if (result.type === 'route') navigate('/routes')
    if (result.type === 'distributor') navigate('/hierarchy')
    // invoice / vehicle — open client tracker in new tab
    if (result.type === 'invoice') {
      window.open(`/track?invoice=${result.id}`, '_blank')
    }
  }

  return (
    <button
      onClick={handleClick}
      className="w-full text-left flex items-start gap-4 p-4 rounded-xl border border-hub-border bg-hub-card hover:border-hub-accent/30 hover:bg-hub-bg/40 transition-all group"
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
        <Icon size={16} className={config.color} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}>
            {config.label}
          </span>
          <span className="text-sm font-medium text-hub-text group-hover:text-hub-accent transition-colors truncate">
            {result.title}
          </span>
        </div>
        <p className="text-xs text-hub-muted truncate">{result.subtitle}</p>
        {result.location && (
          <p className="text-xs text-hub-muted flex items-center gap-1 mt-0.5">
            <MapPin size={11} className="text-hub-accent" /> {result.location}
          </p>
        )}
      </div>
      <ChevronRight size={15} className="text-hub-muted group-hover:text-hub-accent transition-colors flex-shrink-0 mt-1" />
    </button>
  )
}

export default function SearchPage() {
  const [query, setQuery]     = useState('')
  const [typeFilter, setType] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const debounceRef           = useRef(null)
  const inputRef              = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const doSearch = (q, type) => {
    if (!q.trim()) { setResults(null); return }
    setLoading(true); setError(null)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      globalSearch(q, type)
        .then(setResults)
        .catch(e => setError(e.response?.data?.message || e.message))
        .finally(() => setLoading(false))
    }, 300)
  }

  const handleInput = e => {
    setQuery(e.target.value)
    doSearch(e.target.value, typeFilter)
  }

  const handleTypeChange = t => {
    setType(t)
    doSearch(query, t)
  }

  // Group results by type
  const grouped = results
    ? FILTERS.slice(1).reduce((acc, f) => {
        const items = results.results.filter(r => r.type === f.value)
        if (items.length) acc.push({ label: f.label, items })
        return acc
      }, [])
    : []

  return (
    <div className="min-h-screen">
      <Header title="Global Search" status={null} />

      <div className="p-6 max-w-3xl mx-auto space-y-5 animate-fade-in">
        {/* Search input */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-hub-muted pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInput}
            placeholder="Search invoices, vehicles, distributors, routes…"
            className="w-full bg-hub-card border border-hub-border rounded-xl pl-11 pr-4 py-3.5 text-hub-text placeholder-hub-muted focus:outline-none focus:border-hub-accent/50 text-sm"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-hub-accent/30 border-t-hub-accent rounded-full animate-spin" />
          )}
        </div>

        {/* Type filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => handleTypeChange(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                typeFilter === f.value
                  ? 'bg-hub-accent/10 text-hub-accent border-hub-accent/30'
                  : 'bg-hub-card text-hub-muted border-hub-border hover:text-hub-text hover:border-hub-accent/20'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-4">
            <AlertCircle size={16} /><span className="text-sm">{error}</span>
          </div>
        )}

        {results && results.total === 0 && (
          <div className="text-center py-12">
            <Search size={32} className="text-hub-border mx-auto mb-3" />
            <p className="text-hub-muted text-sm">No results for "{query}"</p>
            <p className="text-hub-muted text-xs mt-1">Try a different search term or filter.</p>
          </div>
        )}

        {grouped.map(({ label, items }) => (
          <div key={label}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-hub-muted uppercase tracking-wider">{label}</span>
              <span className="text-xs text-hub-muted font-mono">({items.length})</span>
            </div>
            <div className="space-y-2">
              {items.map((r, i) => <ResultCard key={i} result={r} />)}
            </div>
          </div>
        ))}

        {!query && !results && (
          <div className="text-center py-16">
            <Search size={40} className="text-hub-border mx-auto mb-4" />
            <p className="text-hub-muted text-sm">Start typing to search across all data</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-hub-muted">
              {['Invoice number', 'Vehicle number', 'Distributor code', 'Route name', 'ASM name'].map(hint => (
                <span key={hint} className="px-2 py-1 bg-hub-card border border-hub-border rounded-lg">{hint}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
