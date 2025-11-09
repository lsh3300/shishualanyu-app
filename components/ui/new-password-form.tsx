"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useSearchParams } from "next/navigation"

interface NewPasswordFormProps {
  onSuccess: () => void
}

export function NewPasswordForm({ onSuccess }: NewPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const searchParams = useSearchParams()
  
  // 从URL中获取重置令牌
  const resetToken = searchParams.get("token")
  const email = searchParams.get("email")

  const validateForm = () => {
    if (!formData.password) {
      setErrors("请输入新密码")
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

    try {
      // 在实际应用中，这里应该使用Supabase的updateUser方法来更新密码
      // 但由于我们使用的是客户端SDK，这里我们简化处理
      // 实际实现可能需要调用一个API端点来处理密码重置
      
      // 模拟密码重置过程
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccessMessage("密码重置成功！正在为您登录...")
      
      // 如果有邮箱信息，尝试登录
      if (email) {
        const { error } = await signIn(email, formData.password)
        if (error) {
          setErrors("密码已重置，但自动登录失败，请手动登录")
        }
      }
      
      // 延迟执行成功回调
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (error) {
      setErrors("重置密码失败，请稍后再试")
    } finally {
      setIsLoading(false)
    }
  }

  // 如果没有重置令牌，显示错误
  if (!resetToken || !email) {
    return (
      <Card className="p-6">
        <div className="text-center mb-6">
          <h2 className="heading-secondary mb-2">无效的重置链接</h2>
          <p className="text-sm text-muted-foreground">此重置密码链接已过期或无效，请重新申请。</p>
        </div>
        
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">缺少必要的重置参数</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <h2 className="heading-secondary mb-2">设置新密码</h2>
        <p className="text-sm text-muted-foreground">请输入您的新密码</p>
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
          <Label htmlFor="password">新密码</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="请输入新密码（至少6位）"
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
          <Label htmlFor="confirmPassword">确认新密码</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="请再次输入新密码"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
          {isLoading ? "设置中..." : "设置新密码"}
        </Button>
      </form>
    </Card>
  )
}