import { AlertTriangle, Terminal } from 'lucide-react'

export default function SessionExpiredBanner() {
  return (
    <div className="mx-6 mt-4 rounded-xl border border-m-red/25 bg-m-red-50 p-4 flex items-start gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-lg bg-m-red/10 flex items-center justify-center flex-shrink-0">
        <AlertTriangle size={15} className="text-m-red" />
      </div>
      <div>
        <p className="text-m-red font-semibold text-sm">Session Expired — Please Login Again</p>
        <p className="text-m-muted text-xs mt-1 leading-relaxed">
          Your Google session has expired. The scheduler has been paused.
        </p>
        <div className="mt-3 flex items-center gap-2 bg-m-bg rounded-lg px-3 py-2 border border-m-border w-fit">
          <Terminal size={12} className="text-m-blue" />
          <code className="text-xs font-mono text-m-blue">cd backend &amp;&amp; npm run setup-login</code>
        </div>
      </div>
    </div>
  )
}
