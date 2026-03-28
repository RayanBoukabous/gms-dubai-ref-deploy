'use client'

import { Loader2, Sparkles, FileText } from 'lucide-react'

interface Props {
  fileName: string
  text: string
}

/** Full-width live summary while tokens stream from the API */
export default function SummaryStreaming({ fileName, text }: Props) {
  const hasText = text.length > 0

  return (
    <div
      className="flex-1 flex flex-col min-h-0 w-full overflow-hidden"
      style={{ background: 'var(--bg)', animation: 'fadeIn 0.35s ease' }}
    >
      <div className="pointer-events-none fixed inset-0 lg:left-72 overflow-hidden -z-10">
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[min(1200px,100vw)] h-72 rounded-full opacity-35 blur-3xl"
          style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.28), transparent 70%)' }}
        />
      </div>

      <div className="w-full flex-1 flex flex-col min-h-0 px-4 sm:px-8 lg:px-12 xl:px-16 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 shrink-0 w-full">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg,#2563EB,#4F46E5)' }}
            >
              {hasText
                ? <Sparkles size={22} className="text-white animate-pulse" />
                : <Loader2 size={22} className="text-white animate-spin" />}
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase mb-0.5" style={{ color: 'var(--muted)' }}>
                Generating summary
              </p>
              <h2
                className="text-xl sm:text-2xl font-bold leading-tight"
                style={{ fontFamily: 'var(--font-display), Georgia, serif', color: 'var(--text)' }}
              >
                AI is reading your document…
              </h2>
            </div>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium max-w-full"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
          >
            <FileText size={14} style={{ color: 'var(--primary)' }} />
            <span className="truncate">{fileName}</span>
          </div>
        </div>

        <div
          className="flex-1 min-h-0 w-full rounded-2xl border flex flex-col overflow-hidden"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: '0 25px 50px -12px rgba(15,23,42,0.1)',
          }}
        >
          <div
            className="px-4 sm:px-6 py-3 border-b flex items-center gap-2 shrink-0"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--muted)' }}>
              Live stream
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-10 py-6">
            {!hasText ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16" style={{ color: 'var(--muted)' }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
                <p className="text-sm">Connecting to the model…</p>
              </div>
            ) : (
              <div
                className="text-sm leading-relaxed whitespace-pre-wrap font-[var(--font-body)]"
                style={{ color: 'var(--text)' }}
              >
                {text}
                <span className="inline-block w-0.5 h-4 ml-0.5 align-middle bg-primary animate-pulse rounded-sm" style={{ background: 'var(--primary)' }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
