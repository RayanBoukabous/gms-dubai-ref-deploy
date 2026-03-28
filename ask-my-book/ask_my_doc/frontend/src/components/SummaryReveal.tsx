'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Sparkles, ArrowRight, MessageCircle, FileText, CheckCircle2,
} from 'lucide-react'

interface Props {
  fileName: string
  summary: string
  onEnterChat: () => void
}

export default function SummaryReveal({ fileName, summary, onEnterChat }: Props) {
  return (
    <div
      className="flex-1 flex flex-col min-h-0 overflow-hidden summary-reveal-root"
      style={{ background: 'var(--bg)' }}
    >
      {/* Ambient gradient */}
      <div className="pointer-events-none fixed inset-0 lg:left-72 overflow-hidden -z-10">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[min(900px,90vw)] h-64 rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.25), transparent 70%)' }}
        />
        <div
          className="absolute top-40 right-0 w-72 h-72 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.2), transparent)' }}
        />
      </div>

      <div className="flex-1 flex flex-col w-full min-h-0 px-4 sm:px-8 lg:px-12 xl:px-16 py-8 sm:py-10">
        {/* Status header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg summary-reveal-pop"
              style={{ background: 'linear-gradient(135deg,#059669,#10B981)' }}
            >
              <CheckCircle2 size={24} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase mb-0.5" style={{ color: 'var(--muted)' }}>
                Analysis complete
              </p>
              <h2
                className="text-xl sm:text-2xl font-bold leading-tight"
                style={{ fontFamily: 'var(--font-display), Georgia, serif', color: 'var(--text)' }}
              >
                AI document summary
              </h2>
            </div>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium self-start sm:self-auto"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
          >
            <FileText size={14} style={{ color: 'var(--primary)' }} />
            <span className="truncate max-w-[220px]">{fileName}</span>
          </div>
        </div>

        {/* Summary card */}
        <div
          className="flex-1 min-h-0 rounded-2xl border flex flex-col overflow-hidden summary-reveal-card"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: '0 25px 50px -12px rgba(15,23,42,0.12)',
          }}
        >
          <div
            className="px-4 sm:px-6 py-3 border-b flex items-center gap-2 shrink-0"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
          >
            <Sparkles size={16} style={{ color: 'var(--primary)' }} />
            <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--muted)' }}>
              Structured summary
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
            <div className="prose-chat text-sm leading-relaxed max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {summary}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-6 pb-2 shrink-0">
          <p className="text-center text-xs mb-4" style={{ color: 'var(--muted)' }}>
            The same summary is available in the sidebar — collapse anytime while you chat.
          </p>
          <button
            type="button"
            onClick={onEnterChat}
            className="group w-full sm:w-auto sm:min-w-[280px] mx-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-[15px] text-white transition-all duration-300 summary-reveal-cta"
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 55%, #6366F1 100%)',
              boxShadow: '0 12px 40px rgba(37,99,235,0.35)',
            }}
          >
            <MessageCircle size={20} className="opacity-90" />
            <span>Go to chat</span>
            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>
    </div>
  )
}
