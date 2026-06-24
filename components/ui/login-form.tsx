"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import { AlertCircle, Eye, EyeOff } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LoginFormProps {
  onSuccess: () => void
  onSwitchToRegister: () => void
  onSwitchToReset: () => void
  onContinueAsGuest: () => void
}

export function LoginForm({
  onSuccess,
  onSwitchToRegister,
  onSwitchToReset,
  onContinueAsGuest,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors(null)
    setIsLoading(true)

    const { error } = await signIn(formData.email, formData.password)

    if (error) {
      setErrors(error.message || "登录失败，请检查邮箱和密码后重试。")
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    onSuccess()
  }

  return (
    <div className="p-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 h-[92px] w-[92px]">
          <Image
            src="/brand/ssly-logo-current.png"
            alt="世说蓝语"
            width={92}
            height={92}
            className="h-[92px] w-[92px] object-contain"
            priority
          />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-800">欢迎回来</h2>
        <p className="text-sm text-gray-600">登录后可同步课程、收藏、订单和个人数据</p>
        <p className="mt-2 text-xs text-gray-500">只想先浏览内容，也可以直接以游客身份进入</p>
      </div>

      {errors && (
        <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{errors}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="请输入密码"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
          {isLoading ? "登录中..." : "登录"}
        </Button>
      </form>

      <div className="mt-3 space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full border-slate-200 bg-slate-50/80 text-slate-700 hover:bg-slate-100"
          onClick={onContinueAsGuest}
        >
          游客进入
        </Button>
        <p className="text-center text-[11px] leading-5 text-slate-500">
          游客可浏览页面、视频与搜索内容；点赞、收藏、下单和好友等功能会在使用时提醒登录。
        </p>
      </div>

      <div className="mt-4 text-center">
        <button type="button" className="text-sm text-primary hover:underline" onClick={onSwitchToReset}>
          忘记密码？
        </button>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          还没有账号？
          <button type="button" className="ml-1 text-primary hover:underline" onClick={onSwitchToRegister}>
            立即注册
          </button>
        </p>
      </div>
    </div>
  )
}
