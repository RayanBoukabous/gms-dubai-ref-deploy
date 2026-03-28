// src/components/ChatMessage.tsx
'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '@/types'
import { BookOpenCheck, BanIcon, Cpu, Zap } from 'lucide-react'

const ROUTE_META: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  on_topic:  { label: 'On document',  icon: BookOpenCheck, cls: 'badge badge-on-topic'  },
  off_topic: { label: 'Off topic',    icon: BanIcon,       cls: 'badge badge-off-topic' },
  '':        { label: 'Analyzing…',   icon: Cpu,           cls: 'badge badge-pending'   },
}

interface Props { message: Message; isStreaming?: boolean }

export default function ChatMessage({ message, isStreaming }: Props) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end" style={{ animation: 'slideUp 0.3s ease both' }}>
        <div className="max-w-[72%]">
          <div className="bubble-user">{message.content}</div>
        </div>
      </div>
    )
  }

  const route = message.route ?? ''
  const meta  = ROUTE_META[route] ?? ROUTE_META['']
  const RouteIcon = meta.icon

  return (
    <div className="flex flex-col items-start gap-1.5" style={{ animation: 'slideUp 0.3s ease both' }}>
      {/* Route badge */}
      <span className={meta.cls}>
        <RouteIcon size={11} />
        {meta.label}
      </span>

      {/* Bubble */}
      <div className={`bubble-ai prose-chat max-w-[82%] ${isStreaming ? 'cursor-blink' : ''}`}>
        {message.content ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        ) : (
          <div className="flex items-center gap-1.5 py-1">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}
      </div>

      {/* Token count */}
      {message.usage && !isStreaming && (
        <p className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--muted-2)', letterSpacing: '0.04em' }}>
          <Zap size={9} style={{ color: 'var(--primary)' }} />
          {message.usage.total_tokens.toLocaleString()} tokens
        </p>
      )}
    </div>
  )
}
