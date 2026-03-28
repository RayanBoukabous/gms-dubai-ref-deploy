// src/components/ChatArea.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useAppState } from '@/hooks/useAppState'
import { streamChat, uploadDocument, streamSummary } from '@/lib/api'
import { nanoid } from '@/lib/nanoid'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import SummaryReveal from './SummaryReveal'
import SummaryStreaming from './SummaryStreaming'
import type { RouteType, TokenUsage } from '@/types'
import {
  BrainCircuit, CloudUpload, ScanSearch, MessageSquareDot, FileText, Sparkles,
  Loader2, AlertCircle
} from 'lucide-react'

const STEPS = [
  {
    icon: CloudUpload,
    num: '01',
    title: 'Upload Document',
    desc: 'Drop a PDF or TXT here or in the sidebar — whichever feels easier.',
    color: '#2563EB',
    bg: 'rgba(37,99,235,0.08)',
    bdr: 'rgba(37,99,235,0.15)',
  },
  {
    icon: ScanSearch,
    num: '02',
    title: 'Analyze Content',
    desc: 'AI reads and maps your document into a knowledge graph.',
    color: '#4F46E5',
    bg: 'rgba(79,70,229,0.08)',
    bdr: 'rgba(79,70,229,0.15)',
  },
  {
    icon: MessageSquareDot,
    num: '03',
    title: 'Ask Questions',
    desc: 'Chat naturally. Get precise, curriculum-aligned answers.',
    color: '#059669',
    bg: 'rgba(5,150,105,0.08)',
    bdr: 'rgba(5,150,105,0.15)',
  },
]

export default function ChatArea() {
  const { state, dispatch } = useAppState()
  const { document: doc, messages, chatUnlocked, summaryStream } = state
  const [streamingId, setStreamingId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [uploading, setUploading]     = useState(false)
  const [uploadError, setUploadError] = useState('')

  async function handleFile(file: File) {
    setUploadError('')
    setUploading(true)
    try {
      const res = await uploadDocument(file)
      dispatch({
        type: 'SET_DOCUMENT',
        payload: {
          name: res.filename,
          text: res.document_text,
          summary: '',
          charCount: res.char_count,
          cogneeLoaded: false,
        },
      })
    } catch (e: unknown) {
      setUploadError((e as Error).message)
    } finally {
      setUploading(false)
    }
  }

  async function handleSummarize() {
    if (!doc) return
    setUploadError('')
    dispatch({ type: 'SUMMARY_STREAM_START' })
    let full = ''
    try {
      await streamSummary(
        doc.text,
        chunk => {
          full += chunk
          dispatch({ type: 'SUMMARY_STREAM_UPDATE', payload: full })
        },
        () => {
          dispatch({ type: 'SET_SUMMARY', payload: full })
        },
      )
    } catch (e: unknown) {
      setUploadError((e as Error).message)
      dispatch({ type: 'SUMMARY_STREAM_CANCEL' })
    }
  }

  const documentReady = !!doc?.summary

  async function handleSend(query: string) {
    if (!documentReady || streamingId) return

    const userId = nanoid()
    dispatch({ type: 'ADD_USER_MESSAGE', payload: { id: userId, content: query } })

    const assistantId = nanoid()
    dispatch({ type: 'ADD_ASSISTANT_MESSAGE', payload: { id: assistantId } })
    setStreamingId(assistantId)

    const history = messages.map(m => ({ role: m.role, content: m.content }))

    try {
      await streamChat(
        { query, documentText: doc!.text, documentSummary: doc!.summary, history },
        route  => dispatch({ type: 'SET_ROUTE', payload: { id: assistantId, route: route as RouteType } }),
        chunk  => dispatch({ type: 'APPEND_CHUNK', payload: { id: assistantId, chunk } }),
        usage  => { dispatch({ type: 'SET_USAGE', payload: { id: assistantId, usage: usage as unknown as TokenUsage } }); setStreamingId(null) },
      )
    } catch (e) {
      dispatch({ type: 'APPEND_CHUNK', payload: { id: assistantId, chunk: `\n\n❌ Error: ${(e as Error).message}` } })
      setStreamingId(null)
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (chatUnlocked) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatUnlocked])

  /* ── Live summary stream (full width) ───────────────────── */
  if (summaryStream !== null && doc) {
    return (
      <SummaryStreaming fileName={doc.name} text={summaryStream} />
    )
  }

  /* ── Empty state ────────────────────────────────────────── */
  if (!documentReady) {
    const hasFileNoSummary = !!doc && !doc.summary

    return (
      <div
        className="flex-1 flex flex-col w-full min-w-0 items-stretch justify-center px-4 sm:px-8 lg:px-12 xl:px-16 py-12 sm:py-16 text-center overflow-y-auto"
        style={{ background: 'var(--bg)', animation: 'fadeIn 0.5s ease' }}
      >
        {/* Hero */}
        <div className="mb-8 w-full">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg"
            style={{ background: 'linear-gradient(135deg,#2563EB,#4F46E5)' }}>
            <BrainCircuit size={28} color="white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-3"
            style={{ fontFamily: 'var(--font-display), Georgia, serif', color: 'var(--text)' }}>
            Your document,<br />
            <span style={{ background: 'linear-gradient(90deg,#2563EB,#4F46E5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              your AI tutor.
            </span>
          </h1>
          <p className="text-base sm:text-lg w-full max-w-none mx-auto leading-relaxed" style={{ color: 'var(--muted)' }}>
            Upload any PDF or TXT below or in the sidebar, let AI analyze it, then ask anything — from a chapter summary to complex concept explanations.
          </p>
        </div>

        {/* Central upload OR analyze CTA */}
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
        />

        {!hasFileNoSummary ? (
          <div
            className="w-full mb-10 rounded-2xl border-2 border-dashed px-6 sm:px-10 py-12 cursor-pointer transition-all duration-200 group"
            style={{
              borderColor: 'var(--border-strong)',
              background: 'var(--surface)',
              boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
            }}
            onClick={() => !uploading && fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
            onDrop={e => {
              e.preventDefault()
              e.stopPropagation()
              const f = e.dataTransfer.files[0]
              if (f) handleFile(f)
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.borderColor = 'var(--primary)'
              el.style.background = 'var(--primary-light)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.borderColor = 'var(--border-strong)'
              el.style.background = 'var(--surface)'
            }}
          >
            {uploading ? (
              <Loader2 className="mx-auto mb-4 w-10 h-10 animate-spin" style={{ color: 'var(--primary)' }} />
            ) : (
              <CloudUpload className="mx-auto mb-4 w-10 h-10 transition-transform group-hover:scale-105" style={{ color: 'var(--primary)' }} />
            )}
            <p className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>
              {uploading ? 'Reading your file…' : 'Drop your document here'}
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              or <span className="font-semibold" style={{ color: 'var(--primary)' }}>click to browse</span> — PDF or TXT, up to your server limit
            </p>
            <div className="inline-flex items-center gap-2 text-[11px] font-medium px-3 py-1.5 rounded-full"
              style={{ background: 'var(--bg)', color: 'var(--muted-2)', border: '1px solid var(--border)' }}>
              <FileText size={12} /> Same upload as the sidebar — pick what feels natural
            </div>
          </div>
        ) : (
          <div className="w-full mb-10 rounded-2xl px-6 sm:px-10 py-8 text-left"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--primary-light)' }}>
                <FileText size={22} style={{ color: 'var(--primary)' }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--muted-2)' }}>Ready to analyze</p>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{doc.name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{doc.charCount.toLocaleString()} characters</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSummarize}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200"
              style={{
                background: 'var(--primary)',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
              }}
            >
              <Sparkles size={16} /> Analyze document
            </button>
            <button
              type="button"
              className="mt-4 text-xs font-medium w-full text-center underline-offset-2 hover:underline"
              style={{ color: 'var(--muted)' }}
              onClick={() => dispatch({ type: 'CLEAR_DOCUMENT' })}
            >
              Upload a different file
            </button>
          </div>
        )}

        {uploadError && (
          <div className="w-full mb-6 -mt-4 px-4 py-3 rounded-xl flex items-start gap-2 text-sm text-left"
            style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-bdr)' }}>
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            {uploadError}
          </div>
        )}

        {/* Step cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full mb-10">
          {STEPS.map((s, i) => (
            <div key={s.num} className="step-card"
              style={{ animation: `slideUp 0.4s ease ${i * 0.1}s both` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: s.bg, border: `1px solid ${s.bdr}` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--muted-2)' }}>
                Step {s.num}
              </div>
              <p className="text-sm font-semibold mb-1.5" style={{ color: 'var(--text)' }}>{s.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom tag */}
        <div className="w-full flex justify-center shrink-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <Sparkles size={13} style={{ color: 'var(--primary)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
              Powered by GPT-4o · LangGraph · Cognee
            </span>
          </div>
        </div>
      </div>
    )
  }

  /* ── Full-page summary reveal (before chat) ─────────────── */
  if (!chatUnlocked) {
    return (
      <SummaryReveal
        fileName={doc!.name}
        summary={doc!.summary}
        onEnterChat={() => dispatch({ type: 'UNLOCK_CHAT' })}
      />
    )
  }

  /* ── Chat view ──────────────────────────────────────────── */
  return (
    <div className="flex-1 flex flex-col min-h-0 chat-view-enter" style={{ background: 'var(--bg)', animation: 'fadeIn 0.4s ease' }}>

      {/* Header */}
      <div className="px-6 py-3.5 border-b flex items-center gap-3"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--primary-light)' }}>
          <FileText size={15} style={{ color: 'var(--primary)' }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate leading-tight" style={{ color: 'var(--text)' }}>
            {doc.name}
          </p>
          <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
            Ask anything about this document
          </p>
        </div>
        {doc.cogneeLoaded && (
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0"
            style={{ background: 'rgba(5,150,105,0.08)', color: '#059669', border: '1px solid rgba(5,150,105,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Knowledge Graph
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
        {messages.length === 0 && (
          <div className="text-center mt-12" style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <BrainCircuit size={13} style={{ color: 'var(--primary)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                Document ready — ask your first question
              </span>
            </div>
          </div>
        )}
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} isStreaming={msg.id === streamingId} />
        ))}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={!documentReady || !!streamingId} />
    </div>
  )
}
