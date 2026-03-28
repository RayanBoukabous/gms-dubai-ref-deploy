'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useModal } from '@/components/layout/AppShell'
import SchoolIcon from '@/components/ui/SchoolIcon'

/** Parse stat value like "2,600+", "+6000", "98%", "40+" into number + suffix */
function parseStatValue(value: string): { num: number; suffix: string } {
  const cleaned = value.replace(/,/g, '').trim()
  const hasLeadingPlus = cleaned.startsWith('+')
  const toParse = hasLeadingPlus ? cleaned.slice(1) : cleaned
  const match = toParse.match(/^([\d.]+)(.*)$/)
  if (!match) return { num: 0, suffix: value }
  const num = parseFloat(match[1]) || 0
  const suffix = hasLeadingPlus ? '+' + (match[2] || '') : (match[2] || '')
  return { num, suffix }
}

function formatNum(n: number): string {
  if (n >= 1000) return Math.round(n).toLocaleString()
  return Math.round(n).toString()
}

const DURATION_MS = 1800
const TICK_MS = 32

function CountUpNum({ value }: { value: string }) {
  const { num, suffix } = parseStatValue(value)
  const [display, setDisplay] = useState(num <= 0 ? value : `0${suffix}`)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const parsed = parseStatValue(value)
    if (parsed.num <= 0) {
      setDisplay(value)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started) setStarted(true)
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value, started])

  useEffect(() => {
    if (!started) return
    const { num, suffix } = parseStatValue(value)
    if (num <= 0) return

    const start = performance.now()
    let rafId: number

    const tick = (now: number) => {
      const elapsed = now - start
      const t = Math.min(elapsed / DURATION_MS, 1)
      const eased = 1 - Math.pow(1 - t, 2.5)
      const current = eased * num
      setDisplay(formatNum(current) + (suffix || ''))
      if (t < 1) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [started, value])

  return <span ref={ref}>{display}</span>
}

interface SchoolStat {
  id: number
  label: string
  value: string
  order: number
}

interface HomepageNewsItem {
  id: number
  title: string
  slug?: string
  category_label: string
  emoji: string
  excerpt: string
  published_at: string | null
}

interface CurriculumProgramme {
  id: number
  curriculum: 'cbse' | 'kerala'
  title: string
  subtitle: string
  bullet_list: string[]
  order: number
}

interface InnovationFeature {
  id: number
  icon: string
  title: string
  description: string
  order: number
}

const FALLBACK_STATS: SchoolStat[] = [
  { id: 1, value: '2,600+', label: 'Students Enrolled', order: 1 },
  { id: 2, value: '40+', label: 'Years of Excellence', order: 2 },
  { id: 3, value: '98%', label: 'Board Pass Rate 2025', order: 3 },
  { id: 4, value: '2', label: 'Curricula: CBSE & Kerala', order: 4 },
]

export default function HomePage() {
  const router = useRouter()
  const { openModal } = useModal()
  const [stats, setStats] = useState<SchoolStat[]>(FALLBACK_STATS)
  const [news, setNews] = useState<HomepageNewsItem[]>([])
  const [programmes, setProgrammes] = useState<CurriculumProgramme[]>([])
  const [programmesLoaded, setProgrammesLoaded] = useState(false)
  const [innovation, setInnovation] = useState<InnovationFeature[]>([])
  const [innovationLoaded, setInnovationLoaded] = useState(false)

  useEffect(() => {
    async function loadStats() {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8001'
        const res = await fetch(`${base}/api/v1/pages/stats/`)
        if (!res.ok) return
        const raw = await res.json()
        const data: SchoolStat[] = Array.isArray(raw?.results) ? raw.results : raw
        if (Array.isArray(data) && data.length) {
          // Ensure consistent ordering
          const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          setStats(sorted)
        }
      } catch {
        // silently fall back to defaults
      }
    }

    loadStats()
  }, []);

  useEffect(() => {
    async function loadHomepageNews() {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8001'
        const res = await fetch(`${base}/api/v1/pages/homepage/`)
        if (!res.ok) return
        const data = await res.json()
        if (data && Array.isArray(data.featured_news)) {
          setNews(data.featured_news)
        }
      } catch {
        // ignore and keep static fallback
      }
    }

    loadHomepageNews()
  }, []);

  useEffect(() => {
    async function loadProgrammes() {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8001'
        const res = await fetch(`${base}/api/v1/pages/programmes/`)
        if (!res.ok) {
          setProgrammesLoaded(true)
          return
        }
        const raw = await res.json()
        const data: CurriculumProgramme[] = Array.isArray(raw?.results) ? raw.results : raw
        if (Array.isArray(data) && data.length) {
          const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          setProgrammes(sorted)
        }
      } catch {
        // keep static fallback only when API fails
      } finally {
        setProgrammesLoaded(true)
      }
    }

    loadProgrammes()
  }, []);

  useEffect(() => {
    async function loadInnovation() {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8001'
        const res = await fetch(`${base}/api/v1/pages/innovation/`)
        if (!res.ok) {
          setInnovationLoaded(true)
          return
        }
        const raw = await res.json()
        const data: InnovationFeature[] = Array.isArray(raw?.results) ? raw.results : raw
        if (Array.isArray(data) && data.length) {
          const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          setInnovation(sorted)
        }
      } catch {
        // keep static fallback on error
      } finally {
        setInnovationLoaded(true)
      }
    }

    loadInnovation()
  }, []);

  return (
    <div>
      {/* HERO */}
      <div className="hero">
        <div className="hero-pattern" />
        <div className="hero-content">
          <div className="hero-text-block">
            <div className="hero-badge"><SchoolIcon token="🎓" size={14} /> Est. 1982 — Over 40 Years of Excellence</div>
            <h1>A Journey to<br /><em>Excellence</em><br />Starts Here</h1>
            <p className="hero-sub">
              Gulf Model School Dubai — nurturing 2,600+ young minds through CBSE and Kerala Board curricula,
              with a new era of VR learning and AI education.
            </p>
            <div className="hero-btns">
              <button className="btn-primary" onClick={() => router.push('/admissions/enrolment')}>Apply for 2026–2027</button>
              <button className="btn-secondary" onClick={() => router.push('/about')}>Discover GMS</button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-video-wrap">
              <video src="/videos/video.MP4" controls playsInline />
            </div>
          </div>

          {/* Stats & innovation highlights inside hero (blue area), under text + video */}
          <div className="hero-stats-strip">
            <div className="hero-stat-grid">
              {stats.map((stat) => (
                <div key={stat.id} className="stat-card">
                  <div className="num">
                    <CountUpNum value={stat.value} />
                  </div>
                  <div className="label">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="hero-highlights-row">
              <div
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 10,
                  padding: '14px 18px',
                  flex: 1,
                  minWidth: 220,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <SchoolIcon token="🥽" size={22} />
                <div>
                  <div style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>VR Classroom</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>First in Dubai Private Schools</div>
                </div>
              </div>
              <div
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 10,
                  padding: '14px 18px',
                  flex: 1,
                  minWidth: 220,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <SchoolIcon token="🤖" size={22} />
                <div>
                  <div style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>AI Classroom Lab</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Python &amp; Machine Learning</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CURRICULA */}
      <section className="curricula-section">
        <div className="section-inner">
          <div className="section-label">Our Programmes</div>
          <h2 className="section-title">Two World-Class Curricula</h2>
          <p className="section-sub">GMS offers the CBSE and Kerala Board programmes, both from KG through Grade 12, providing excellence in Indian education within Dubai.</p>
          <div className="curricula-grid">
            {(!programmesLoaded
              ? []
              : programmes.length
                ? programmes
                : [
                  {
                    id: 1,
                    curriculum: 'cbse',
                    title: 'CBSE Curriculum',
                    subtitle: 'Central Board of Secondary Education · Grade 1–12',
                    bullet_list: [
                      'Grade 1 through Grade 12',
                      'National-level board examinations',
                      'Science, Commerce & Humanities streams',
                      'Mandatory CBSE Disclosure compliance',
                      'Assessment & continuous evaluation',
                      'Inclusion Programme for special needs',
                    ],
                    order: 1,
                  },
                  {
                    id: 2,
                    curriculum: 'kerala',
                    title: 'Kerala Board',
                    subtitle: 'Kerala State Syllabus · KG–Grade 12',
                    bullet_list: [
                      'KG through Grade 12 full programme',
                      'Kerala State curriculum standards',
                      'Strong foundation in regional studies',
                      'Malayalam medium instruction available',
                      'SSLC & Higher Secondary examinations',
                      'Holistic development focus',
                    ],
                    order: 2,
                  },
                ]
            ).map((programme) => (
              <div key={programme.id} className="curriculum-card">
                <div className={`curriculum-header ${programme.curriculum === 'cbse' ? 'cbse' : 'kerala'}`}>
                  <div className="curr-icon">
                    <SchoolIcon token={programme.curriculum === 'cbse' ? '🎓' : '📚'} size={26} />
                  </div>
                  <div className="curr-title">
                    <h3>{programme.title}</h3>
                    <span>{programme.subtitle}</span>
                  </div>
                </div>
                <div className="curriculum-body">
                  <ul>
                    {programme.bullet_list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VR SECTION */}
      <section className="vr-section">
        <div className="vr-inner">
          <div>
            <div className="vr-badge"><SchoolIcon token="🥽" size={14} /> World First · Dubai Private Schools</div>
            <h2>Introducing the <em>VR Classroom</em> — A Dubai First</h2>
            <p>Gulf Model School is proud to be the first private school in Dubai to integrate a fully immersive Virtual Reality classroom into the curriculum. Students explore the cosmos, science, and history like never before.</p>
            <p>Our inaugural lesson: <strong style={{ color: '#60B4FF' }}>The Solar System</strong> — travel through space, orbit planets, and witness astronomical events in real-time immersive VR.</p>
            <div className="vr-features">
              {[
                { icon: '🪐', text: 'First lesson: Explore the Solar System in full VR' },
                { icon: '🌍', text: 'Science & Geography immersive lessons' },
                { icon: '👩‍🚀', text: 'Available for Grades 3–12' },
                { icon: '🏆', text: 'First private school in Dubai to integrate VR education' },
              ].map(f => (
                <div key={f.text} className="vr-feat">
                  <span className="vr-feat-icon"><SchoolIcon token={f.icon} size={18} /></span>
                  {f.text}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 28 }}>
              <button className="btn-primary" onClick={() => router.push('/vr-classroom')}>
                Discover VR Classroom →
              </button>
            </div>
          </div>
          {/* Solar System Animation */}
          <div className="vr-planet-display">
            <div style={{ position: 'relative', width: 340, height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                position: 'absolute', width: 90, height: 90,
                background: 'radial-gradient(circle at 35% 35%,#FFE566,#FF9900,#CC4400)',
                borderRadius: '50%',
                boxShadow: '0 0 50px rgba(255,200,0,0.7), 0 0 100px rgba(255,150,0,0.3)',
                zIndex: 5,
              }} />
              <div style={{ position: 'absolute', width: 160, height: 160, border: '1px solid rgba(96,180,255,0.2)', borderRadius: '50%', animation: 'orbitSpin 8s linear infinite' }}>
                <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', width: 16, height: 16, background: '#A0522D', borderRadius: '50%', boxShadow: '0 0 8px rgba(160,82,45,0.5)' }} />
              </div>
              <div style={{ position: 'absolute', width: 230, height: 230, border: '1px solid rgba(96,180,255,0.15)', borderRadius: '50%', animation: 'orbitSpin 14s linear infinite' }}>
                <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 20, height: 20, background: 'linear-gradient(135deg,#4488FF,#2244CC)', borderRadius: '50%', boxShadow: '0 0 12px rgba(68,136,255,0.6)' }} />
              </div>
              <div style={{ position: 'absolute', width: 310, height: 310, border: '1px solid rgba(96,180,255,0.1)', borderRadius: '50%', animation: 'orbitSpin 22s linear infinite' }}>
                <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', width: 26, height: 26, background: 'linear-gradient(135deg,#CC4400,#882200)', borderRadius: '50%', boxShadow: '0 0 14px rgba(204,68,0,0.5)' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI LAB TEASER */}
      <section className="ai-section">
        <div className="section-inner">
          <div className="section-label">Innovation at GMS</div>
          <h2 className="section-title">The AI Classroom Lab</h2>
          <p className="section-sub">A dedicated AI learning environment where students from Grade 5 through 12 learn Python, machine learning, and the future of technology.</p>
          <div className="ai-grid">
            {(innovationLoaded && innovation.length
              ? innovation
              : !innovationLoaded
                ? []
                : [
                    {
                      id: 1,
                      icon: '🐍',
                      title: 'Python Programming',
                      description:
                        'Students learn Python from fundamentals to advanced scripting, building real projects and automations.',
                      order: 1,
                    },
                    {
                      id: 2,
                      icon: '🧠',
                      title: 'Machine Learning',
                      description:
                        'Introduction to ML algorithms, data science, and model building using industry-standard tools.',
                      order: 2,
                    },
                    {
                      id: 3,
                      icon: '🤖',
                      title: 'AI Ethics & Future',
                      description:
                        "Understanding AI's role in society, responsible use, and preparing students for a technology-driven world.",
                      order: 3,
                    },
                    {
                      id: 4,
                      icon: '📊',
                      title: 'Data Science',
                      description:
                        'Working with real datasets, visualization, and drawing insights — skills for the modern workforce.',
                      order: 4,
                    },
                    {
                      id: 5,
                      icon: '🏗️',
                      title: 'Project-Based Learning',
                      description:
                        'Students build their own AI projects, from chatbots to image classifiers, guided by expert facilitators.',
                      order: 5,
                    },
                    {
                      id: 6,
                      icon: '🎓',
                      title: 'Certification Pathway',
                      description:
                        'Students earn recognized certificates upon completing the AI curriculum levels, boosting college applications.',
                      order: 6,
                    },
                  ]
            ).map((card) => (
              <div key={card.id} className="ai-card">
                <div className="ai-icon"><SchoolIcon token={card.icon} size={28} /></div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <button className="btn-primary" onClick={() => router.push('/ai-lab')}>Explore AI Lab →</button>
          </div>
        </div>
      </section>

      {/* ASK MY BOOK */}
      <section className="askbook-section">
        <div className="askbook-inner">
          <div>
            <div className="saas-badge"><SchoolIcon token="📚" size={14} /> AI-Powered · SaaS Platform</div>
            <h2>Ask My Book <em>with AI</em></h2>
            <p>A revolutionary AI-powered learning platform that lets students ask questions directly from their CBSE and Kerala Board textbooks — and get instant, curriculum-accurate answers.</p>
            <p>Available for Grades 5–12 across both curricula. 7-day free trial included for all GMS students.</p>
            <div className="askbook-features">
              {[
                { icon: '📖', text: 'Curriculum-accurate answers from official textbooks' },
                { icon: '🤖', text: 'AI that understands CBSE & Kerala Board syllabi' },
                { icon: '⚡', text: 'Instant doubt-clearing, 24/7' },
                { icon: '📊', text: 'Progress tracking and study analytics' },
              ].map(f => (
                <div key={f.text} className="ask-feat">
                  <span className="ask-feat-icon"><SchoolIcon token={f.icon} size={16} /></span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  window.open(
                    (process.env.NEXT_PUBLIC_ASKBOOK_URL || 'http://localhost:3001') + '/login',
                    '_blank'
                  )
                }}
              >
                Start Free Trial →
              </button>
              <button type="button" className="btn-secondary" onClick={() => router.push('/askbook')}>
                Learn More
              </button>
            </div>
          </div>
          {/* Chat UI mockup */}
          <div className="askbook-ui">
            <div className="askbook-ui-header">
              <div className="dot r" /><div className="dot y" /><div className="dot g" />
              <div className="askbook-ui-title">Ask My Book — CBSE Grade 10 Science</div>
            </div>
            <div className="askbook-chat">
              <div className="chat-msg ai">Hello! I&apos;m your AI tutor. Ask me anything from your CBSE Science textbook 📚</div>
              <div className="chat-msg user">What is the difference between mitosis and meiosis?</div>
              <div className="chat-msg ai">Great question! From your Chapter 8 — Mitosis produces 2 identical daughter cells for growth and repair, while Meiosis produces 4 genetically unique cells for sexual reproduction. Meiosis involves two divisions...</div>
            </div>
            <div className="askbook-input">
              <span>Ask anything from your textbook...</span>
              <span style={{ color: 'var(--red)', fontWeight: 700 }}>↑</span>
            </div>
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section>
        <div className="section-inner">
          <div className="section-label">Latest</div>
          <h2 className="section-title">News & Events</h2>
          <p className="section-sub">Stay updated with the latest happenings at Gulf Model School.</p>
          <div className="news-grid">
            {(news.length ? news : [
              { id: 1, emoji: '🥽', category_label: 'Innovation', title: 'VR Classroom Goes Live', published_at: 'February 2026', excerpt: 'Gulf Model School becomes the first private school in Dubai to launch a fully immersive VR classroom for students in Grades 3–12.' },
              { id: 2, emoji: '🎓', category_label: 'Academics', title: 'Board Results 2025 — Record Achievement', published_at: 'May 2025', excerpt: 'GMS students achieve a 98.4% pass rate in CBSE Grade 10 examinations, with 47 students earning distinction marks.' },
              { id: 3, emoji: '🤖', category_label: 'Technology', title: 'AI Lab Inauguration', published_at: 'September 2025', excerpt: 'The state-of-the-art AI Classroom Lab officially opens its doors, offering Python, Machine Learning, and Data Science for Grades 5–12.' },
            ]).map(item => (
              (() => {
                const dateLabel = item.published_at
                  ? new Date(item.published_at).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '';

                const clickable = Boolean(item.slug);

                return (
              <div
                key={item.id}
                className="news-card"
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                onClick={clickable && item.slug ? () => router.push(`/news/${item.slug}`) : undefined}
                onKeyDown={
                  clickable && item.slug
                    ? (e) => {
                        if (e.key === 'Enter') router.push(`/news/${item.slug}`);
                      }
                    : undefined
                }
                style={{
                  cursor: clickable ? 'pointer' : undefined,
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
              >
                <div className="news-img"><SchoolIcon token={item.emoji} size={44} /></div>
                <div className="news-body">
                  <div className="news-tag">{item.category_label}</div>
                  <h3>{item.title}</h3>
                  <p>{item.excerpt}</p>
                  <div className="news-date">{dateLabel}</div>
                </div>
                {clickable && (
                  <div className="news-card-arrow">
                    →
                  </div>
                )}
              </div>
                );
              })()
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <button className="btn-primary" onClick={() => router.push('/news')}>All News & Events →</button>
          </div>
        </div>
      </section>
    </div>
  )
}
