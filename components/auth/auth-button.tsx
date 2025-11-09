"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"

interface AuthButtonProps {
  onClick?: () => void
  className?: string
}

export function AuthButton({ onClick, className }: AuthButtonProps) {
  const { user } = useAuth()

  if (user) {
    return null // 已登录用户不显示登录按钮
  }

  return (
    <Button onClick={onClick} className={className}>
      <LogIn className="mr-2 h-4 w-4" />
      登录/注册
    </Button>
  )
}