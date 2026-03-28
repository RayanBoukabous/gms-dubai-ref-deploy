'use client'

import { useState, useEffect } from 'react'
import { useModal } from '@/components/layout/AppShell'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8001'

type JobItem = { id: number; dept: string; type: string; title: string; desc: string }

const FALLBACK_JOBS: JobItem[] = [
  { id: 1, dept: 'CBSE', type: 'Full-Time', title: 'Mathematics Teacher — Secondary', desc: 'Experienced CBSE Mathematics teacher for Grades 9–12. B.Ed required. Minimum 3 years teaching experience. Knowledge of CBSE board examination patterns essential.' },
  { id: 2, dept: 'Kerala Board', type: 'Full-Time', title: 'Science Teacher (Physics)', desc: 'Physics specialist for Kerala Board Plus One & Plus Two. Kerala TET or KTET preferred. Passionate about student engagement and board examination results.' },
  { id: 3, dept: 'Innovation', type: 'Full-Time', title: 'AI & Computer Science Facilitator', desc: 'Lead our AI Classroom Lab. Proficiency in Python and Machine Learning required. Experience teaching coding to school students preferred. Certifications in AI/ML advantageous.' },
  { id: 4, dept: 'Innovation', type: 'Full-Time', title: 'VR Education Specialist', desc: 'Manage and develop content for our immersive VR Classroom. Experience with VR platforms (Meta Quest), content creation, and curriculum integration required.' },
  { id: 5, dept: 'CBSE', type: 'Full-Time', title: 'English Language Teacher', desc: 'CBSE English teacher for Grades 6–10. Strong grammar, comprehension and creative writing skills. Experience with board exam preparation essential.' },
  { id: 6, dept: 'Special Education', type: 'Full-Time', title: 'Learning Support Assistant (LSA)', desc: 'Trained LSA for our Inclusion Programme, supporting students with special educational needs across primary and secondary sections.' },
  { id: 7, dept: 'Administration', type: 'Full-Time', title: 'Admissions Coordinator', desc: 'Manage student admissions, liaise with families, coordinate entrance assessments, and maintain admission records. Excellent communication skills essential.' },
  { id: 8, dept: 'Kerala Board', type: 'Full-Time', title: 'Malayalam Language Teacher', desc: 'Experienced Malayalam teacher for Kerala Board classes KG–Grade 10. Native speaker preferred. Kerala State TET certification advantageous.' },
]

export default function CareersPage() {
  const { openModal } = useModal()
  const [jobs, setJobs] = useState<JobItem[]>([])
  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/api/v1/careers/jobs/`)
      .then((r) => r.ok ? r.json() : null)
      .then((raw) => {
        if (cancelled) return
        const list = Array.isArray(raw?.results) ? raw.results : (Array.isArray(raw) ? raw : [])
        const mapped: JobItem[] = list.map((j: { id: number; title: string; department_label?: string; job_type_label?: string; description?: string }) => ({
          id: j.id,
          dept: j.department_label ?? 'GMS',
          type: j.job_type_label ?? 'Full-Time',
          title: j.title,
          desc: j.description ?? '',
        }))
        if (mapped.length) setJobs(mapped)
      })
    return () => { cancelled = true }
  }, [])
  const displayJobs = jobs.length ? jobs : FALLBACK_JOBS
  return (
    <div>
      <div className="page-banner">
        <div className="breadcrumb">Home <span>›</span> Careers</div>
        <h1>Careers at GMS</h1>
        <p>Join a school at the forefront of education in Dubai</p>
      </div>
      <section>
        <div className="section-inner">
          <div className="section-label">Open Positions</div>
          <h2 className="section-title">Current Vacancies</h2>
          <p className="section-sub">We are looking for passionate educators and professionals to join the Gulf Model School family.</p>
          <div className="jobs-grid">
            {displayJobs.map(job => (
              <div key={job.title} className="job-card">
                <div className="job-meta">
                  <span className="job-tag dept">{job.dept}</span>
                  <span className="job-tag type">{job.type}</span>
                </div>
                <h3>{job.title}</h3>
                <p>{job.desc}</p>
                <button className="btn-apply" onClick={() => openModal('apply-modal')}>Apply Now</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
