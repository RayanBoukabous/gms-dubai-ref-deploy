'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import SchoolIcon from '@/components/ui/SchoolIcon'

interface NavbarProps {
  pathname: string
}

interface NavChild {
  label: string
  href: string
  emoji?: string
}

interface NavItem {
  label: string
  href?: string
  children?: NavChild[]
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    children: [
      { label: 'About GMS', href: '/about' },
      { label: "General Manager's Message", href: '/about/gm-message' },
      { label: "Principal's Message", href: '/about/principal-message' },
      { label: 'Achievements', href: '/about/achievements' },
    ],
  },
  {
    label: 'Academics',
    children: [
      { label: 'CBSE Curriculum', href: '/academics' },
      { label: 'Kerala Board', href: '/academics?tab=kerala' },
      { label: 'Inclusion Programme', href: '/academics?tab=inclusion' },
      { label: 'Assessment', href: '/academics?tab=assessment' },
      { label: 'Board Results', href: '/academics?tab=results' },
      { label: 'VR Classroom', href: '/vr-classroom', emoji: '🥽' },
      { label: 'AI Lab', href: '/ai-lab', emoji: '🤖' },
    ],
  },
  {
    label: 'Admissions',
    children: [
      { label: 'Admissions Process', href: '/admissions' },
      { label: 'Fees & Payment', href: '/admissions/fees' },
      { label: 'Entrance Syllabus', href: '/admissions/syllabus' },
      { label: 'Uniforms', href: '/admissions/uniforms' },
      { label: 'Transport', href: '/admissions/transport' },
      { label: 'Online Registration', href: '/admissions/enrolment', emoji: '📋' },
    ],
  },
  {
    label: 'For Parents',
    children: [
      { label: 'School Policies', href: '/policies' },
      { label: 'Circulars', href: '/circulars' },
      { label: 'Newsletters', href: '/newsletters' },
      { label: 'Events Gallery', href: '/gallery' },
    ],
  },
  {
    label: 'Innovation',
    children: [
      { label: 'VR Classroom', href: '/vr-classroom', emoji: '🥽' },
      { label: 'AI Classroom Lab', href: '/ai-lab', emoji: '🤖' },
      { label: 'Ask My Book with AI', href: '/askbook', emoji: '📚' },
    ],
  },
  { label: 'News & Events', href: '/news' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  const base = pathname.split('?')[0]
  const hrefBase = href.split('?')[0]
  return base === hrefBase || (hrefBase !== '/' && base.startsWith(hrefBase))
}

export default function Navbar({ pathname }: NavbarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSubOpen, setMobileSubOpen] = useState<string | null>(null)

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const closeMobile = () => {
    setMobileOpen(false)
    setMobileSubOpen(null)
  }

  return (
    <nav className="navbar" style={{
      background: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 20px rgba(13,27,62,0.12)',
      borderBottom: '3px solid var(--red)',
    }}>
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo" onClick={closeMobile}>
          <Image
            src="/logo.jpg"
            alt="Gulf Model School Dubai logo"
            width={56}
            height={56}
            style={{ borderRadius: '50%', border: '2px solid var(--gold)', objectFit: 'cover' }}
          />
        </Link>

        {/* Desktop menu */}
        <ul className="navbar-menu navbar-desktop-menu">
          {NAV_ITEMS.map((item) => (
            <li
              key={item.label}
              style={{ position: 'relative' }}
              onMouseEnter={() => item.children && setOpenDropdown(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              {item.href ? (
                <Link
                  href={item.href}
                  className={isActive(pathname, item.href) ? 'nav-link active' : 'nav-link'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '0 12px', height: 64,
                    fontSize: 13, fontWeight: 600, color: isActive(pathname, item.href) ? 'var(--red)' : 'var(--navy)',
                    textDecoration: 'none', letterSpacing: '0.3px', fontFamily: 'var(--font-dm-sans), sans-serif', whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={item.children?.some(c => isActive(pathname, c.href)) ? 'nav-link active' : 'nav-link'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '0 12px', height: 64, fontSize: 13, fontWeight: 600,
                    color: item.children?.some(c => isActive(pathname, c.href)) ? 'var(--red)' : 'var(--navy)',
                    letterSpacing: '0.3px', fontFamily: 'var(--font-dm-sans), sans-serif', whiteSpace: 'nowrap', cursor: 'default',
                  }}
                >
                  {item.label}
                  {item.children && (
                    <span style={{ fontSize: 9, transition: 'transform 0.2s', transform: openDropdown === item.label ? 'rotate(180deg)' : 'none' }}>▾</span>
                  )}
                </span>
              )}
              {item.children && openDropdown === item.label && (
                <div className="navbar-dropdown">
                  {item.children.map((child) => (
                    <Link key={child.label} href={child.href} onClick={() => setOpenDropdown(null)} className="navbar-dropdown-item">
                      {child.emoji && <SchoolIcon token={child.emoji} size={14} />} {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>

        <a href="https://orison.school/" target="_blank" rel="noopener noreferrer" className="navbar-cta">
          E-SCHOOL
        </a>

        {/* Mobile: hamburger */}
        <button
          type="button"
          className="navbar-toggle"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`navbar-drawer ${mobileOpen ? 'open' : ''}`} aria-hidden={!mobileOpen}>
        <div className="navbar-drawer-backdrop" onClick={closeMobile} />
        <div className="navbar-drawer-panel">
          <div className="navbar-drawer-header">
            <span>Menu</span>
            <button type="button" className="navbar-drawer-close" aria-label="Close menu" onClick={closeMobile}>✕</button>
          </div>
          <div className="navbar-drawer-links">
            {NAV_ITEMS.map((item) => (
              <div key={item.label} className="navbar-drawer-item">
                {item.href ? (
                  <Link href={item.href} onClick={closeMobile} className={isActive(pathname, item.href) ? 'active' : ''}>
                    {item.label}
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      className={`navbar-drawer-toggle ${mobileSubOpen === item.label ? 'open' : ''}`}
                      onClick={() => setMobileSubOpen(mobileSubOpen === item.label ? null : item.label)}
                    >
                      {item.label}
                      <span>▾</span>
                    </button>
                    {item.children && (
                      <div className={`navbar-drawer-sublinks ${mobileSubOpen === item.label ? 'open' : ''}`}>
                        {item.children.map((child) => (
                          <Link key={child.label} href={child.href} onClick={closeMobile}>
                            {child.emoji && <SchoolIcon token={child.emoji} size={14} />} {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          <a href="https://orison.school/" target="_blank" rel="noopener noreferrer" className="navbar-drawer-cta" onClick={closeMobile}>
            E-SCHOOL
          </a>
        </div>
      </div>
    </nav>
  )
}
