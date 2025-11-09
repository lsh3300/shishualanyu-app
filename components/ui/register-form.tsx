"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface RegisterFormProps {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { signUp } = useAuth()

  const validateForm = () => {
    if (!formData.name.trim()) {
      setErrors("请输入姓名")
      return false
    }
    if (!formData.email.trim()) {
      setErrors("请输入邮箱")
      return false
    }
    if (!formData.password) {
      setErrors("请输入密码")
      return false
    }
    if (formData.password.length < 6) {
      setErrors("密码长度至少为6位")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setErrors("两次输入的密码不一致")
      return false
    }
    if (!formData.agreeToTerms) {
      setErrors("请同意用户协议和隐私政策")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors(null)
    setSuccessMessage(null)

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    const { error } = await signUp(formData.email, formData.password, {
      display_name: formData.name,
    })

    if (error) {
      setErrors(error.message || "注册失败，请稍后再试")
      setIsLoading(false)
    } else {
      setSuccessMessage("注册成功！请检查您的邮箱并点击确认链接以激活账户。")
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
        <h2 className="heading-secondary mb-2">加入我们</h2>
        <p className="text-sm text-muted-foreground">创建账户，开启蓝染文化之旅</p>
      </div>

      {errors && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{errors}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
          <span className="text-sm">{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">姓名</Label>
          <Input
            id="name"
            type="text"
            placeholder="请输入姓名"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">邮箱</Label>
          <Input
            id="email"
            type="email"
            placeholder="请输入邮箱"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">密码</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="请输入密码（至少6位）"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">确认密码</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
          />
          <Label htmlFor="terms" className="text-sm">
            我同意
            <button type="button" className="text-primary hover:underline mx-1">
              用户协议
            </button>
            和
            <button type="button" className="text-primary hover:underline mx-1">
              隐私政策
            </button>
          </Label>
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading || !formData.agreeToTerms}>
          {isLoading ? "注册中..." : "注册"}
        </Button>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          已有账户？
          <button type="button" className="text-primary hover:underline ml-1" onClick={onSwitchToLogin}>
            立即登录
          </button>
        </p>
      </div>
    </Card>
  )
}
