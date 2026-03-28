'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">
          <h3>Gulf Model School</h3>
          <p>Gulf Model School has been a beacon of academic excellence in Dubai since 1982 — nurturing young minds across CBSE and Kerala Board curricula, with strong values and an unwavering commitment to every student&apos;s future.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="footer-tag">CBSE</span>
            <span className="footer-tag">Kerala Board</span>
            <span className="footer-tag">KG–Grade 12</span>
            <span className="footer-tag">Est. 1982</span>
          </div>
        </div>

        <div className="footer-col">
          <h4>About</h4>
          <Link href="/about">About GMS</Link>
          <Link href="/about/gm-message">GM&apos;s Message</Link>
          <Link href="/about/principal-message">Principal&apos;s Message</Link>
          <Link href="/about/achievements">Achievements</Link>
        </div>

        <div className="footer-col">
          <h4>Admissions</h4>
          <Link href="/admissions">Admissions Process</Link>
          <Link href="/admissions/fees">Fees & Payment</Link>
          <Link href="/admissions/enrolment">Online Registration</Link>
          <Link href="/admissions/uniforms">Uniforms</Link>
          <Link href="/admissions/transport">Transport</Link>
        </div>

        <div className="footer-col">
          <h4>Innovation</h4>
          <Link href="/vr-classroom">🥽 VR Classroom</Link>
          <Link href="/ai-lab">🤖 AI Lab</Link>
          <Link href="/askbook">📚 Ask My Book AI</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/careers">Careers</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Gulf Model School LLC, Dubai. All rights reserved.</span>
        <span>info@gmsdubai.ae &nbsp;·&nbsp; +971 4 2544222</span>
      </div>
    </footer>
  )
}
