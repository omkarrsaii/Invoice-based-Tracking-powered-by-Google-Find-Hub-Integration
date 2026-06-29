const ERROR_META = {
  INVOICE_NOT_FOUND:  { emoji: '🔍', title: 'Invoice Not Found',              hint: 'Double-check the invoice number and try again.' },
  DEVICE_NOT_MAPPED:  { emoji: '🚛', title: 'Vehicle Not Assigned a Device',  hint: 'The vehicle has no tracking device yet. Contact your operations team.' },
  DEVICE_NOT_TRACKED: { emoji: '📡', title: 'Awaiting First Location',         hint: 'The device has been assigned but has not reported a location yet. Try again in a few minutes.' },
  INTERNAL_ERROR:     { emoji: '⚠️', title: 'Server Error',                    hint: 'Something went wrong on our end. Please try again shortly.' },
}

export default function ErrorCard({ error }) {
  const code    = error?.response?.data?.error || error?.code || 'INTERNAL_ERROR'
  const message = error?.response?.data?.message || error?.message || 'An unexpected error occurred.'
  const meta    = ERROR_META[code] || ERROR_META.INTERNAL_ERROR

  return (
    <div className="animate-fade-up mt-2 rounded-2xl border border-bad/25 bg-bad/5 p-6 flex gap-4">
      <span className="text-3xl flex-shrink-0 mt-0.5">{meta.emoji}</span>
      <div>
        <p className="font-bold text-snow mb-1">{meta.title}</p>
        <p className="text-sm text-slate leading-relaxed">{message}</p>
        {meta.hint && message !== meta.hint && (
          <p className="text-xs text-mist mt-2 leading-relaxed">{meta.hint}</p>
        )}
      </div>
    </div>
  )
}
