'use client'
import { useState } from 'react'
import SchoolIcon from '@/components/ui/SchoolIcon'

interface AcademicsPageProps {
  initialTab?: string
}

export default function AcademicsPage({ initialTab = 'cbse' }: AcademicsPageProps) {
  const [activeTab, setActiveTab] = useState(initialTab)

  const tabs = [
    { id: 'cbse', label: 'CBSE Curriculum' },
    { id: 'kerala', label: 'Kerala Board' },
    { id: 'inclusion', label: 'Inclusion Programme' },
    { id: 'assessment', label: 'Assessment' },
    { id: 'results', label: 'Board Results' },
  ]

  return (
    <div>
      <div className="page-banner">
        <div className="breadcrumb">Home <span>›</span> Academics</div>
        <h1>Academics</h1>
        <p>CBSE & Kerala Board — KG through Grade 12</p>
      </div>
      <section>
        <div className="section-inner">
          <div className="tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* CBSE */}
          {activeTab === 'cbse' && (
            <div>
              <h2 style={{ fontSize: 30, color: 'var(--navy)', marginBottom: 16 }}>CBSE Curriculum — Grade 1 to Grade 12</h2>
              <p style={{ color: 'var(--text-light)', fontSize: 15, lineHeight: 1.8, marginBottom: 28 }}>
                The Central Board of Secondary Education (CBSE) curriculum at GMS spans Grade 1 through Grade 12. We offer Science, Commerce, and Humanities streams in Grades 11–12, with a strong focus on conceptual learning, analytical skills, and board examination preparation.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                {[
                  { icon: '📐', title: 'Primary (1–5)', desc: 'Foundation in Mathematics, English, Hindi/Malayalam, EVS, and Arts.' },
                  { icon: '🔬', title: 'Middle (6–8)', desc: 'Core sciences, Social Studies, languages, and introduction to technology.' },
                  { icon: '📊', title: 'Secondary (9–10)', desc: 'Board examination preparation, 5 core subjects + electives, CCE pattern.' },
                  { icon: '⚗️', title: 'Senior — Science', desc: 'Physics, Chemistry, Biology/Maths, English, Computer Science/Physical Ed.' },
                  { icon: '💼', title: 'Senior — Commerce', desc: 'Accountancy, Business Studies, Economics, English, Informatics Practices.' },
                  { icon: '📜', title: 'Senior — Humanities', desc: 'History, Geography, Political Science, Economics, English, Psychology.' },
                ].map(c => (
                  <div key={c.title} className="ai-card">
                    <div className="ai-icon"><SchoolIcon token={c.icon} size={28} /></div>
                    <h3>{c.title}</h3>
                    <p>{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KERALA */}
          {activeTab === 'kerala' && (
            <div>
              <h2 style={{ fontSize: 30, color: 'var(--navy)', marginBottom: 16 }}>Kerala Board — KG to Grade 12</h2>
              <p style={{ color: 'var(--text-light)', fontSize: 15, lineHeight: 1.8, marginBottom: 28 }}>
                The Kerala State Syllabus at GMS runs from KG through Grade 12, following the curriculum set by the Kerala State Education Board. It is ideal for families connected to Kerala seeking continuity in the Kerala Board system while residing in Dubai.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                {[
                  { icon: '🌱', title: 'KG Programme', desc: 'Play-based learning, foundational literacy and numeracy, Malayalam medium.' },
                  { icon: '📚', title: 'Primary (1–7)', desc: 'Malayalam, English, Maths, Science, Social Science — activity-based learning.' },
                  { icon: '🎓', title: 'SSLC (8–10)', desc: 'State-level board examination, comprehensive assessment in all subjects.' },
                  { icon: '🔭', title: 'Plus One (11)', desc: 'Science, Commerce & Humanities — first year of Higher Secondary.' },
                  { icon: '🏅', title: 'Plus Two (12)', desc: 'Final year Higher Secondary — DHSE examinations, university entrance prep.' },
                  { icon: '🌏', title: 'Cultural Identity', desc: 'Preserving Kerala cultural heritage, languages, and traditions alongside modern education.' },
                ].map(c => (
                  <div key={c.title} className="ai-card">
                    <div className="ai-icon"><SchoolIcon token={c.icon} size={28} /></div>
                    <h3>{c.title}</h3>
                    <p>{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INCLUSION */}
          {activeTab === 'inclusion' && (
            <div>
              <h2 style={{ fontSize: 30, color: 'var(--navy)', marginBottom: 16 }}>Inclusion Programme</h2>
              <p style={{ color: 'var(--text-light)', fontSize: 15, lineHeight: 1.8, marginBottom: 28 }}>
                GMS is committed to providing quality education for students with special educational needs. Our trained specialist teachers work closely with students and families to create personalised learning plans.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {[
                  { icon: '🤝', title: 'Individual Learning Plans', desc: 'Every student with additional needs receives a tailored Individual Education Plan (IEP).' },
                  { icon: '👩‍🏫', title: 'Specialist Teachers', desc: 'Trained Learning Support Assistants (LSAs) and Special Educators work across all grades.' },
                  { icon: '🧩', title: 'Differentiated Learning', desc: 'Adapted resources, modified assessments, and flexible learning environments for every need.' },
                  { icon: '👨‍👩‍👧', title: 'Family Partnership', desc: 'Regular meetings and transparent communication between school and parents/guardians.' },
                ].map(c => (
                  <div key={c.title} className="ai-card">
                    <div className="ai-icon"><SchoolIcon token={c.icon} size={28} /></div>
                    <h3>{c.title}</h3>
                    <p>{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ASSESSMENT */}
          {activeTab === 'assessment' && (
            <div>
              <h2 style={{ fontSize: 30, color: 'var(--navy)', marginBottom: 16 }}>Assessment & Progress Tracking</h2>
              <p style={{ color: 'var(--text-light)', fontSize: 15, lineHeight: 1.8, marginBottom: 28 }}>
                GMS follows a Continuous and Comprehensive Evaluation (CCE) approach complemented by periodic assessments and parent reporting through our digital portal, Orison.
              </p>
              <div className="steps-timeline">
                {[
                  { n: 1, title: 'Formative Assessment', desc: 'Ongoing class tests, assignments, projects and oral assessments throughout each term.' },
                  { n: 2, title: 'Summative Assessment', desc: 'Mid-term and end-of-term examinations contributing to the overall grade.' },
                  { n: 3, title: 'Orison Digital Portal', desc: 'Parents access real-time attendance, results, timetables and school communications via orison.school.' },
                  { n: 4, title: 'Parent-Teacher Meetings', desc: 'Three formal PTM sessions per year plus on-request teacher appointments.' },
                  { n: 5, title: 'Board Examination Prep', desc: 'Dedicated revision programmes, mock exams, and guidance for CBSE/Kerala Board examinations.' },
                ].map(s => (
                  <div key={s.n} className="step">
                    <div className="step-num">{s.n}</div>
                    <div className="step-content">
                      <h3>{s.title}</h3>
                      <p>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESULTS */}
          {activeTab === 'results' && (
            <div>
              <h2 style={{ fontSize: 30, color: 'var(--navy)', marginBottom: 16 }}>Board Results — Last 3 Academic Years</h2>
              <table className="fees-table" style={{ marginBottom: 32 }}>
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Curriculum</th>
                    <th>Grade</th>
                    <th>Pass Rate</th>
                    <th>Top Score</th>
                    <th>Distinctions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['2024–25', 'CBSE', '10', '98.4%', '98.6%', '47 students'],
                    ['2024–25', 'CBSE', '12', '97.8%', '97.2%', '31 students'],
                    ['2024–25', 'Kerala Board', 'SSLC', '99.1%', 'A+ GPA', '62 students'],
                    ['2023–24', 'CBSE', '10', '97.2%', '97.8%', '39 students'],
                    ['2023–24', 'CBSE', '12', '96.5%', '96.4%', '28 students'],
                    ['2022–23', 'CBSE', '10', '96.8%', '96.2%', '35 students'],
                  ].map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => <td key={j}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
