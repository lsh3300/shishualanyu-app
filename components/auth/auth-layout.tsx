"use client"

import { ReactNode } from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { FavoritesProvider } from "@/hooks/use-favorites"

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <AuthProvider>
      <FavoritesProvider>
        {children}
      </FavoritesProvider>
    </AuthProvider>
  )
}