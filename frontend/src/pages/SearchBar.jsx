import { useState } from 'react'

const MB = '#1467B2'
const MG = '#7DC242'

export default function SearchBar({ onSearch, loading }) {
  const [value, setValue]   = useState('')
  const [touched, setTouched] = useState(false)
  const isValid = value.trim().length >= 3

  function handleSubmit(e) {
    e.preventDefault()
    setTouched(true)
    if (isValid && !loading) onSearch(value.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        {/* Focus ring */}
        <div className="absolute -inset-px rounded-2xl pointer-events-none transition-all duration-200"
             style={{ boxShadow: loading ? `0 0 0 2px ${MB}` : undefined }} />

        <div className="flex items-center bg-white rounded-2xl border border-rim overflow-hidden shadow-card transition-all"
             style={{ '--focus-color': MB }}>
          {/* Icon */}
          <div className="pl-5 pr-3 flex-shrink-0">
            {loading ? (
              <svg className="w-5 h-5 animate-spin-slow" fill="none" viewBox="0 0 24 24" style={{ color: MB }}>
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
                <path fill="currentColor" className="opacity-80" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-mist" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            )}
          </div>

          {/* Input */}
          <input
            type="text"
            value={value}
            onChange={e => { setValue(e.target.value); setTouched(false) }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
            placeholder="Enter Invoice Number…"
            autoComplete="off"
            spellCheck={false}
            disabled={loading}
            className="flex-1 py-4 pr-3 bg-transparent text-snow placeholder:text-mist/50 font-mono text-base outline-none tracking-wide"
            onFocus={e => e.target.parentElement.parentElement.style.borderColor = MB}
            onBlur={e => e.target.parentElement.parentElement.style.borderColor = '#E2E8F0'}
          />

          {/* Clear */}
          {value && !loading && (
            <button type="button" onClick={() => { setValue(''); setTouched(false) }}
              className="px-2 text-mist hover:text-slate transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Track button */}
          <button type="submit" disabled={loading || !isValid}
            className="m-1.5 px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 flex-shrink-0 text-white disabled:cursor-not-allowed"
            style={{
              background: isValid && !loading ? MB : '#E2E8F0',
              color: isValid && !loading ? '#fff' : '#94A3B8',
            }}
            onMouseEnter={e => { if(isValid && !loading) e.currentTarget.style.filter='brightness(1.1)' }}
            onMouseLeave={e => { e.currentTarget.style.filter='' }}>
            {loading ? 'Tracking…' : 'Track'}
          </button>
        </div>
      </div>

      {/* Validation hint */}
      {touched && !isValid && (
        <p className="mt-2 text-xs text-bad/80 pl-1 animate-fade-in">
          Please enter a valid invoice number (at least 3 characters).
        </p>
      )}
    </form>
  )
}
