'use client'

export default function TopBar() {
  return (
    <div className="topbar" style={{
      background: 'var(--navy)',
      color: 'rgba(255,255,255,0.85)',
      fontSize: 12,
      letterSpacing: '0.5px',
      padding: '6px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 200,
      position: 'relative',
    }}>
      <div className="topbar-brand">Gulf Model School Dubai &nbsp;·&nbsp; Est. 1982 &nbsp;·&nbsp; CBSE &amp; Kerala Board</div>
      <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <a href="mailto:info@gmsdubai.ae" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>
          info@gmsdubai.ae
        </a>
        <a href="tel:+97142544222" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>
          +971 4 2544222
        </a>
        <a
          href="https://orison.school/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'var(--orange)',
            color: 'white',
            padding: '4px 14px',
            borderRadius: 3,
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: 'var(--font-dm-sans), sans-serif',
            transition: 'background 0.2s',
            textDecoration: 'none',
          }}
        >
          E-SCHOOL
        </a>
      </div>
    </div>
  )
}
