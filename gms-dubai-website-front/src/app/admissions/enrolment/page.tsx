'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

/* ─── Types ────────────────────────────────────────────── */
type RegisterResult = {
  status: string
  face_id: string
  short_id: string
  image_path?: string
  qr_code_path: string
  message?: string
}

const PROFILE_OPTIONS = ['Student', 'Staff', 'Guardian', 'Admin'] as const
type Profile = (typeof PROFILE_OPTIONS)[number]

/* ─── Grade data ────────────────────────────────────────── */
const GRADE_GROUPS = [
  { label: 'Kindergarten', grades: ['KG1', 'KG2'] },
  { label: 'Primary (1–5)', grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'] },
  { label: 'Middle School (6–9)', grades: ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'] },
  { label: 'High School (10–12)', grades: ['Grade 10', 'Grade 11', 'Grade 12'] },
] as const

const ALL_GRADES = GRADE_GROUPS.flatMap((g) => g.grades)
const CURRICULA = ['CBSE', 'KB'] as const
const STREAMS = ['Science', 'Commerce', 'Humanities'] as const

const needsCurriculum = (g: string) => ['Grade 10', 'Grade 11', 'Grade 12'].includes(g)
const needsStream = (g: string) => ['Grade 11', 'Grade 12'].includes(g)

/* ─── Profile cards meta ───────────────────────────────── */
const PROFILE_CARDS: { id: Profile; label: string; desc: string; svg: React.ReactNode }[] = [
  {
    id: 'Student',
    label: 'Student',
    desc: 'Enrol as a school student',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    id: 'Staff',
    label: 'Staff',
    desc: 'School staff member',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    id: 'Guardian',
    label: 'Parent / Guardian',
    desc: 'Parent or legal guardian',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'Admin',
    label: 'Admin',
    desc: 'Administrative staff',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
]

/* ─── Step config ───────────────────────────────────────── */
function getSteps(profile: Profile): string[] {
  if (profile === 'Student') return ['Identity', 'Academic Program', 'Review & Submit']
  return ['Identity', 'Review & Submit']
}

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

/* ─── Component ─────────────────────────────────────────── */
export default function EnrolmentPage() {
  const [step, setStep] = useState(1)
  const [dir, setDir] = useState<'fwd' | 'bwd'>('fwd')
  const [animKey, setAnimKey] = useState(0)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<RegisterResult | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [profile, setProfile] = useState<Profile>('Student')

  const [grade, setGrade] = useState<string>(ALL_GRADES[0])
  const [curriculum, setCurriculum] = useState<string>('CBSE')
  const [stream, setStream] = useState<string>('Science')

  const [parentEmail, setParentEmail] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [matricule, setMatricule] = useState('')
  const [classNameOpt, setClassNameOpt] = useState('')

  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const recaptchaWidgetIdRef = useRef<number | null>(null)
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)

  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ''
  const skipRecaptcha = process.env.NEXT_PUBLIC_SKIP_RECAPTCHA === 'true'

  const steps = getSteps(profile)
  const totalSteps = steps.length
  const isLastStep = step === totalSteps

  /* Preview URL */
  useEffect(() => {
    if (!file) { setPreviewUrl(null); return }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  /* reCAPTCHA init — depends on `step` so the effect re-runs when the user
     reaches the last step (the container div only exists at that point).      */
  useEffect(() => {
    if (skipRecaptcha || !recaptchaLoaded || !recaptchaSiteKey || !recaptchaContainerRef.current) return
    const gc = (window as any).grecaptcha
    if (!gc || typeof gc.render !== 'function' || recaptchaWidgetIdRef.current !== null) return
    recaptchaWidgetIdRef.current = gc.render(recaptchaContainerRef.current, {
      sitekey: recaptchaSiteKey,
      callback: (t: string) => setRecaptchaToken(t),
      'expired-callback': () => setRecaptchaToken(''),
      'error-callback': () => setRecaptchaToken(''),
    })
  }, [skipRecaptcha, recaptchaLoaded, recaptchaSiteKey, step])

  /* Navigate — reset widget ID so reCAPTCHA re-renders if user goes back then forward */
  const navigate = (d: 'fwd' | 'bwd') => {
    setError(null)
    setDir(d)
    setAnimKey((k) => k + 1)
    recaptchaWidgetIdRef.current = null
    setRecaptchaToken('')
    setStep((s) => (d === 'fwd' ? s + 1 : s - 1))
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!file) return 'Please upload a face photo (JPG or PNG).'
      if (!firstName.trim()) return 'First name is required.'
      if (!lastName.trim()) return 'Last name is required.'
    }
    if (step === 2 && profile === 'Student') {
      if (needsCurriculum(grade) && !curriculum) return 'Please select a curriculum.'
      if (needsStream(grade) && !stream) return 'Please select a stream.'
    }
    return null
  }

  const handleNext = () => {
    const err = validateStep()
    if (err) { setError(err); return }
    navigate('fwd')
  }

  /* Reset reCAPTCHA widget so the user can tick it again after any error */
  const resetCaptcha = () => {
    if (skipRecaptcha) return
    const gc = (window as any).grecaptcha
    if (gc && recaptchaWidgetIdRef.current !== null) {
      gc.reset(recaptchaWidgetIdRef.current)
    }
    setRecaptchaToken('')
  }

  const onSubmit = async () => {
    setError(null)
    setResult(null)
    if (!skipRecaptcha) {
      if (!recaptchaSiteKey) { setError('Captcha not configured. Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY.'); return }
      if (!recaptchaToken) { setError('Please complete the captcha verification.'); return }
    }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file!)
      fd.append('first_name', firstName.trim())
      fd.append('last_name', lastName.trim())
      fd.append('profile', profile)
      if (!skipRecaptcha) fd.append('recaptcha_token', recaptchaToken)
      if (parentEmail.trim()) fd.append('parent_email', parentEmail.trim())
      if (parentPhone.trim()) fd.append('parent_phone', parentPhone.trim())
      if (matricule.trim()) fd.append('matricule', matricule.trim())
      if (classNameOpt.trim()) fd.append('class_name', classNameOpt.trim())
      if (profile === 'Student') {
        fd.append('grade', grade)
        if (needsCurriculum(grade)) fd.append('curriculum', curriculum)
        if (needsStream(grade)) fd.append('stream', stream)
      }

      const res = await fetch('/api/register', { method: 'POST', body: fd })
      const data = (await res.json().catch(() => null)) as RegisterResult | null

      if (!res.ok) {
        const msg = data?.message ?? 'Registration failed.'
        const detail = (data as any)?.detail ? ` — ${String((data as any).detail)}` : ''
        setError(msg + detail)
        resetCaptcha()
        return
      }
      setResult(data)
    } catch (e) {
      setError(String(e))
      resetCaptcha()
    } finally {
      setLoading(false)
    }
  }

  /* ─── Render ──────────────────────────────────────────── */
  return (
    <div>
      {!skipRecaptcha && (
        <Script
          src="https://www.google.com/recaptcha/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => setRecaptchaLoaded(true)}
        />
      )}

      {/* ════ SCREEN ════ */}
      <div className="enrolment-no-print">

        {/* Hero */}
        <div className="enrl-hero">
          <div className="enrl-hero-deco enrl-hero-deco1" />
          <div className="enrl-hero-deco enrl-hero-deco2" />
          <div className="enrl-hero-deco enrl-hero-deco3" />
          <div className="enrl-hero-inner">
            <div className="breadcrumb">Home <span>›</span> Admissions <span>›</span> Enrolment</div>
            <h1 className="enrl-hero-title">Online Registration</h1>
            <p className="enrl-hero-sub">Face registration · Secure · Step by step</p>
          </div>
        </div>

        <div className="enrl-outer">

          {/* Stepper timeline */}
          <div className="enrl-stepper-card" ref={cardRef}>
            <div className="enrl-stepper">
              {steps.map((label, i) => {
                const n = i + 1
                const active = step === n
                const done = step > n
                return (
                  <div key={label} className="enrl-step-item-wrap">
                    <div className="enrl-step-item">
                      <div className={`enrl-step-dot${active ? ' is-active' : ''}${done ? ' is-done' : ''}`}>
                        {done ? <CheckIcon /> : n}
                      </div>
                      <div className={`enrl-step-label${active ? ' is-active' : ''}${done ? ' is-done' : ''}`}>{label}</div>
                    </div>
                    {i < totalSteps - 1 && (
                      <div className={`enrl-step-connector${done ? ' is-done' : ''}`} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Progress bar */}
            <div className="enrl-progress-track">
              <div
                className="enrl-progress-fill"
                style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* Form card */}
          <div className="enrl-card">

            {/* ── SUCCESS ── */}
            {result?.status === 'success' ? (
              <div className="enrl-success">
                <div className="enrl-success-ring">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="enrl-success-title">Registration Successful!</h2>
                <p className="enrl-success-sub">Your face has been enrolled in the system.</p>

                <div className="enrolment-result-grid">
                  <div className="enrolment-result-card enrolment-qr-card">
                    <div className="enrolment-result-card-title">QR Code</div>
                    {result.qr_code_path
                      ? <img className="enrolment-qr-img" src={result.qr_code_path} alt="QR code" />
                      : <div className="enrolment-muted">No QR returned.</div>
                    }
                    <div className="enrolment-qr-shortid">
                      <span className="enrolment-qr-shortid-label">Short ID</span>
                      <code className="enrolment-qr-shortid-code">{result.short_id}</code>
                    </div>
                  </div>

                  <div className="enrolment-result-card enrolment-ids-card">
                    <div className="enrolment-result-card-title">Your IDs</div>
                    <div className="enrolment-id-row">
                      <div className="enrolment-id-label">face_id</div>
                      <div className="enrolment-id-value">{result.face_id}</div>
                    </div>
                    <div className="enrolment-id-row">
                      <div className="enrolment-id-label">short_id</div>
                      <div className="enrolment-id-value">{result.short_id}</div>
                    </div>
                    {result.image_path && (
                      <div className="enrolment-face-thumb">
                        <img src={result.image_path} alt="Registered face" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="enrolment-actions" style={{ marginTop: 24 }}>
                  <button type="button" className="btn-outline-blue" onClick={() => window.print()}>
                    Print Badge
                  </button>
                </div>
              </div>

            ) : (
              <>
                {/* Step header */}
                <div className="enrl-card-header">
                  <div className="enrl-card-step-badge">Step {step} of {totalSteps}</div>
                  <h2 className="enrl-card-title">{steps[step - 1]}</h2>
                </div>

                {/* ──── Step content (animated) ──── */}
                <div key={animKey} className={`enrl-step-content enrl-anim-${dir}`}>

                  {/* ━━ STEP 1: IDENTITY ━━ */}
                  {step === 1 && (
                    <div className="enrl-identity">

                      {/* Photo upload */}
                      <div className="enrl-photo-wrap">
                        <div className="enrl-photo-label">Face Photo <span className="required">*</span></div>
                        <label className="enrl-photo-drop" htmlFor="face-upload">
                          {previewUrl ? (
                            <>
                              <img src={previewUrl} alt="Preview" className="enrl-photo-preview-img" />
                              <div className="enrl-photo-overlay">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                <span>Change photo</span>
                              </div>
                            </>
                          ) : (
                            <div className="enrl-photo-empty">
                              <div className="enrl-photo-icon-circle">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(13,27,62,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                </svg>
                              </div>
                              <div className="enrl-photo-hint">Click to upload face photo</div>
                              <div className="enrl-photo-hint-sub">JPG or PNG · Clear frontal photo required</div>
                            </div>
                          )}
                        </label>
                        <input id="face-upload" type="file" accept="image/png,image/jpeg" className="enrl-file-hidden"
                          onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                      </div>

                      {/* Name */}
                      <div className="form-grid-2 enrl-name-grid">
                        <div className="form-group">
                          <label>First Name <span className="required">*</span></label>
                          <input type="text" placeholder="e.g. John" value={firstName}
                            onChange={(e) => setFirstName(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Last Name <span className="required">*</span></label>
                          <input type="text" placeholder="e.g. Smith" value={lastName}
                            onChange={(e) => setLastName(e.target.value)} />
                        </div>
                      </div>

                      {/* Profile selection */}
                      <div className="enrl-section-label">I am registering as a… <span className="required">*</span></div>
                      <div className="enrl-profile-grid">
                        {PROFILE_CARDS.map(({ id, label, desc, svg }) => (
                          <button
                            key={id} type="button"
                            className={`enrl-profile-card${profile === id ? ' selected' : ''}`}
                            onClick={() => setProfile(id)}
                          >
                            <div className="enrl-profile-icon">{svg}</div>
                            <div className="enrl-profile-name">{label}</div>
                            <div className="enrl-profile-desc">{desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ━━ STEP 2: ACADEMIC (Student only) ━━ */}
                  {step === 2 && profile === 'Student' && (
                    <div className="enrl-academic">
                      <div className="enrl-section-label">Select Grade <span className="required">*</span></div>
                      <div className="enrl-grade-groups">
                        {GRADE_GROUPS.map((group) => (
                          <div key={group.label} className="enrl-grade-group">
                            <div className="enrl-grade-group-label">{group.label}</div>
                            <div className="enrl-grade-pills">
                              {group.grades.map((g) => (
                                <button
                                  key={g} type="button"
                                  className={`enrl-grade-pill${grade === g ? ' selected' : ''}${needsCurriculum(g) ? ' needs-more' : ''}`}
                                  onClick={() => setGrade(g)}
                                >
                                  {g}
                                  {needsCurriculum(g) && <span className="enrl-grade-pill-star">+</span>}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {needsCurriculum(grade) && (
                        <div className="enrl-conditional-row">
                          <div className="enrl-section-label">Curriculum <span className="required">*</span></div>
                          <div className="enrl-choice-pills">
                            {CURRICULA.map((c) => (
                              <button key={c} type="button"
                                className={`enrl-choice-pill${curriculum === c ? ' selected' : ''}`}
                                onClick={() => setCurriculum(c)}
                              >
                                {c === 'KB' ? 'Kerala Board (KB)' : c}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {needsStream(grade) && (
                        <div className="enrl-conditional-row">
                          <div className="enrl-section-label">Stream <span className="required">*</span></div>
                          <div className="enrl-choice-pills">
                            {STREAMS.map((s) => (
                              <button key={s} type="button"
                                className={`enrl-choice-pill${stream === s ? ' selected' : ''}`}
                                onClick={() => setStream(s)}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ━━ LAST STEP: REVIEW + DETAILS ━━ */}
                  {isLastStep && (
                    <div className="enrl-review">
                      {/* Summary card */}
                      <div className="enrl-summary-card">
                        <div className="enrl-summary-title">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                          Registration Summary
                        </div>
                        <div className="enrl-summary-grid">
                          <div className="enrl-summary-row">
                            <span className="enrl-summary-key">Full Name</span>
                            <span className="enrl-summary-val">{firstName} {lastName}</span>
                          </div>
                          <div className="enrl-summary-row">
                            <span className="enrl-summary-key">Profile</span>
                            <span className="enrl-summary-val enrl-summary-badge">{profile}</span>
                          </div>
                          {profile === 'Student' && (
                            <>
                              <div className="enrl-summary-row">
                                <span className="enrl-summary-key">Grade</span>
                                <span className="enrl-summary-val">{grade}</span>
                              </div>
                              {needsCurriculum(grade) && (
                                <div className="enrl-summary-row">
                                  <span className="enrl-summary-key">Curriculum</span>
                                  <span className="enrl-summary-val">{curriculum}</span>
                                </div>
                              )}
                              {needsStream(grade) && (
                                <div className="enrl-summary-row">
                                  <span className="enrl-summary-key">Stream</span>
                                  <span className="enrl-summary-val">{stream}</span>
                                </div>
                              )}
                            </>
                          )}
                          <div className="enrl-summary-row">
                            <span className="enrl-summary-key">Face Photo</span>
                            <span className={`enrl-summary-val ${file ? 'enrl-ok' : 'enrl-missing'}`}>
                              {file ? `✓ ${file.name}` : '✗ Not uploaded'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Optional fields */}
                      <div className="enrl-section-label enrl-optional-label">
                        Optional Details
                        <span className="enrl-opt-badge">All optional</span>
                      </div>
                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>Parent Email</label>
                          <input type="email" placeholder="email@example.com" value={parentEmail}
                            onChange={(e) => setParentEmail(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Parent Phone</label>
                          <input type="tel" placeholder="+971 …" value={parentPhone}
                            onChange={(e) => setParentPhone(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Matricule</label>
                          <input type="text" placeholder="ID number" value={matricule}
                            onChange={(e) => setMatricule(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Class / Section</label>
                          <input type="text" placeholder="e.g. 6A, Section Red" value={classNameOpt}
                            onChange={(e) => setClassNameOpt(e.target.value)} />
                        </div>
                      </div>

                      {/* reCAPTCHA */}
                      {!skipRecaptcha ? (
                        <div className="enrolment-captcha-wrap">
                          <div className="enrolment-captcha-title">Security Verification</div>
                          {recaptchaSiteKey
                            ? <div ref={recaptchaContainerRef} />
                            : <div className="enrolment-captcha-missing">Missing reCAPTCHA site key. Set <code>NEXT_PUBLIC_RECAPTCHA_SITE_KEY</code>.</div>
                          }
                        </div>
                      ) : (
                        <div className="enrl-captcha-skip">
                          reCAPTCHA disabled for testing (<code>NEXT_PUBLIC_SKIP_RECAPTCHA=true</code>).
                        </div>
                      )}

                      <p className="enrl-disclaimer">
                        By submitting, you confirm the uploaded image and details are accurate. Submission does not guarantee admission.
                      </p>
                    </div>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div className="enrl-error-box" role="alert">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                  </div>
                )}

                {/* Navigation */}
                <div className="enrl-nav">
                  {step > 1
                    ? <button type="button" className="enrl-btn-back" onClick={() => navigate('bwd')}>← Back</button>
                    : <div />
                  }
                  {isLastStep ? (
                    <button type="button" className="enrl-btn-submit" disabled={loading} onClick={() => void onSubmit()}>
                      {loading
                        ? <><span className="enrl-spinner" /> Submitting…</>
                        : 'Submit Registration →'
                      }
                    </button>
                  ) : (
                    <button type="button" className="enrl-btn-next" onClick={handleNext}>
                      Continue →
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ════ PRINT BADGE (unchanged) ════ */}
      {result?.status === 'success' && (
        <div className="enrolment-print" aria-hidden="true">
          <div className="enrolment-badge">
            <div className="enrolment-badge-top">
              <div className="enrolment-badge-brand">
                <img className="enrolment-badge-logo" src="/logo.jpg" alt="Gulf Model School logo" />
                <div className="enrolment-badge-brand-text">
                  <div className="enrolment-badge-pretitle">DIGITAL DISCOVERY</div>
                  <div className="enrolment-badge-title">GULF MODEL SCHOOL</div>
                </div>
              </div>
              <div className="enrolment-badge-subtitle">ONLINE REGISTRATION</div>
            </div>
            <div className="enrolment-badge-qr-area">
              {result.qr_code_path && <img className="enrolment-badge-qr" src={result.qr_code_path} alt="QR code" />}
              <div className="enrolment-badge-shortid">
                <div className="enrolment-badge-shortid-label">Short ID</div>
                <div className="enrolment-badge-shortid-code">{result.short_id ?? ''}</div>
              </div>
            </div>
            <div className="enrolment-badge-bottom">
              <div className="enrolment-badge-confidential">CONFIDENTIAL — DO NOT SHARE THIS DOCUMENT</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
