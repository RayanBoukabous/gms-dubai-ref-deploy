'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import TopBar from './TopBar'
import Ticker from './Ticker'
import Navbar from './Navbar'
import Footer from './Footer'
import Modal from '@/components/ui/Modal'

type ModalName = 'askbook-modal' | 'apply-modal' | null

const ModalContext = createContext<{
  openModal: (name: 'askbook-modal' | 'apply-modal') => void
  closeModal: () => void
} | null>(null)

export function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) return { openModal: () => {}, closeModal: () => {} }
  return ctx
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [openModal, setOpenModal] = useState<ModalName>(null)
  const openModalFn = useCallback((name: 'askbook-modal' | 'apply-modal') => setOpenModal(name), [])
  const closeModalFn = useCallback(() => setOpenModal(null), [])

  return (
    <ModalContext.Provider value={{ openModal: openModalFn, closeModal: closeModalFn }}>
      <TopBar />
      <Ticker />
      <Navbar pathname={pathname ?? '/'} />
      <main>{children}</main>
      <Footer />

      <Modal
        isOpen={openModal === 'askbook-modal'}
        onClose={closeModalFn}
        title="Coming Soon"
        subtitle="Ask My Book with AI — free trial will be available shortly. Stay tuned!"
      >
        <p style={{ color: 'var(--text-light)', marginBottom: 24, lineHeight: 1.6 }}>
          We are preparing the Ask My Book experience. You will soon be able to try it free for 7 days — no credit card required.
        </p>
        <button type="button" className="btn-primary" style={{ width: '100%', padding: 14 }} onClick={closeModalFn}>
          Close
        </button>
      </Modal>

      <Modal
        isOpen={openModal === 'apply-modal'}
        onClose={closeModalFn}
        title="Apply for this Position"
        subtitle="Send us your application and we'll be in touch within 5 working days."
      >
        <div className="form-row">
          <div className="form-group"><label>Full Name</label><input type="text" placeholder="Your full name" /></div>
          <div className="form-group"><label>Mobile</label><input type="tel" placeholder="+971 5X XXX XXXX" /></div>
        </div>
        <div className="form-group"><label>Email</label><input type="email" placeholder="your@email.com" /></div>
        <div className="form-group"><label>Position Applied For</label><input type="text" placeholder="Role title" /></div>
        <div className="form-group"><label>Years of Experience</label><input type="number" placeholder="e.g. 5" min={0} /></div>
        <div className="form-group"><label>Current / Last Employer</label><input type="text" placeholder="School / organization name" /></div>
        <div className="form-group"><label>Cover Message</label><textarea placeholder="Briefly describe your experience and why you'd like to join GMS..." /></div>
        <button className="btn-primary" style={{ width: '100%', padding: 14 }} onClick={closeModalFn}>
          Submit Application →
        </button>
      </Modal>
    </ModalContext.Provider>
  )
}
