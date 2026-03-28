'use client'
import { useState } from 'react'
import SchoolIcon from '@/components/ui/SchoolIcon'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <div>
      <div className="page-banner">
        <div className="breadcrumb">Home <span>›</span> Contact</div>
        <h1>Contact Us</h1>
      </div>
      <section>
        <div className="section-inner">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Get in Touch</h2>
              <p style={{ color: 'var(--text-light)', marginBottom: 32, lineHeight: 1.7 }}>
                Our team is available Sunday to Thursday, 7:30 AM to 3:30 PM. We look forward to hearing from you.
              </p>
              {[
                { icon: '📍', title: 'Address', content: 'Gulf Model School LLC\nAl Karama, Dubai\nUnited Arab Emirates' },
                { icon: '📞', title: 'Phone', content: '+971 4 2544222' },
                { icon: '✉️', title: 'Email', content: 'info@gmsdubai.ae' },
                { icon: '🌐', title: 'Website & Portal', content: 'gmsdubai.ae\nStudent Portal: orison.school' },
                { icon: '📱', title: 'Social Media', content: 'Instagram: @gulfmodelschool\nFacebook: Gulf Model School Dubai' },
              ].map(item => (
                <div key={item.title} className="contact-item">
                  <div className="contact-icon"><SchoolIcon token={item.icon} size={20} /></div>
                  <div>
                    <h4>{item.title}</h4>
                    <p style={{ whiteSpace: 'pre-line' }}>{item.content}</p>
                  </div>
                </div>
              ))}
              <div className="contact-map-wrap">
                <p style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: 4 }}>Gulf Model School — Al Karama, Dubai</p>
                <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 12 }}>
                  Interactive map — GPS: 25.2774406° N, 55.4053305° E
                </p>
                <iframe
                  title="Gulf Model School — Al Karama, Dubai"
                  src="https://www.google.com/maps?q=25.2774406,55.4053305&z=16&output=embed"
                  className="contact-map-iframe"
                  width="100%"
                  height="280"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            <div className="contact-form">
              <h3>Send Us a Message</h3>
              <div className="form-row">
                <div className="form-group"><label>Your Name</label><input type="text" placeholder="Full name" /></div>
                <div className="form-group"><label>Phone Number</label><input type="tel" placeholder="+971 5X XXX XXXX" /></div>
              </div>
              <div className="form-group"><label>Email Address</label><input type="email" placeholder="your@email.com" /></div>
              <div className="form-group">
                <label>Subject</label>
                <select>
                  <option value="">Select a topic</option>
                  {['Admissions Enquiry','Fee Payment','Academic Query','Transport','VR Classroom','AI Lab','Ask My Book with AI','General Enquiry','Careers'].map(o => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div className="form-group"><label>Message</label><textarea placeholder="Type your message here..." /></div>
              <button className="btn-primary" style={{ width: '100%', padding: 14 }} onClick={() => setSubmitted(true)}>
                Send Message →
              </button>
              {submitted && (
                <div className="success-message">
                  ✅ Thank you! Your message has been sent. We'll respond within 1–2 working days.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
