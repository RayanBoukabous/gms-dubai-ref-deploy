'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useModal } from '@/components/layout/AppShell'
import SchoolIcon from '@/components/ui/SchoolIcon'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8001'

interface NewsDetailProps {
  slug: string
}

interface NewsArticleDetail {
  id: number
  title: string
  slug: string
  category_label: string
  emoji: string
  excerpt: string
  body: string
  image: string | null
  published_at: string | null
  updated_at: string
}

export function NewsDetailPage({ slug }: NewsDetailProps) {
  const router = useRouter()
  const [article, setArticle] = useState<NewsArticleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    fetch(`${API_BASE}/api/v1/news/${encodeURIComponent(slug)}/`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setArticle(data)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [slug])

  if (loading) {
    return (
      <div>
        <div className="page-banner">
          <div className="breadcrumb">Home <span>›</span> News & Events</div>
          <h1>News & Events</h1>
          <p>Loading…</p>
        </div>
        <section>
          <div className="section-inner" style={{ textAlign: 'center', padding: 60 }}>
            Loading article…
          </div>
        </section>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div>
        <div className="page-banner">
          <div className="breadcrumb">Home <span>›</span> News & Events</div>
          <h1>News & Events</h1>
        </div>
        <section>
          <div className="section-inner" style={{ textAlign: 'center', padding: 60 }}>
            <p>Article not found.</p>
            <button type="button" className="btn-primary" onClick={() => router.push('/news')}>
              ← Back to News
            </button>
          </div>
        </section>
      </div>
    )
  }

  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div>
      <div className="page-banner">
        <div className="breadcrumb">
          <button
            type="button"
            onClick={() => router.push('/news')}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              padding: 0,
              font: 'inherit',
            }}
          >
            Home <span>›</span> News &amp; Events
          </button>
        </div>
        <h1>{article.title}</h1>
        <p
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          <span
            style={{
              background: 'var(--red)',
              color: 'white',
              padding: '4px 10px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            {article.category_label}
          </span>
          {publishedDate && (
            <span style={{ color: 'var(--gray)', fontSize: 13 }}>{publishedDate}</span>
          )}
        </p>
      </div>
      <section style={{ background: 'var(--off-white)' }}>
        <div
          className="section-inner"
          style={{
            maxWidth: 820,
            margin: '0 auto',
            paddingTop: 32,
            paddingBottom: 48,
          }}
        >
          {article.image && (
            <div
              style={{
                marginBottom: 28,
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
              }}
            >
              <img
                src={article.image.startsWith('http') ? article.image : `${API_BASE}${article.image}`}
                alt=""
                style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
              />
            </div>
          )}
          <div
            className="article-body"
            style={{
              fontSize: 16,
              lineHeight: 1.9,
              color: 'var(--text-light)',
              background: 'white',
              padding: 28,
              borderRadius: 16,
              boxShadow: '0 6px 24px rgba(13,27,62,0.12)',
              wordBreak: 'break-word',
            }}
            dangerouslySetInnerHTML={{ __html: article.body }}
          />
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '14px 32px', fontSize: 14 }}
              onClick={() => router.push('/news')}
            >
              ← Back to News &amp; Events
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

type AdmissionsStepItem = { id: number; title: string; description: string; order: number }
type AdmissionsPageData = { content: { hero_title: string; hero_subtitle: string; section_label: string; section_title: string; section_sub: string }; steps: AdmissionsStepItem[] }

export function AdmissionsPage() {
  const router = useRouter()
  const [data, setData] = useState<AdmissionsPageData | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/api/v1/pages/admissions-page/`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (!cancelled && d) setData(d) })
    return () => { cancelled = true }
  }, [])
  const content = data?.content
  const steps = data?.steps ?? [
    { id: 1, title: 'Submit Online Registration', description: 'Complete the online registration form with student and parent details. A non-refundable registration fee applies.', order: 1 },
    { id: 2, title: 'Document Submission', description: 'Submit required documents: passport copies, previous school reports, TC, and Emirates ID copies.', order: 2 },
    { id: 3, title: 'Entrance Assessment', description: 'Students from Grade 1 upwards complete a short entrance assessment in English, Mathematics, and Science.', order: 3 },
    { id: 4, title: 'Interview (if required)', description: 'Some grades may require a brief informal interview with the Principal or Head of Year.', order: 4 },
    { id: 5, title: 'Offer of Place', description: 'Upon successful assessment, an offer letter is issued with fee payment details and joining instructions.', order: 5 },
    { id: 6, title: 'Fee Payment & Enrolment', description: 'Confirm your place by paying the first term fee. Welcome to Gulf Model School!', order: 6 },
  ]
  return (
    <div>
      <div className="page-banner">
        <div className="breadcrumb">Home <span>›</span> Admissions</div>
        <h1>{content?.hero_title ?? 'Admissions'}</h1>
        <p>{content?.hero_subtitle ?? 'Joining Gulf Model School — Academic Year 2026–2027'}</p>
      </div>
      <section>
        <div className="section-inner">
          <div className="section-label">{content?.section_label ?? 'How to Apply'}</div>
          <h2 className="section-title">{content?.section_title ?? 'Admissions Process'}</h2>
          <p className="section-sub">{content?.section_sub ?? 'Our admissions process is straightforward. Follow the steps below to apply for a place at Gulf Model School.'}</p>
          <div className="steps-timeline">
            {steps.map((s, i) => (
              <div key={s.id} className="step">
                <div className="step-num">{i + 1}</div>
                <div className="step-content">
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <button className="btn-primary" style={{ fontSize: 16, padding: '16px 40px' }} onClick={() => router.push('/admissions/enrolment')}>
              Start Online Registration →
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

type FeeEntryItem = { grade_level: string; curriculum_label: string; annual_fee: number; per_term_fee: number; registration_fee: number | null }
type PaymentMethodItem = { icon: string; title: string; description: string }
type FeesPageData = { content: { hero_title: string; hero_subtitle: string; section_label: string; section_title: string; section_sub: string }; fees: FeeEntryItem[]; payment_methods: PaymentMethodItem[] }

function formatAed(n: number | null | undefined): string {
  if (n == null) return '—'
  return `AED ${Number(n).toLocaleString('en-AE')}`
}

export function FeesPage() {
  const [data, setData] = useState<FeesPageData | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/api/v1/pages/fees-page/`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (!cancelled && d) setData(d) })
    return () => { cancelled = true }
  }, [])
  const content = data?.content
  const fees = data?.fees ?? []
  const methods = data?.payment_methods ?? [
    { icon: '🏦', title: 'Bank Transfer', description: 'Transfer to GMS bank account. Reference: Student name and grade.' },
    { icon: '💳', title: 'Card Payment', description: 'Pay in person at the school finance office via debit or credit card.' },
    { icon: '🌐', title: 'Orison Portal', description: 'Parents can pay fees online through the Orison school management portal.' },
  ]
  const hasFees = fees.length > 0
  const feeRows = hasFees ? fees : [
    { grade_level: 'Pre-KG / KG 1–2', curriculum_label: 'CBSE & Kerala', annual_fee: 8500, per_term_fee: 2833, registration_fee: null },
    { grade_level: 'Grade 1–4', curriculum_label: 'CBSE', annual_fee: 11200, per_term_fee: 3733, registration_fee: 1800 },
    { grade_level: 'Grade 1–7', curriculum_label: 'Kerala Board', annual_fee: 9800, per_term_fee: 3267, registration_fee: 1600 },
    { grade_level: 'Grade 5–9', curriculum_label: 'CBSE', annual_fee: 13400, per_term_fee: 4467, registration_fee: 2200 },
    { grade_level: 'Grade 8–10', curriculum_label: 'Kerala Board', annual_fee: 11600, per_term_fee: 3867, registration_fee: 1900 },
    { grade_level: 'Grade 10', curriculum_label: 'CBSE', annual_fee: 14800, per_term_fee: 4933, registration_fee: 2400 },
    { grade_level: 'Grade 11–12 (Science)', curriculum_label: 'CBSE', annual_fee: 17200, per_term_fee: 5733, registration_fee: 2800 },
    { grade_level: 'Grade 11–12 (Commerce/Hum)', curriculum_label: 'CBSE', annual_fee: 16400, per_term_fee: 5467, registration_fee: 2600 },
    { grade_level: 'Grade 11–12 (Kerala +1/+2)', curriculum_label: 'Kerala Board', annual_fee: 13800, per_term_fee: 4600, registration_fee: 2200 },
  ]
  return (
    <div>
      <div className="page-banner">
        <div className="breadcrumb">Home <span>›</span> Admissions <span>›</span> Fees</div>
        <h1>{content?.hero_title ?? 'Fees & Payment'}</h1>
        <p>{content?.hero_subtitle ?? 'Academic Year 2026–2027 Fee Structure'}</p>
      </div>
      <section>
        <div className="section-inner">
          <div className="section-label">{content?.section_label ?? 'Fee Structure'}</div>
          <h2 className="section-title">{content?.section_title ?? '2026–2027 Tuition Fees'}</h2>
          <p className="section-sub">{content?.section_sub ?? 'Fees are approved by the KHDA (Knowledge and Human Development Authority). All fees are in UAE Dirhams (AED).'}</p>
          <div style={{ overflowX: 'auto' }}>
            <table className="fees-table">
              <thead>
                <tr>
                  <th>Grade Level</th>
                  <th>Curriculum</th>
                  <th>Annual Fee</th>
                  <th>Per Term (3 terms)</th>
                  <th>Registration Fee</th>
                </tr>
              </thead>
              <tbody>
                {feeRows.map((row, i) => (
                  <tr key={i}>
                    <td>{row.grade_level}</td>
                    <td>{row.curriculum_label}</td>
                    <td>{formatAed(row.annual_fee)}</td>
                    <td>{formatAed(row.per_term_fee)}</td>
                    <td>{formatAed(row.registration_fee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ background: 'var(--off-white)', borderRadius: 12, padding: 28, marginTop: 40 }}>
            <h3 style={{ color: 'var(--navy)', marginBottom: 16 }}>Payment Methods</h3>
            <div className="payment-methods-grid">
              {methods.map((m) => (
                <div key={m.title} style={{ background: 'white', borderRadius: 8, padding: 20, textAlign: 'center' }}>
                  <div style={{ marginBottom: 12 }}><SchoolIcon token={m.icon} size={28} /></div>
                  <h4 style={{ color: 'var(--navy)', marginBottom: 8, fontFamily: 'var(--font-dm-sans), sans-serif' }}>{m.title}</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-light)', lineHeight: 1.6 }}>{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

type AboutData = {
  hero_title: string
  hero_subtitle: string
  story_title: string
  story_paragraph_1: string
  story_paragraph_2?: string | null
}

export function AboutPage() {
  const [data, setData] = useState<AboutData | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadAbout() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/pages/about/`)
        if (!res.ok) return
        const json = await res.json()
        if (!cancelled) setData(json)
      } catch {
        // fallback to static content if backend not reachable
      }
    }
    loadAbout()
    return () => {
      cancelled = true
    }
  }, [])

  const heroTitle = data?.hero_title ?? 'About Gulf Model School'
  const heroSubtitle = data?.hero_subtitle ?? 'Over 40 years of academic excellence in Dubai'
  const storyTitle = data?.story_title ?? 'Established 1982'
  const storyP1 = data?.story_paragraph_1 ?? "Gulf Model School was founded in 1982 with a vision to provide world-class Indian education to the expatriate community in Dubai. Over four decades, GMS has grown from a small institution into one of Dubai's most respected schools, serving over 2,600 students across CBSE and Kerala Board curricula."
  const storyP2 =
    data?.story_paragraph_2 ??
    "Today, GMS continues to lead — pioneering VR education, launching an AI Classroom Lab, and developing the Ask My Book AI platform — while holding firm to our founding values of academic excellence, moral integrity, and community service."

  return (
    <div>
      <div className="page-banner">
        <div className="breadcrumb">Home <span>›</span> About</div>
        <h1>{heroTitle}</h1>
        <p>{heroSubtitle}</p>
      </div>
      <section>
        <div className="section-inner">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center', marginBottom: 60 }}>
            <div>
              <div className="section-label">Our Story</div>
              <h2 className="section-title">{storyTitle}</h2>
              <p style={{ color: 'var(--text-light)', fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
                {storyP1}
              </p>
              <p style={{ color: 'var(--text-light)', fontSize: 16, lineHeight: 1.8 }}>
                {storyP2}
              </p>
            </div>
            <div style={{ background: 'var(--navy)', borderRadius: 16, padding: 40, color: 'white' }}>
              <h3 style={{ color: 'var(--gold)', marginBottom: 24 }}>GMS at a Glance</h3>
              {[
                ['📅', 'Founded', '1982'],
                ['🏫', 'Location', 'Al Karama, Dubai, UAE'],
                ['🎓', 'Curricula', 'CBSE & Kerala Board'],
                ['📚', 'Grades', 'KG through Grade 12'],
                ['👩‍🎓', 'Students', '2,600+'],
                ['👩‍🏫', 'Staff', '200+ educators & support staff'],
                ['🏆', 'KHDA Rating', 'Acceptable — continuously improving'],
              ].map(([icon, label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 14 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><SchoolIcon token={icon} size={14} /> {label}</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="about-pillars">
            {[
              { icon: '🎯', title: 'Academic Excellence', desc: 'Rigorous academic standards with 98%+ board pass rates and 40+ years of proven results.' },
              { icon: '🌍', title: 'Global Perspective', desc: 'Preparing students for a connected world while honouring Indian cultural heritage.' },
              { icon: '💡', title: 'Innovation', desc: 'First Dubai private school with VR Classroom; AI Lab; and Ask My Book AI platform.' },
              { icon: '🤝', title: 'Community', desc: 'A nurturing school community where every student, teacher, and parent is valued.' },
            ].map(p => (
              <div key={p.title} className="pillar">
                <div className="pillar-icon"><SchoolIcon token={p.icon} size={30} /></div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

type VRFeature = { icon: string; title: string; description: string }
type VRLesson = { icon: string; title: string; description: string; when_label: string }
type VRPageData = { content: { hero_badge: string; hero_title: string; hero_subtitle: string; section_badge: string; section_title: string; section_body: string; features_note: string }; vr_features: VRFeature[]; vr_lessons: VRLesson[] }

export function VRClassroomPage() {
  const [data, setData] = useState<VRPageData | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/api/v1/pages/vr-classroom/`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (!cancelled && d) setData(d) })
    return () => { cancelled = true }
  }, [])
  const c = data?.content
  const features = data?.vr_features?.length ? data.vr_features : [
    { icon: '🪐', title: '', description: 'Explore all 8 planets and their moons' },
    { icon: '☄️', title: '', description: 'Observe comets, asteroids, and solar phenomena' },
    { icon: '📐', title: '', description: 'Interactive scale comparisons of celestial bodies' },
    { icon: '🔬', title: '', description: 'Linked to CBSE Science chapter: Our Universe' },
    { icon: '🎓', title: '', description: 'Teacher-guided or student-led exploration mode' },
    { icon: '📊', title: '', description: 'Post-session quiz linked to learning objectives' },
  ]
  const lessons = data?.vr_lessons?.length ? data.vr_lessons : [
    { icon: '🌊', title: 'The Deep Ocean', description: 'Dive to the Mariana Trench. Discover bioluminescent creatures in an immersive underwater world.', when_label: 'Coming Term 2, 2026' },
    { icon: '🦕', title: 'The Age of Dinosaurs', description: 'Walk among dinosaurs in the Cretaceous era — an immersive palaeontology experience.', when_label: 'Coming Term 3, 2026' },
    { icon: '⚛️', title: 'Inside an Atom', description: 'Shrink to subatomic scale and explore electrons, protons, and neutrons in motion.', when_label: 'Coming 2026–27' },
  ]
  const sectionBody = c?.section_body || 'The first educational VR experience at GMS takes students on an extraordinary journey through our Solar System. Put on the headset and stand on the surface of Mars. Orbit Saturn\'s rings. Watch a comet streak past Jupiter.<br /><br />This is not a video. This is an interactive, explorable 3D environment — curriculum-aligned with CBSE and Kerala Board Science syllabuses, Grades 3–12.'
  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg,#050d1e,#0d1b3e)', padding: '80px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%,rgba(0,150,255,0.2),transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,150,255,0.15)', border: '1px solid rgba(0,150,255,0.3)', color: '#60B4FF', padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 20 }}><SchoolIcon token="🏆" size={14} /> {c?.hero_badge ?? 'First in Dubai Private Schools'}</div>
          <h1 style={{ color: 'white', fontSize: 52, marginBottom: 16 }}>{c?.hero_title ?? 'VR Classroom'}</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>{c?.hero_subtitle ?? 'Gulf Model School — pioneering immersive Virtual Reality education in Dubai since 2026.'}</p>
        </div>
      </div>
      <section className="vr-section" style={{ padding: '80px 40px' }}>
        <div className="vr-inner">
          <div>
            <div className="vr-badge"><SchoolIcon token="🌍" size={14} /> {c?.section_badge ?? 'Inaugural Lesson'}</div>
            <h2 style={{ color: 'white', fontSize: 40, marginBottom: 16 }}>{c?.section_title ?? 'Our Solar System — In Full VR'}</h2>
            <div style={{ color: 'rgba(255,255,255,0.75)' }} dangerouslySetInnerHTML={{ __html: sectionBody }} />
            <div className="vr-features" style={{ marginTop: 24 }}>
              {features.map((f, i) => (
                <div key={i} className="vr-feat"><span className="vr-feat-icon"><SchoolIcon token={f.icon} size={18} /></span>{f.description || f.title}</div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: 320, height: 320, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(ellipse at 35% 35%,#1a3d8a,#0d1b3e,#050a14)', border: '2px solid rgba(96,180,255,0.2)', boxShadow: '0 0 60px rgba(0,100,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', width: 90, height: 90, background: 'radial-gradient(circle at 35% 35%,#FFE566,#FF9900,#CC4400)', borderRadius: '50%', boxShadow: '0 0 40px rgba(255,200,0,0.7)' }} />
              </div>
            </div>
            <div style={{ marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 20px', color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
              <SchoolIcon token="🥽" size={16} /> {c?.features_note ?? 'VR sessions available for Grades 3–12'}
            </div>
          </div>
        </div>
      </section>
      <section style={{ background: 'var(--off-white)' }}>
        <div className="section-inner">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Coming VR Lessons</h2>
          <div className="ai-grid" style={{ marginTop: 32 }}>
            {lessons.map((l, i) => (
              <div key={i} className="ai-card" style={{ borderTopColor: 'var(--navy)' }}>
                <div className="ai-icon"><SchoolIcon token={l.icon} size={28} /></div>
                <h3>{l.title}</h3>
                <p>{l.description}</p>
                <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 8 }}>{l.when_label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

type AILabLevel = { title: string; description: string }
type AILabCard = { icon: string; title: string; description: string }
type AILabPageData = { content: { hero_title: string; hero_subtitle: string; section_label: string; section_title: string; intro_paragraph_1: string; intro_paragraph_2: string; curriculum_title: string }; levels: AILabLevel[]; cards: AILabCard[] }

export function AILabPage() {
  const [data, setData] = useState<AILabPageData | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/api/v1/pages/ai-lab/`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (!cancelled && d) setData(d) })
    return () => { cancelled = true }
  }, [])
  const c = data?.content
  const levels = data?.levels?.length ? data.levels : [
    { title: 'Level 1 (Grade 5–6)', description: 'Intro to AI, Scratch coding, problem-solving with technology' },
    { title: 'Level 2 (Grade 7–8)', description: 'Python basics, algorithms, data structures, simple automation' },
    { title: 'Level 3 (Grade 9–10)', description: 'Machine learning, data science, building your first ML model' },
    { title: 'Level 4 (Grade 11–12)', description: 'Advanced AI, neural networks, capstone projects, certification' },
  ]
  const cards = data?.cards?.length ? data.cards : [
    { icon: '🐍', title: 'Python Programming', description: 'From Hello World to real applications — Python is the foundation of modern AI development.' },
    { icon: '🧠', title: 'Machine Learning', description: 'Build models that learn from data. Classification, regression, clustering — the core of AI.' },
    { icon: '📊', title: 'Data Science', description: 'Collect, clean, visualize and interpret data using Pandas, Matplotlib, and NumPy.' },
    { icon: '🤖', title: 'AI Ethics', description: 'Responsible AI, bias, privacy, and the societal impact of artificial intelligence.' },
    { icon: '🏗️', title: 'Project-Based Learning', description: 'Students build real AI projects — chatbots, image classifiers, recommendation systems.' },
    { icon: '🏅', title: 'Certification', description: 'Earn recognized AI/ML certificates that boost university applications worldwide.' },
  ]
  return (
    <div>
      <div className="page-banner">
        <div className="breadcrumb">Home <span>›</span> Innovation <span>›</span> AI Lab</div>
        <h1>{c?.hero_title ?? 'AI Classroom Lab'}</h1>
        <p>{c?.hero_subtitle ?? 'Where students learn to build the future with Artificial Intelligence'}</p>
      </div>
      <section>
        <div className="section-inner">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center', marginBottom: 60 }}>
            <div>
              <div className="section-label">{c?.section_label ?? 'GMS Innovation'}</div>
              <h2 className="section-title">{c?.section_title ?? 'The Future of Learning is Here'}</h2>
              <p style={{ color: 'var(--text-light)', fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
                {c?.intro_paragraph_1 ?? "Gulf Model School's AI Classroom Lab is a state-of-the-art learning environment where students discover the power of Artificial Intelligence through hands-on coding, project building, and real-world applications."}
              </p>
              <p style={{ color: 'var(--text-light)', fontSize: 16, lineHeight: 1.8 }}>
                {c?.intro_paragraph_2 ?? 'Starting from Grade 5, every GMS student can enrol in our progressive AI curriculum — from Python basics to machine learning models — guided by expert facilitators.'}
              </p>
            </div>
            <div style={{ background: 'var(--navy)', borderRadius: 16, padding: 36, color: 'white' }}>
              <h3 style={{ color: 'var(--gold)', fontSize: 22, marginBottom: 20 }}>{c?.curriculum_title ?? 'AI Curriculum Overview'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {levels.map((l, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 8, padding: '14px 16px' }}>
                    <strong style={{ color: 'white' }}>{l.title}</strong><br />
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{l.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="ai-grid">
            {cards.map((card, i) => (
              <div key={i} className="ai-card">
                <div className="ai-icon"><SchoolIcon token={card.icon} size={28} /></div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

type AskBookFeature = { icon: string; title: string; description: string }
type AskBookPageData = { content: { hero_title: string; hero_subtitle: string; badge: string; section_title: string; intro_paragraph_1: string; intro_paragraph_2: string }; features: AskBookFeature[] }

export function AskBookPage() {
  const { openModal } = useModal()
  const [data, setData] = useState<AskBookPageData | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/api/v1/pages/askbook/`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (!cancelled && d) setData(d) })
    return () => { cancelled = true }
  }, [])
  const c = data?.content
  const features = data?.features?.length ? data.features : [
    { icon: '📖', title: '', description: 'Curriculum-accurate answers from official textbooks' },
    { icon: '🤖', title: '', description: 'AI that understands CBSE & Kerala Board syllabi' },
    { icon: '⚡', title: '', description: 'Instant doubt-clearing, 24/7' },
    { icon: '📊', title: '', description: 'Progress tracking and study analytics' },
  ]
  return (
    <div>
      <div className="page-banner">
        <div className="breadcrumb">Home <span>›</span> Innovation <span>›</span> Ask My Book</div>
        <h1>{c?.hero_title ?? 'Ask My Book with AI'}</h1>
        <p>{c?.hero_subtitle ?? 'AI-powered tutoring from your own CBSE & Kerala Board textbooks'}</p>
      </div>
      <section className="askbook-section">
        <div className="askbook-inner">
          <div>
            <div className="saas-badge"><SchoolIcon token="📚" size={14} /> {c?.badge ?? 'AI-Powered · SaaS Platform'}</div>
            <h2>{c?.section_title ?? 'Your Textbook, Reimagined'}</h2>
            <p>{c?.intro_paragraph_1 ?? 'Ask My Book is a revolutionary AI platform that lets students ask questions directly from their CBSE and Kerala Board textbooks — and get instant, curriculum-accurate answers.'}</p>
            <p>{c?.intro_paragraph_2 ?? 'Available for Grades 5–12. 7-day free trial included for all GMS students.'}</p>
            <div className="askbook-features">
              {features.map((f, i) => (
                <div key={i} className="ask-feat">
                  <span className="ask-feat-icon"><SchoolIcon token={f.icon} size={16} /></span>
                  <span>{f.description || f.title}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 32 }}>
              <button
                className="btn-primary"
                style={{ fontSize: 16, padding: '16px 36px' }}
                onClick={() =>
                  window.open(
                    (process.env.NEXT_PUBLIC_ASKBOOK_URL || 'http://localhost:3001') + '/login',
                    '_blank'
                  )
                }
              >
                Start Free Trial →
              </button>
            </div>
          </div>
          <div className="askbook-ui">
            <div className="askbook-ui-header">
              <div className="dot r" /><div className="dot y" /><div className="dot g" />
              <div className="askbook-ui-title">Ask My Book — CBSE Grade 10 Science</div>
            </div>
            <div className="askbook-chat">
              <div className="chat-msg ai">Hello! I&apos;m your AI tutor. Ask me anything from your CBSE Science textbook 📚</div>
              <div className="chat-msg user">What is the difference between mitosis and meiosis?</div>
              <div className="chat-msg ai">Great question! Mitosis produces 2 identical daughter cells for growth and repair, while Meiosis produces 4 genetically unique cells for sexual reproduction...</div>
            </div>
            <div className="askbook-input">
              <span>Ask anything from your textbook...</span>
              <span style={{ color: 'var(--red)', fontWeight: 700 }}>↑</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

interface NewsListItem {
  id: number
  title: string
  slug?: string
  category_label: string
  emoji: string
  excerpt: string
  published_at: string | null
}

export function NewsPage() {
  const router = useRouter()
  const [items, setItems] = useState<NewsListItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadNews() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/news/?ordering=-published_at`)
        if (!res.ok) {
          setLoaded(true)
          return
        }
        const data = await res.json()
        if (!cancelled && Array.isArray(data?.results)) {
          setItems(data.results)
        }
      } catch {
        // keep static fallback
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }
    loadNews()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <div className="page-banner">
        <div className="breadcrumb">Home <span>›</span> News & Events</div>
        <h1>News & Events</h1>
        <p>The latest from Gulf Model School</p>
      </div>
      <section>
        <div className="section-inner">
          <div className="news-grid">
            {(loaded && items.length
              ? items
              : [
                  {
                    id: 1,
                    emoji: '🥽',
                    category_label: 'Innovation',
                    title: 'VR Classroom Goes Live',
                    published_at: 'February 2026',
                    excerpt:
                      'Gulf Model School becomes the first private school in Dubai to launch a fully immersive VR classroom for students in Grades 3–12.',
                    slug: '',
                  },
                  {
                    id: 2,
                    emoji: '🎓',
                    category_label: 'Academics',
                    title: 'Board Results 2025 — Record Achievement',
                    published_at: 'May 2025',
                    excerpt:
                      'GMS students achieve a 98.4% pass rate in CBSE Grade 10, with 47 students earning distinction marks.',
                    slug: '',
                  },
                  {
                    id: 3,
                    emoji: '🤖',
                    category_label: 'Technology',
                    title: 'AI Lab Inauguration',
                    published_at: 'September 2025',
                    excerpt:
                      'The state-of-the-art AI Classroom Lab officially opens, offering Python, Machine Learning, and Data Science for Grades 5–12.',
                    slug: '',
                  },
                  {
                    id: 4,
                    emoji: '📚',
                    category_label: 'EdTech',
                    title: 'Ask My Book AI Launch',
                    published_at: 'October 2025',
                    excerpt:
                      'GMS launches its proprietary AI tutoring platform, allowing students to get curriculum-accurate answers from their textbooks 24/7.',
                    slug: '',
                  },
                ]).map((n) => {
              const dateLabel = n.published_at
                ? new Date(n.published_at).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : ''
              const clickable = Boolean(n.slug)
              return (
                <div
                  key={n.id}
                  className="news-card"
                  role={clickable ? 'button' : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  onClick={clickable && n.slug ? () => router.push(`/news/${n.slug}`) : undefined}
                  onKeyDown={clickable && n.slug ? (e) => { if (e.key === 'Enter') router.push(`/news/${n.slug}`) } : undefined}
                  style={{ cursor: clickable ? 'pointer' : undefined, position: 'relative' }}
                >
                  <div className="news-img"><SchoolIcon token={n.emoji} size={44} /></div>
                  <div className="news-body">
                    <div className="news-tag">{n.category_label}</div>
                    <h3>{n.title}</h3>
                    <p>{n.excerpt}</p>
                    <div className="news-date">{dateLabel}</div>
                  </div>
                  {clickable && <div className="news-card-arrow">→</div>}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

type AchievementItem = { id: number; icon: string; year: string; title: string; description: string }

export function AchievementsPage() {
  const [achievements, setAchievements] = useState<AchievementItem[]>([])
  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/api/v1/pages/achievements/`)
      .then((r) => r.ok ? r.json() : null)
      .then((raw) => {
        if (cancelled) return
        const list = Array.isArray(raw?.results) ? raw.results : (Array.isArray(raw) ? raw : [])
        if (list.length) setAchievements(list)
      })
    return () => { cancelled = true }
  }, [])
  const fallback: AchievementItem[] = [
    { id: 1, icon: '🏆', year: '2025', title: 'CBSE National Science Olympiad', description: '3 GMS students ranked in the national top 100 in the CBSE Science Olympiad 2025.' },
    { id: 2, icon: '📊', year: '2025', title: '98.4% CBSE Board Pass Rate', description: 'Record board exam results — 98.4% pass rate in Grade 10 and 97.8% in Grade 12 CBSE.' },
    { id: 3, icon: '🌟', year: '2024', title: 'Outstanding School Award', description: 'Recognised by Knowledge & Human Development Authority, Dubai.' },
    { id: 4, icon: '🎨', year: '2024', title: 'Arts & Culture Champions', description: 'First place in Inter-School Arts Festival, Dubai zone.' },
    { id: 5, icon: '⚽', year: '2024', title: 'Sports Champions', description: 'GMS Football Academy — Dubai Private Schools League runners-up.' },
    { id: 6, icon: '💡', year: '2026', title: 'First VR School in Dubai', description: 'Pioneering immersive VR education as the first private school in Dubai.' },
  ]
  const list = achievements.length ? achievements : fallback
  return (
    <div>
      <div className="page-banner">
        <div className="breadcrumb">Home <span>›</span> About <span>›</span> Achievements</div>
        <h1>Achievements</h1>
        <p>Recognition, results and milestones</p>
      </div>
      <section>
        <div className="section-inner">
          <div className="achievements-grid">
            {list.map(a => (
              <div key={a.id} className="achievement-card">
                <div className="ach-icon"><SchoolIcon token={a.icon} size={34} /></div>
                <div className="ach-year">{a.year}</div>
                <h3>{a.title}</h3>
                <p>{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

type MessagePageData = { title: string; role_label: string; organisation: string; body: string; values_list: string[] }

export function GMMessagePage() {
  const [data, setData] = useState<MessagePageData | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/api/v1/pages/message/gm/`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (!cancelled && d) setData(d) })
    return () => { cancelled = true }
  }, [])
  const title = data?.title ?? "General Manager's Message"
  const role = data?.role_label ?? 'General Manager'
  const org = data?.organisation ?? 'Gulf Model School LLC'
  const body = data?.body ?? 'Welcome to Gulf Model School — an institution built on the belief that every child deserves the very best in education. Since 1982, we have walked alongside thousands of families, witnessing the transformation of young students into confident, capable, and compassionate individuals who go on to make a difference in the world.<br /><br />Our commitment has always been to provide a nurturing, academically rigorous environment where students are free to discover their potential. As we enter a new era of innovation with our VR Classroom and AI Lab, we remain rooted in our founding values: academic excellence, strong character, and service to the community.<br /><br />I warmly welcome all families — new and returning — to the Gulf Model School family.'
  const values = data?.values_list?.length ? data.values_list : ['Academic Excellence — We set and achieve the highest standards', 'Integrity — Honesty and transparency in all we do', 'Innovation — Embracing the future of education', 'Community — Every student, teacher, and parent matters', 'Diversity — Celebrating our multicultural school family']
  return (
    <div>
      <div className="page-banner">
        <div className="breadcrumb">Home <span>›</span> About <span>›</span> GM&apos;s Message</div>
        <h1>{title}</h1>
      </div>
      <section style={{ background: 'var(--off-white)' }}>
        <div className="section-inner">
          <div className="message-grid">
            <div className="message-card">
              <div className="msg-header">
                <div className="msg-avatar"><SchoolIcon token="👔" size={30} /></div>
                <div className="msg-info">
                  <h3>{role}</h3>
                  <span>{org}</span>
                </div>
              </div>
              <p dangerouslySetInnerHTML={{ __html: body }} />
            </div>
            <div style={{ background: 'var(--navy)', borderRadius: 16, padding: 40, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ color: 'var(--gold)', fontSize: 22 }}>Our Core Values</h3>
              {values.map(v => (
                <div key={v} style={{ display: 'flex', gap: 12, color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.6 }}>
                  <span style={{ color: 'var(--gold)', flexShrink: 0 }}>→</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export function PrincipalMessagePage() {
  const [data, setData] = useState<MessagePageData | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/api/v1/pages/message/principal/`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (!cancelled && d) setData(d) })
    return () => { cancelled = true }
  }, [])
  const title = data?.title ?? "Principal's Message"
  const role = data?.role_label ?? 'Principal'
  const org = data?.organisation ?? 'Gulf Model School'
  const body = data?.body ?? 'At Gulf Model School, we believe that education is not merely about academic performance — it is about shaping the whole person. Each day, I am inspired by our students\' curiosity, our teachers\' dedication, and the unwavering support of our parent community.<br /><br />We are proud to offer both CBSE and Kerala Board curricula, giving families the choice that best suits their educational journey. This year, we have taken a bold step forward with our VR Classroom and AI Classroom Lab — tools that will prepare our students not just for today, but for the world they will inherit.<br /><br />My message to every student: dare to dream, work with discipline, and never stop asking questions. The doors of this school are open to your potential.'
  const values = data?.values_list?.length ? data.values_list : ['Continue improving CBSE board result excellence', 'Expand AI Lab curriculum to all secondary grades', 'Launch VR lessons for Science, Geography & History', 'Develop Ask My Book AI for all grades', 'Enhance Inclusion Programme support']
  return (
    <div>
      <div className="page-banner">
        <div className="breadcrumb">Home <span>›</span> About <span>›</span> Principal&apos;s Message</div>
        <h1>{title}</h1>
      </div>
      <section style={{ background: 'var(--off-white)' }}>
        <div className="section-inner">
          <div className="message-grid">
            <div className="message-card">
              <div className="msg-header">
                <div className="msg-avatar"><SchoolIcon token="🎓" size={30} /></div>
                <div className="msg-info">
                  <h3>{role}</h3>
                  <span>{org}</span>
                </div>
              </div>
              <p dangerouslySetInnerHTML={{ __html: body }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 4px 24px rgba(13,27,62,0.08)' }}>
                <h3 style={{ fontSize: 18, color: 'var(--navy)', marginBottom: 16 }}>Academic Vision 2026–2027</h3>
                {values.map(v => (
                  <div key={v} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--gray-light)', fontSize: 14, color: 'var(--text-light)' }}>
                    <span style={{ color: 'var(--red)' }}>→</span>{v}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

type GalleryItemType = { id: number; title: string; emoji: string; image: string | null; category?: string; date?: string }

export function GalleryPage() {
  const [items, setItems] = useState<GalleryItemType[]>([])
  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/api/v1/pages/gallery/`)
      .then((r) => r.ok ? r.json() : null)
      .then((raw) => {
        if (cancelled) return
        const list = Array.isArray(raw?.results) ? raw.results : (Array.isArray(raw) ? raw : [])
        setItems(list)
      })
    return () => { cancelled = true }
  }, [])
  const fallbackEmojis = ['🎭','🏆','🎨','⚽','🔬','🎓','🥽','🤖','🎪','🌍','📚','🎵']
  const displayItems = items.length ? items : fallbackEmojis.map((emoji, i) => ({ id: i, title: '', emoji, image: null }))
  return (
    <div>
      <div className="page-banner">
        <div className="breadcrumb">Home <span>›</span> For Parents <span>›</span> Gallery</div>
        <h1>Events Gallery</h1>
        <p>Moments from Gulf Model School</p>
      </div>
      <section>
        <div className="section-inner">
          <div className="gallery-grid">
            {displayItems.map((item) => (
              <div key={item.id} className="gallery-item">
                {item.image ? (
                  <img src={item.image.startsWith('http') ? item.image : `${API_BASE}${item.image}`} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                ) : (
                  <SchoolIcon token={item.emoji} size={34} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

type UniformItemType = { id: number; icon: string; title: string; description: string }

export function UniformsPage() {
  const [items, setItems] = useState<UniformItemType[]>([])
  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/api/v1/pages/uniforms/`)
      .then((r) => r.ok ? r.json() : null)
      .then((raw) => {
        if (cancelled) return
        const list = Array.isArray(raw?.results) ? raw.results : (Array.isArray(raw) ? raw : [])
        if (list.length) setItems(list)
      })
    return () => { cancelled = true }
  }, [])
  const fallback: UniformItemType[] = [
    { id: 1, icon: '👕', title: 'Boys — Primary (KG–Grade 4)', description: 'White half-sleeve shirt, navy blue trousers, black shoes with white socks. GMS school tie on formal days.' },
    { id: 2, icon: '👗', title: 'Girls — Primary (KG–Grade 4)', description: 'White blouse, navy blue skirt (knee-length), black shoes with white socks. Optional navy cardigan.' },
    { id: 3, icon: '👔', title: 'Boys — Secondary (Grade 5–12)', description: 'White full-sleeve shirt, navy blue trousers, school tie, black formal shoes. GMS blazer on formal days.' },
    { id: 4, icon: '👘', title: 'Girls — Secondary (Grade 5–12)', description: 'White blouse, navy blue skirt or trousers, school tie, black formal shoes. GMS blazer optional.' },
    { id: 5, icon: '🏃', title: 'PE Uniform', description: 'GMS branded navy blue T-shirt, navy blue shorts/track pants, white sports shoes. Available from school.' },
    { id: 6, icon: '🛍️', title: 'Where to Buy', description: 'School uniforms are available from the school office at cost price. Contact the office for sizing and collection.' },
  ]
  const list = items.length ? items : fallback
  return (
    <div>
      <div className="page-banner">
        <div className="breadcrumb">Home <span>›</span> Admissions <span>›</span> Uniforms</div>
        <h1>School Uniforms</h1>
        <p>Gulf Model School uniform guidelines</p>
      </div>
      <section>
        <div className="section-inner">
          <div className="uniform-grid">
            {list.map(u => (
              <div key={u.id} className="uniform-card">
                <div className="uniform-icon"><SchoolIcon token={u.icon} size={36} /></div>
                <h3>{u.title}</h3>
                <p>{u.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

type TransportItemType = { id: number; icon: string; title: string; description: string }

export function TransportPage() {
  const [zones, setZones] = useState<TransportItemType[]>([])
  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/api/v1/pages/transport/`)
      .then((r) => r.ok ? r.json() : null)
      .then((raw) => {
        if (cancelled) return
        const list = Array.isArray(raw?.results) ? raw.results : (Array.isArray(raw) ? raw : [])
        if (list.length) setZones(list)
      })
    return () => { cancelled = true }
  }, [])
  const fallback: TransportItemType[] = [
    { id: 1, icon: '🚌', title: 'Zone 1 — Karama & Bur Dubai', description: 'Covering Al Karama, Bur Dubai, Mankhool, Oud Metha.' },
    { id: 2, icon: '🚌', title: 'Zone 2 — Deira & Mirdif', description: 'Covering Deira, Al Nahda, Mirdif, Al Qusais.' },
    { id: 3, icon: '🚌', title: 'Zone 3 — Sharjah', description: 'Selected routes into Sharjah — Al Nahda, Rolla, King Faisal.' },
    { id: 4, icon: '📍', title: 'GPS Tracking', description: 'All buses tracked live. Parents receive SMS notifications on pick-up and drop-off.' },
    { id: 5, icon: '👩‍✈️', title: 'Bus Attendants', description: 'Trained female attendants on all primary school buses.' },
    { id: 6, icon: '📞', title: 'Transport Office', description: 'Contact: transport@gmsdubai.ae | +971 4 2544222 Ext. 5' },
  ]
  const list = zones.length ? zones : fallback
  return (
    <div>
      <div className="page-banner">
        <div className="breadcrumb">Home <span>›</span> Admissions <span>›</span> Transport</div>
        <h1>School Transport</h1>
        <p>Safe, reliable transport across Dubai</p>
      </div>
      <section>
        <div className="section-inner">
          <div className="section-label">Transport Services</div>
          <h2 className="section-title">Bus Routes & Zones</h2>
          <p className="section-sub">GMS operates a fleet of air-conditioned buses covering major residential areas across Dubai. All buses are GPS-tracked with trained attendants.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginBottom: 40 }}>
            {list.map(z => (
              <div key={z.id} className="ai-card">
                <div className="ai-icon"><SchoolIcon token={z.icon} size={28} /></div>
                <h3>{z.title}</h3>
                <p>{z.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

type PolicyItem = { id: number; title: string; content: string }

export function PoliciesPage() {
  const [openPolicy, setOpenPolicy] = useState<string | null>(null)
  const [policies, setPolicies] = useState<PolicyItem[]>([])
  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/api/v1/pages/policies/`)
      .then((r) => r.ok ? r.json() : null)
      .then((raw) => {
        if (cancelled) return
        const list = Array.isArray(raw?.results) ? raw.results : (Array.isArray(raw) ? raw : [])
        if (list.length) setPolicies(list)
      })
    return () => { cancelled = true }
  }, [])
  const fallback: PolicyItem[] = [
    { id: 1, title: 'Attendance Policy', content: 'Students are expected to maintain a minimum of 85% attendance per term. Absences must be communicated to the class teacher on the day of absence. Medical certificates are required for absences exceeding 3 consecutive days.' },
    { id: 2, title: 'Behaviour & Discipline Policy', content: 'GMS upholds a zero-tolerance policy for bullying, harassment, or any form of discrimination. Students are expected to treat all members of the school community with respect. Disciplinary actions follow a graduated response approach.' },
    { id: 3, title: 'Mobile Phone Policy', content: 'Mobile phones are not permitted in classrooms or during examination periods. Phones may be used during break times in designated areas only. Violation may result in confiscation.' },
    { id: 4, title: 'Uniform & Appearance Policy', content: 'All students must wear the designated GMS uniform. Hair must be neat and tidy; extreme hairstyles or colours are not permitted. Jewellery is limited to one pair of stud earrings for girls.' },
    { id: 5, title: 'Child Safeguarding Policy', content: 'GMS is committed to the safety and welfare of all students. All staff are trained in safeguarding procedures. Any concerns regarding a child\'s welfare should be reported to the Designated Safeguarding Lead immediately.' },
  ]
  const list = policies.length ? policies : fallback
  return (
    <div>
      <div className="page-banner">
        <div className="breadcrumb">Home <span>›</span> For Parents <span>›</span> Policies</div>
        <h1>School Policies</h1>
        <p>GMS rules, guidelines, and safeguarding commitments</p>
      </div>
      <section>
        <div className="section-inner">
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {list.map(p => (
              <div key={p.id} className={`policy-item ${openPolicy === p.title ? 'open' : ''}`}>
                <div className="policy-header" onClick={() => setOpenPolicy(openPolicy === p.title ? null : p.title)}>
                  {p.title}
                  <span className="policy-arrow">▾</span>
                </div>
                {openPolicy === p.title && (
                  <div className="policy-body">{p.content}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export function CircularsPage() {
  const [data, setData] = useState<{ title: string; subtitle: string; body: string } | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/api/v1/pages/simple/circulars/`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (!cancelled && d) setData(d) })
    return () => { cancelled = true }
  }, [])
  const title = data?.title ?? 'Circulars'
  const subtitle = data?.subtitle ?? 'Official school communications and notices'
  const body = data?.body ?? "📄 Circulars are distributed via the Orison parent portal. Please log in to orison.school to view the latest school circulars."
  return (
    <div>
      <div className="page-banner">
        <div className="breadcrumb">Home <span>›</span> For Parents <span>›</span> Circulars</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <section>
        <div className="section-inner">
          <div style={{ color: 'var(--text-light)', textAlign: 'center', padding: 40 }} dangerouslySetInnerHTML={{ __html: body }} />
        </div>
      </section>
    </div>
  )
}

export function NewslettersPage() {
  const [data, setData] = useState<{ title: string; subtitle: string; body: string } | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/api/v1/pages/simple/newsletters/`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (!cancelled && d) setData(d) })
    return () => { cancelled = true }
  }, [])
  const title = data?.title ?? 'Newsletters'
  const subtitle = data?.subtitle ?? 'Term-by-term updates from Gulf Model School'
  const body = data?.body ?? "📰 Newsletters are available via the Orison parent portal. Log in to orison.school to access all term newsletters."
  return (
    <div>
      <div className="page-banner">
        <div className="breadcrumb">Home <span>›</span> For Parents <span>›</span> Newsletters</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <section>
        <div className="section-inner">
          <div style={{ color: 'var(--text-light)', textAlign: 'center', padding: 40 }} dangerouslySetInnerHTML={{ __html: body }} />
        </div>
      </section>
    </div>
  )
}

type SyllabusItem = { id: number; grade_label: string; subjects_list: string[] }

export function SyllabusPage() {
  const [items, setItems] = useState<SyllabusItem[]>([])
  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/api/v1/pages/syllabus/`)
      .then((r) => r.ok ? r.json() : null)
      .then((raw) => {
        if (cancelled) return
        const list = Array.isArray(raw?.results) ? raw.results : (Array.isArray(raw) ? raw : [])
        if (list.length) setItems(list)
      })
    return () => { cancelled = true }
  }, [])
  const fallback: SyllabusItem[] = [
    { id: 1, grade_label: 'Grade 1–4', subjects_list: ['English: Reading comprehension, basic grammar, spelling', 'Mathematics: Number work, basic operations, shapes'] },
    { id: 2, grade_label: 'Grade 5–7', subjects_list: ['English: Grammar, comprehension, writing', 'Mathematics: Arithmetic, fractions, geometry', 'Science: General science concepts'] },
    { id: 3, grade_label: 'Grade 8–10', subjects_list: ['English: Advanced grammar, essay writing, literature', 'Mathematics: Algebra, geometry, statistics', 'Science: Physics, Chemistry, Biology basics'] },
    { id: 4, grade_label: 'Grade 11–12', subjects_list: ['Stream-specific assessment based on chosen subjects', 'English proficiency test', 'Mathematics (for Science/Commerce streams)'] },
  ]
  const list = items.length ? items : fallback
  return (
    <div>
      <div className="page-banner">
        <div className="breadcrumb">Home <span>›</span> Admissions <span>›</span> Entrance Syllabus</div>
        <h1>Entrance Syllabus</h1>
        <p>Topics covered in the GMS entrance assessment</p>
      </div>
      <section>
        <div className="section-inner">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
            {list.map(item => (
              <div key={item.id} className="message-card">
                <h3 style={{ fontSize: 20, color: 'var(--navy)', marginBottom: 16 }}>{item.grade_label}</h3>
                {(item.subjects_list || []).map(s => (
                  <div key={s} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--gray-light)', fontSize: 14, color: 'var(--text-light)' }}>
                    <span style={{ color: 'var(--red)' }}>→</span>{s}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

// Re-export useState for EnrolmentPage