"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { loginAPI } from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'
import {
  Lock, Mail, Loader2, BrainCircuit, GraduationCap,
  BookOpenCheck, Sparkles, Network, Eye, EyeOff, AlertCircle,
  ChevronRight
} from 'lucide-react'

const FEATURES = [
  { icon: BookOpenCheck, title: 'Document Intelligence', desc: 'Upload any PDF or TXT and unlock instant Q&A on its content.' },
  { icon: Sparkles,      title: 'AI-Powered Summaries', desc: 'Get concise, accurate summaries in seconds with GPT-4o.' },
  { icon: Network,       title: 'Knowledge Graph', desc: 'Cognee maps your document into a semantic knowledge graph.' },
  { icon: GraduationCap, title: 'Curriculum-Aligned', desc: 'Designed for CBSE, Kerala Board, and IB curricula.' },
]

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await loginAPI({ email, password })
      login(data.access_token, data.user)
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex" style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}>

      {/* ── Left panel ──────────────────────────────────────────── */}
      <div
        className="hidden lg:flex w-[44%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--sidebar)' }}
      >
        {/* Background grid pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(rgba(37,99,235,0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
        {/* Glow blobs */}
        <div className="absolute top-[-100px] right-[-60px] w-80 h-80 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #2563EB, transparent)' }} />
        <div className="absolute bottom-[-80px] left-[-40px] w-64 h-64 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #4F46E5, transparent)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
              <BrainCircuit size={20} color="white" />
            </div>
            <div>
              <p className="text-lg font-bold leading-none tracking-tight text-white"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>
                Ask My Book
              </p>
              <p className="text-[10px] tracking-widest uppercase mt-0.5"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                AI · Education
              </p>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-snug mb-3 text-white"
            style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>
            Every textbook<br />
            <span style={{ background: 'linear-gradient(90deg,#60A5FA,#818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              becomes a tutor.
            </span>
          </h2>
          <p className="text-sm leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Upload your course material and get curriculum-accurate answers in seconds — powered by LangGraph and Cognee.
          </p>

          {/* Feature list */}
          <div className="flex flex-col gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(37,99,235,0.18)', border: '1px solid rgba(37,99,235,0.3)' }}>
                  <Icon size={15} style={{ color: '#60A5FA' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">{title}</p>
                  <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <div className="h-px mb-4" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <p className="text-[10px] tracking-[0.12em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Powered by LangGraph · Cognee · OpenAI
          </p>
        </div>
      </div>

      {/* ── Right form ──────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-[380px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
              <BrainCircuit size={18} color="white" />
            </div>
            <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-display), Georgia, serif', color: 'var(--text)' }}>
              Ask My Book
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-bold tracking-[0.14em] uppercase mb-2" style={{ color: 'var(--muted)' }}>
              Welcome back
            </p>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display), Georgia, serif', color: 'var(--text)' }}>
              Sign in to your account
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
              Continue your learning journey where you left off.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl flex items-start gap-2.5 text-sm"
              style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-bdr)' }}>
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--muted-2)' }} />
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="auth-input"
                  placeholder="you@school.edu"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--muted-2)' }} />
                <input
                  type={showPw ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="auth-input pr-11"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--muted-2)' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-btn mt-1">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                : <><span>Sign in</span><ChevronRight size={15} /></>
              }
            </button>
          </form>

          <div className="mt-7 text-center text-sm" style={{ color: 'var(--muted)' }}>
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold transition-colors" style={{ color: 'var(--primary)' }}>
              Create one free
            </Link>
          </div>

          {/* Trust bar */}
          <div className="mt-10 pt-6 border-t flex items-center justify-center gap-5" style={{ borderColor: 'var(--border)' }}>
            {['Secure JWT', 'GPT-4o', 'CBSE Ready'].map(t => (
              <span key={t} className="text-[10px] font-semibold tracking-wide uppercase" style={{ color: 'var(--muted-2)' }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
