"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface ResetPasswordFormProps {
  onSuccess: () => void
  onBackToLogin: () => void
}

export function ResetPasswordForm({ onSuccess, onBackToLogin }: ResetPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors(null)
    setSuccessMessage(null)

    if (!email.trim()) {
      setErrors("请输入您的邮箱地址")
      return
    }

    setIsLoading(true)

    const { error } = await resetPassword(email)

    if (error) {
      setErrors(error.message || "发送重置密码邮件失败，请稍后再试")
      setIsLoading(false)
    } else {
      setSuccessMessage("重置密码邮件已发送！请检查您的邮箱并按照指示重置密码。")
      setIsLoading(false)
      // 延迟切换到登录页面，让用户看到成功消息
      setTimeout(() => {
        onSuccess()
      }, 3000)
    }
  }

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <h2 className="heading-secondary mb-2">重置密码</h2>
        <p className="text-sm text-muted-foreground">输入您的邮箱地址，我们将发送重置密码的链接</p>
      </div>

      {errors && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{errors}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">邮箱</Label>
          <Input
            id="email"
            type="email"
            placeholder="请输入您的邮箱地址"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
          {isLoading ? "发送中..." : "发送重置邮件"}
        </Button>
      </form>

      <div className="text-center mt-6">
        <button
          type="button"
          className="text-primary hover:underline text-sm"
          onClick={onBackToLogin}
        >
          返回登录
        </button>
      </div>
    </Card>
  )
}