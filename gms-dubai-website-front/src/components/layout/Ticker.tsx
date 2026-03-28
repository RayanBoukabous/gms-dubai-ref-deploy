'use client'

import { useEffect, useState } from 'react'

interface TickerItem {
  id: number
  text: string
  order: number
}

const FALLBACK_ITEMS: TickerItem[] = [
  { id: 1, text: 'VR Classroom Launch — First in a Private School in Dubai!', order: 1 },
  { id: 2, text: 'AI Lab Now Open — Python & Machine Learning for Grades 5–12', order: 2 },
  { id: 3, text: 'Admissions Open for Academic Year 2026–2027', order: 3 },
]

export default function Ticker() {
  const [items, setItems] = useState<TickerItem[]>(FALLBACK_ITEMS)

  useEffect(() => {
    async function loadTicker() {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8001'
        const res = await fetch(`${base}/api/v1/pages/ticker/`)
        if (!res.ok) return
        const raw = await res.json()
        const data: TickerItem[] = Array.isArray(raw?.results) ? raw.results : raw
        if (Array.isArray(data) && data.length) {
          const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          setItems(sorted)
        }
      } catch {
        // fallback to static items on error
      }
    }

    loadTicker()
  }, [])
  return (
    <div style={{
      background: 'var(--red)',
      color: 'white',
      padding: '7px 0',
      overflow: 'hidden',
      position: 'relative',
      fontSize: 13,
      fontWeight: 500,
      letterSpacing: '0.3px',
    }}>
      <div style={{
        background: 'var(--navy)',
        color: 'var(--gold)',
        padding: '0 16px',
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: 1,
        textTransform: 'uppercase',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        zIndex: 2,
      }}>
        NEWS
      </div>
      <div style={{
        display: 'flex',
        animation: 'ticker 40s linear infinite',
        paddingLeft: 100,
        whiteSpace: 'nowrap',
      }}>
        {items.map((item) => (
          <span key={item.id} style={{ padding: '0 40px' }}>
            <span style={{ color: 'var(--gold)' }}>★  </span>
            {item.text}
          </span>
        ))}
      </div>
    </div>
  )
}
