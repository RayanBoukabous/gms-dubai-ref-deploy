'use client'

// src/app/providers.tsx
// Ce fichier est marqué 'use client' et contient tous les providers React.
// On le sépare du layout (qui est un Server Component) pour éviter les erreurs.

import { AppProvider } from '@/hooks/useAppState'
import { AuthProvider } from '@/lib/AuthContext'
import type { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>{children}</AppProvider>
    </AuthProvider>
  )
}
