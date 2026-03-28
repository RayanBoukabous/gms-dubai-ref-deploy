// src/components/ChatInput.tsx
'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { SendHorizonal, CornerDownLeft } from 'lucide-react'

interface Props {
  onSend:      (text: string) => void
  disabled?:   boolean
  placeholder?: string
}

export default function ChatInput({ onSend, disabled, placeholder = 'Ask anything about your document…' }: Props) {
  const [value, setValue]     = useState('')
  const textareaRef           = useRef<HTMLTextAreaElement>(null)

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }

  const canSend = !!value.trim() && !disabled

  return (
    <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div
        className="flex items-end gap-3 rounded-2xl border px-4 py-3 transition-all duration-200"
        style={{
          borderColor: 'var(--border)',
          background: 'var(--bg)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)',
        }}
        onFocusCapture={e => {
          const d = e.currentTarget as HTMLDivElement
          d.style.borderColor = 'var(--primary)'
          d.style.boxShadow = '0 0 0 3px var(--primary-ring), inset 0 1px 3px rgba(0,0,0,0.04)'
        }}
        onBlurCapture={e => {
          const d = e.currentTarget as HTMLDivElement
          d.style.borderColor = 'var(--border)'
          d.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.04)'
        }}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={e => { setValue(e.target.value); autoResize() }}
          onKeyDown={handleKey}
          disabled={disabled}
          placeholder={disabled ? 'Upload and analyze a document to start chatting…' : placeholder}
          className="flex-1 resize-none outline-none text-sm leading-relaxed bg-transparent"
          style={{ color: 'var(--text)', fontFamily: 'var(--font-body)', maxHeight: 140 }}
        />
        <button
          onClick={submit}
          disabled={!canSend}
          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{
            background: canSend ? 'var(--primary)' : 'var(--border)',
            color: canSend ? 'white' : 'var(--muted-2)',
            transform: canSend ? 'scale(1)' : 'scale(0.95)',
            boxShadow: canSend ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
          }}
        >
          <SendHorizonal size={15} />
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-2">
        <CornerDownLeft size={10} style={{ color: 'var(--muted-2)' }} />
        <p className="text-[10px]" style={{ color: 'var(--muted-2)', letterSpacing: '0.04em' }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
