"use client"

import { ReactNode } from "react"
import { AuthProvider } from "@/contexts/auth-context"

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}