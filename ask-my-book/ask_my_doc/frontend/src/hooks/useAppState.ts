// src/hooks/useAppState.ts
'use client'

import { createContext, useContext, useReducer, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Message, DocumentState, TokenUsage, RouteType } from '@/types'
import { nanoid } from '@/lib/nanoid'

// ── State ─────────────────────────────────────────────────────────────────────
interface State {
  document:  DocumentState | null
  messages:  Message[]
  sessionId: string
  /** After analysis, false until user opens the chat from the summary screen */
  chatUnlocked: boolean
  /** Live summary tokens; null when idle */
  summaryStream: string | null
}

const initialState: State = {
  document:  null,
  messages:  [],
  sessionId: nanoid(),
  chatUnlocked: false,
  summaryStream: null,
}

// ── Actions ───────────────────────────────────────────────────────────────────
type Action =
  | { type: 'SET_DOCUMENT'; payload: DocumentState }
  | { type: 'SET_SUMMARY';  payload: string }
  | { type: 'SET_COGNEE';   payload: boolean }
  | { type: 'CLEAR_DOCUMENT' }
  | { type: 'ADD_USER_MESSAGE';      payload: { id: string; content: string } }
  | { type: 'ADD_ASSISTANT_MESSAGE'; payload: { id: string } }
  | { type: 'SET_ROUTE';    payload: { id: string; route: RouteType } }
  | { type: 'APPEND_CHUNK'; payload: { id: string; chunk: string } }
  | { type: 'SET_USAGE';    payload: { id: string; usage: TokenUsage } }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'UNLOCK_CHAT' }
  | { type: 'SUMMARY_STREAM_START' }
  | { type: 'SUMMARY_STREAM_UPDATE'; payload: string }
  | { type: 'SUMMARY_STREAM_CANCEL' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_DOCUMENT':
      return { ...state, document: action.payload, messages: [], chatUnlocked: false, summaryStream: null }

    case 'SET_SUMMARY':
      if (!state.document) return state
      return {
        ...state,
        document: { ...state.document, summary: action.payload },
        summaryStream: null,
      }

    case 'SET_COGNEE':
      if (!state.document) return state
      return { ...state, document: { ...state.document, cogneeLoaded: action.payload } }

    case 'CLEAR_DOCUMENT':
      return { ...state, document: null, messages: [], chatUnlocked: false, summaryStream: null }

    case 'UNLOCK_CHAT':
      return { ...state, chatUnlocked: true }

    case 'SUMMARY_STREAM_START':
      return { ...state, summaryStream: '' }

    case 'SUMMARY_STREAM_UPDATE':
      return { ...state, summaryStream: action.payload }

    case 'SUMMARY_STREAM_CANCEL':
      return { ...state, summaryStream: null }

    case 'ADD_USER_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          { id: action.payload.id, role: 'user', content: action.payload.content, timestamp: Date.now() },
        ],
      }

    case 'ADD_ASSISTANT_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          { id: action.payload.id, role: 'assistant', content: '', route: '', timestamp: Date.now() },
        ],
      }

    case 'SET_ROUTE':
      return {
        ...state,
        messages: state.messages.map(m =>
          m.id === action.payload.id ? { ...m, route: action.payload.route } : m,
        ),
      }

    case 'APPEND_CHUNK':
      return {
        ...state,
        messages: state.messages.map(m =>
          m.id === action.payload.id
            ? { ...m, content: m.content + action.payload.chunk }
            : m,
        ),
      }

    case 'SET_USAGE':
      return {
        ...state,
        messages: state.messages.map(m =>
          m.id === action.payload.id ? { ...m, usage: action.payload.usage } : m,
        ),
      }

    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] }

    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
interface AppContextValue {
  state:    State
  dispatch: React.Dispatch<Action>
}

import React from 'react'
const AppContext = React.createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return React.createElement(AppContext.Provider, { value: { state, dispatch } }, children)
}

export function useAppState() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppState must be used inside AppProvider')
  return ctx
}