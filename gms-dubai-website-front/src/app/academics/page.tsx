'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import AcademicsPage from '@/components/pages/AcademicsPage'

function AcademicsContent() {
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') ?? 'cbse'
  return <AcademicsPage initialTab={tab} />
}

export default function Academics() {
  return (
    <Suspense fallback={<div className="page-banner"><div className="section-inner" style={{ padding: 60, textAlign: 'center' }}>Loading…</div></div>}>
      <AcademicsContent />
    </Suspense>
  )
}
