"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { registerAPI } from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'
import {
  Lock, Mail, Loader2, BrainCircuit, GraduationCap,
  Eye, EyeOff, AlertCircle, ChevronRight, AtSign,
  Target, Layers, Telescope
} from 'lucide-react'

const BENEFITS = [
  { icon: GraduationCap, label: 'K–12 curriculum aligned'  },
  { icon: Target,        label: 'Precise, cited answers'   },
  { icon: Layers,        label: 'Multi-subject support'    },
  { icon: Telescope,     label: '7-day free trial included'},
]

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await registerAPI({ email, username, password })
      login(data.access_token, data.user)
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
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
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(rgba(79,70,229,0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
        <div className="absolute top-[-80px] left-[-60px] w-80 h-80 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #4F46E5, transparent)' }} />
        <div className="absolute bottom-[-80px] right-[-40px] w-64 h-64 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #2563EB, transparent)' }} />

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
            Start your<br />
            <span style={{ background: 'linear-gradient(90deg,#818CF8,#60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              learning journey.
            </span>
          </h2>
          <p className="text-sm leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Join thousands of students turning their textbooks into interactive AI tutors.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-3">
            {BENEFITS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 rounded-xl p-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(79,70,229,0.2)' }}>
                  <Icon size={13} style={{ color: '#818CF8' }} />
                </div>
                <p className="text-xs font-medium leading-tight" style={{ color: 'rgba(255,255,255,0.65)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

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
              Free account
            </p>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display), Georgia, serif', color: 'var(--text)' }}>
              Create your account
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
              Set up in seconds. No credit card required.
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

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>
                Username
              </label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--muted-2)' }} />
                <input
                  type="text" required value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="auth-input"
                  placeholder="johndoe"
                />
              </div>
            </div>

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
                  type={showPw ? 'text' : 'password'} required minLength={8} value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="auth-input pr-11"
                  placeholder="Min. 8 characters"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--muted-2)' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--muted-2)' }}>
                At least 8 characters — use a mix of letters and numbers.
              </p>
            </div>

            <button type="submit" disabled={loading} className="auth-btn mt-2">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
                : <><span>Create free account</span><ChevronRight size={15} /></>
              }
            </button>
          </form>

          <p className="text-[11px] text-center mt-4 leading-relaxed" style={{ color: 'var(--muted-2)' }}>
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>

          <div className="mt-6 text-center text-sm" style={{ color: 'var(--muted)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold transition-colors" style={{ color: 'var(--primary)' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
