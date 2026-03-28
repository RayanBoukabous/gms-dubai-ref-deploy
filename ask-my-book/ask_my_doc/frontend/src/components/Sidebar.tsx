// src/components/Sidebar.tsx
'use client'

import { useRef, useState, useEffect } from 'react'
import { useAppState } from '@/hooks/useAppState'
import { useAuth } from '@/lib/AuthContext'
import { uploadDocument, streamSummary, loadCognee } from '@/lib/api'
import type { TokenUsage } from '@/types'
import {
  CloudUpload, FileText, BrainCircuit, Trash2, ChevronDown, ChevronUp,
  Loader2, Sparkles, Network, LogOut, GraduationCap, ScrollText,
  BarChart3, CircleCheck, AlertCircle, FolderOpen
} from 'lucide-react'

export default function Sidebar() {
  const { state, dispatch } = useAppState()
  const { user, logout } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)

  const [uploading, setUploading]       = useState(false)
  const [showSummary, setShowSummary]   = useState(false)
  const [loadingCognee, setLoadingCognee] = useState(false)
  const [cogneeMsg, setCogneeMsg]       = useState('')
  const [cogneeOk, setCogneeOk]         = useState(false)
  const [error, setError]               = useState('')

  const { document: doc, messages, chatUnlocked, summaryStream } = state

  useEffect(() => {
    if (doc?.summary) setShowSummary(true)
  }, [doc?.summary])

  useEffect(() => {
    if (summaryStream !== null) setShowSummary(true)
  }, [summaryStream])

  useEffect(() => {
    if (chatUnlocked) setShowSummary(false)
  }, [chatUnlocked])

  const sessionTokens = messages
    .filter(m => m.role === 'assistant' && m.usage)
    .reduce((acc, m) => acc + (m.usage?.total_tokens ?? 0), 0)

  const lastUsage = [...messages]
    .reverse()
    .find(m => m.role === 'assistant' && m.usage)?.usage as TokenUsage | undefined

  async function handleFile(file: File) {
    setError(''); setUploading(true)
    try {
      const res = await uploadDocument(file)
      dispatch({
        type: 'SET_DOCUMENT',
        payload: { name: res.filename, text: res.document_text, summary: '', charCount: res.char_count, cogneeLoaded: false },
      })
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally { setUploading(false) }
  }

  async function handleSummarize() {
    if (!doc) return
    setError('')
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
          setShowSummary(true)
        },
      )
    } catch (e: unknown) {
      setError((e as Error).message)
      dispatch({ type: 'SUMMARY_STREAM_CANCEL' })
    }
  }

  async function handleCogneeLoad() {
    setLoadingCognee(true); setCogneeMsg(''); setCogneeOk(false)
    try {
      const res = await loadCognee()
      const entries = Object.entries(res.report ?? {})
      if (entries.length) {
        setCogneeMsg(entries.map(([k, v]) => `${v} ${k}`).join('\n'))
        setCogneeOk(true)
        dispatch({ type: 'SET_COGNEE', payload: true })
      } else {
        setCogneeMsg('No files found in /courses')
      }
    } catch (e: unknown) {
      setCogneeMsg(`Error: ${(e as Error).message}`)
    } finally { setLoadingCognee(false) }
  }

  const documentReady = !!doc?.summary

  return (
    <aside className="sidebar-shell w-72 shrink-0 h-screen flex flex-col overflow-y-auto">

      {/* ── Header / Logo ────────────────────────────────────── */}
      <div className="px-5 pt-7 pb-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
            <BrainCircuit size={18} color="white" />
          </div>
          <div>
            <p className="text-base font-bold leading-none tracking-tight text-white"
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>
              Ask My Book
            </p>
            <p className="text-[10px] mt-0.5 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
              AI Learning Platform
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px" style={{ background: 'linear-gradient(90deg,rgba(37,99,235,0.6),transparent)' }} />

        {/* User card */}
        {user && (
          <div className="sidebar-card mt-5 p-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 text-white"
                style={{ background: 'linear-gradient(135deg,#2563EB,#4F46E5)' }}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate leading-tight text-white">{user.username}</p>
                <p className="text-[11px] truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{user.email}</p>
              </div>
            </div>
            <button onClick={logout}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all duration-200"
              style={{ color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.07)' }}
              onMouseEnter={e => {
                const b = e.currentTarget
                b.style.color = '#F87171'; b.style.borderColor = 'rgba(248,113,113,0.3)'; b.style.background = 'rgba(220,38,38,0.08)'
              }}
              onMouseLeave={e => {
                const b = e.currentTarget
                b.style.color = 'rgba(255,255,255,0.35)'; b.style.borderColor = 'rgba(255,255,255,0.07)'; b.style.background = 'transparent'
              }}>
              <LogOut size={12} /> Sign out
            </button>
          </div>
        )}
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      <div className="px-4 flex flex-col gap-5 pb-8 flex-1">

        {/* Upload */}
        <section>
          <p className="sidebar-section-label mb-3 flex items-center gap-1.5">
            <FolderOpen size={10} /> Document
          </p>

          <div className="upload-zone p-5 text-center"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}>
            {uploading
              ? <Loader2 className="mx-auto mb-2.5 animate-spin" size={20} style={{ color: '#60A5FA' }} />
              : <CloudUpload size={20} className="mx-auto mb-2.5" style={{ color: '#60A5FA' }} />
            }
            <p className="text-xs font-semibold text-white">
              {uploading ? 'Reading file…' : 'PDF or TXT'}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Click or drag & drop
            </p>
          </div>
          <input ref={fileRef} type="file" accept=".pdf,.txt" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

          {error && (
            <div className="mt-2 px-3 py-2 rounded-lg flex items-start gap-2 text-[11px]"
              style={{ background: 'rgba(220,38,38,0.12)', color: '#F87171', border: '1px solid rgba(220,38,38,0.25)' }}>
              <AlertCircle size={12} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}
        </section>

        {/* Doc info card */}
        {doc && (
          <div className="sidebar-card p-3.5 flex items-start gap-2.5">
            <FileText size={15} className="mt-0.5 shrink-0" style={{ color: '#60A5FA' }} />
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate text-white">{doc.name}</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {doc.charCount.toLocaleString()} characters
              </p>
              {doc.cogneeLoaded && (
                <p className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: '#34D399' }}>
                  <Network size={11} /> Knowledge graph active
                </p>
              )}
            </div>
          </div>
        )}

        {/* Analyze button */}
        {doc && !documentReady && (
          <button
            className="btn-blue"
            onClick={handleSummarize}
            disabled={summaryStream !== null}
          >
            {summaryStream !== null
              ? <><Loader2 size={14} className="animate-spin" /> Analyzing…</>
              : <><Sparkles size={14} /> Analyze Document</>
            }
          </button>
        )}

        {/* Live summary stream (synced with main panel) */}
        {summaryStream !== null && (
          <div className="sidebar-card p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Live preview
            </p>
            {summaryStream.length === 0 ? (
              <div className="flex items-center gap-2 text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <Loader2 size={12} className="animate-spin shrink-0" />
                Connecting…
              </div>
            ) : (
              <p className="text-[11px] leading-relaxed line-clamp-6 cursor-blink"
                style={{ color: 'rgba(255,255,255,0.55)' }}>
                {summaryStream}
              </p>
            )}
          </div>
        )}

        {/* Summary + Cognee */}
        {documentReady && (
          <>
            {/* Summary toggle */}
            <button
              onClick={() => setShowSummary(v => !v)}
              className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{ background: 'rgba(37,99,235,0.14)', color: '#93C5FD', border: '1px solid rgba(37,99,235,0.25)' }}>
              <span className="flex items-center gap-1.5"><ScrollText size={12} /> AI Summary</span>
              {showSummary ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {showSummary && (
              <div className="sidebar-card p-3 max-h-44 overflow-y-auto"
                style={{ animation: 'fadeIn 0.3s ease' }}>
                <p className="text-[11px] leading-relaxed whitespace-pre-wrap"
                  style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {doc.summary}
                </p>
              </div>
            )}

            {/* Cognee */}
            <button className="btn-ghost-sidebar text-xs" onClick={handleCogneeLoad} disabled={loadingCognee}>
              {loadingCognee
                ? <><Loader2 size={12} className="animate-spin" /> Building graph…</>
                : <><Network size={12} /> {doc.cogneeLoaded ? 'Refresh Knowledge Graph' : 'Load Knowledge Graph'}</>
              }
            </button>

            {cogneeMsg && (
              <div className="px-3 py-2.5 rounded-xl text-[11px] whitespace-pre-wrap flex items-start gap-2"
                style={{
                  background: cogneeOk ? 'rgba(5,150,105,0.1)' : 'rgba(220,38,38,0.1)',
                  color: cogneeOk ? '#34D399' : '#F87171',
                  border: `1px solid ${cogneeOk ? 'rgba(5,150,105,0.25)' : 'rgba(220,38,38,0.25)'}`,
                }}>
                {cogneeOk ? <CircleCheck size={12} className="mt-0.5 shrink-0" /> : <AlertCircle size={12} className="mt-0.5 shrink-0" />}
                {cogneeMsg}
              </div>
            )}
          </>
        )}

        {/* Divider */}
        <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* Token stats */}
        <section>
          <p className="sidebar-section-label mb-3 flex items-center gap-1.5">
            <BarChart3 size={10} /> Usage
          </p>

          {lastUsage ? (
            <div className="sidebar-card p-3.5 space-y-3">
              <p className="sidebar-section-label">Last request</p>
              <div className="grid grid-cols-2 gap-2">
                <TokenChip label="Input"  value={lastUsage.input_tokens.toLocaleString()} />
                <TokenChip label="Output" value={lastUsage.output_tokens.toLocaleString()} />
                <TokenChip label="Total"  value={lastUsage.total_tokens.toLocaleString()} wide />
              </div>
            </div>
          ) : (
            <p className="text-[11px] italic" style={{ color: 'rgba(255,255,255,0.2)' }}>
              No requests yet.
            </p>
          )}

          {sessionTokens > 0 && (
            <div className="sidebar-card p-3.5 mt-2 space-y-2">
              <p className="sidebar-section-label">Session total</p>
              <TokenChip label="Tokens used" value={sessionTokens.toLocaleString()} wide />
            </div>
          )}
        </section>

        {/* Clear chat */}
        {messages.length > 0 && (
          <>
            <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <button className="btn-danger-ghost" onClick={() => dispatch({ type: 'CLEAR_MESSAGES' })}>
              <Trash2 size={12} /> Clear conversation
            </button>
          </>
        )}
      </div>
    </aside>
  )
}

function TokenChip({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`token-chip ${wide ? 'col-span-2' : ''}`}>
      <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
        {label}
      </p>
      <p className="text-sm font-bold" style={{ color: '#93C5FD', fontFamily: 'var(--font-display), Georgia, serif' }}>
        {value}
      </p>
    </div>
  )
}
