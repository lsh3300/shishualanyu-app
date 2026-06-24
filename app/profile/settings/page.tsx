"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell, ChevronRight, CircleHelp, Lock, LogOut, ShieldCheck, Smartphone, User } from "lucide-react"
import { useRouter } from "next/navigation"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { AvatarUpload } from "@/components/ui/avatar-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProfileSubpageHeader } from "@/components/ui/profile-subpage-header"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { useUserProfile } from "@/hooks/use-user-profile"
import { createClient } from "@/lib/supabase/client"

type NotificationSettings = {
  email: boolean
  push: boolean
  sms: boolean
  promotions: boolean
}

type GeneralSettings = {
  learningReminders: boolean
  orderUpdates: boolean
  useCellularMedia: boolean
}

type UserData = {
  name: string
  email: string
  avatar: string
  bio: string
  phone: string
  notifications: NotificationSettings
  general: GeneralSettings
}

type ProfileUpdate = Partial<Pick<UserData, "name" | "email" | "avatar" | "bio" | "phone">>

const defaultNotifications: NotificationSettings = {
  email: true,
  push: true,
  sms: false,
  promotions: true,
}

const defaultGeneral: GeneralSettings = {
  learningReminders: true,
  orderUpdates: true,
  useCellularMedia: false,
}

const SETTINGS_STORAGE_KEY = "profileSettingsData"

export default function SettingsPage() {
  const { user, signOut, getToken } = useAuth()
  const { profile, mutate: mutateProfile } = useUserProfile()
  const router = useRouter()
  const supabase = createClient()

  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    avatar: "",
    bio: "",
    phone: "",
    notifications: defaultNotifications,
    general: defaultGeneral,
  })
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  useEffect(() => {
    if (!user) return

    const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "用户"
    const email = user.email || ""
    const avatar = user.user_metadata?.avatar_url || ""

    setUserData((prev) => ({
      ...prev,
      name: displayName,
      email,
      avatar,
    }))

    const savedData = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (savedData) {
      const parsed = JSON.parse(savedData)
      setUserData((prev) => ({
        ...prev,
        bio: parsed.bio || "",
        phone: parsed.phone || "",
        notifications: parsed.notifications || prev.notifications,
        general: parsed.general || prev.general,
      }))
    }
  }, [user])

  useEffect(() => {
    if (!user || !profile) return

    setUserData((prev) => ({
      ...prev,
      name: profile.full_name || prev.name,
      avatar: profile.avatar_url || prev.avatar,
    }))
  }, [user, profile])

  const persistLocalSettings = (next: UserData) => {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        bio: next.bio,
        phone: next.phone,
        notifications: next.notifications,
        general: next.general,
      })
    )
  }

  const handleUpdateProfile = (updatedProfile: ProfileUpdate) => {
    const next = { ...userData, ...updatedProfile }
    setUserData(next)
    persistLocalSettings(next)

    if (user) {
      ;(async () => {
        try {
          const token = await getToken()
          if (!token) return

          await fetch("/api/user/profile", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              full_name: next.name,
              avatar_url: next.avatar || null,
            }),
          })

          mutateProfile(
            (prev) => ({
              ...(prev || {}),
              full_name: next.name,
              avatar_url: next.avatar || null,
            }),
            { revalidate: false }
          )
        } catch (error) {
          console.error("更新用户资料失败", error)
        }
      })()
    }

    setIsProfileDialogOpen(false)
  }

  const handleUpdatePassword = async (data: { currentPassword: string; newPassword: string }) => {
    const { error } = await supabase.auth.updateUser({ password: data.newPassword })

    if (error) {
      toast({
        title: "密码更新失败",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    setIsPasswordDialogOpen(false)
    toast({
      title: "密码已更新",
      description: "下次登录请使用新密码。",
    })
  }

  const handleUpdateNotifications = (updatedNotifications: NotificationSettings) => {
    const next = { ...userData, notifications: updatedNotifications }
    setUserData(next)
    persistLocalSettings(next)
    setIsNotificationDialogOpen(false)
  }

  const handleUpdateGeneral = (key: keyof GeneralSettings, checked: boolean) => {
    const next = {
      ...userData,
      general: {
        ...userData.general,
        [key]: checked,
      },
    }
    setUserData(next)
    persistLocalSettings(next)
  }

  const handleLogout = async () => {
    await signOut()
    setIsLogoutDialogOpen(false)
    router.push("/profile")
  }

  if (!user) {
    return (
      <div className="page-container">
        <ProfileSubpageHeader title="设置" subtitle="账户与常用偏好" backHref="/profile" />
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="border-white/70 bg-white/82 shadow-[0_14px_34px_rgba(69,89,120,0.10)] backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <User className="mx-auto h-12 w-12 text-muted-foreground" />
                <h1 className="mt-4 text-2xl font-bold">设置</h1>
                <p className="mt-2 text-muted-foreground">登录后可以管理账户资料、通知和常用偏好。</p>
                <Link href={`/auth?view=login&redirectTo=${encodeURIComponent("/profile/settings")}`}>
                  <Button className="mt-5 w-full">去登录</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="page-container page-background-home-echo pb-[calc(11rem+env(safe-area-inset-bottom,0px))]">
      <ProfileSubpageHeader title="设置" subtitle="账户与常用偏好" backHref="/profile" />

      <main className="px-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] pt-2 space-y-4">
        <Card className="overflow-hidden rounded-[22px] border-white/70 bg-white/82 shadow-[0_12px_28px_rgba(69,89,120,0.10)] backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AvatarUpload
                currentAvatarUrl={userData.avatar}
                onAvatarChange={(newUrl) => {
                  setUserData((prev) => ({ ...prev, avatar: newUrl || "" }))
                  mutateProfile(
                    (prev) => ({
                      ...(prev || {}),
                      avatar_url: newUrl,
                    }),
                    { revalidate: false }
                  )
                }}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-slate-900">{userData.name}</p>
                <p className="truncate text-[12px] text-slate-500">{userData.email}</p>
                <p className="mt-1 line-clamp-1 text-[11px] text-[#6f86a8]">头像、昵称和简介都可以在这里整理。</p>
              </div>
              <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 rounded-full px-3 text-xs">
                    编辑
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>编辑个人资料</DialogTitle>
                  </DialogHeader>
                  <ProfileForm initialData={userData} onSubmit={handleUpdateProfile} onCancel={() => setIsProfileDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-2">
          <p className="px-1 text-[11px] tracking-[0.18em] text-[#7d90ae]">账户</p>
          <Card className="rounded-[22px] border-white/70 bg-white/82 shadow-[0_10px_24px_rgba(69,89,120,0.08)] backdrop-blur-sm">
            <SettingsActionRow
              icon={<Lock className="h-5 w-5 text-[#496ea5]" />}
              title="密码与安全"
              description="修改登录密码，保持账户安全。"
              dialogOpen={isPasswordDialogOpen}
              onDialogOpenChange={setIsPasswordDialogOpen}
              dialogTitle="修改密码"
            >
              <PasswordForm onSubmit={handleUpdatePassword} onCancel={() => setIsPasswordDialogOpen(false)} />
            </SettingsActionRow>
            <Separator />
            <SettingsLabelRow
              icon={<ShieldCheck className="h-5 w-5 text-[#496ea5]" />}
              title="登录保护"
              description="当前版本保留基础登录链路，后续再补更细的安全管理。"
              trailing="基础模式"
            />
          </Card>
        </section>

        <section className="space-y-2">
          <p className="px-1 text-[11px] tracking-[0.18em] text-[#7d90ae]">通知</p>
          <Card className="rounded-[22px] border-white/70 bg-white/82 shadow-[0_10px_24px_rgba(69,89,120,0.08)] backdrop-blur-sm">
            <SettingsActionRow
              icon={<Bell className="h-5 w-5 text-[#496ea5]" />}
              title="通知管理"
              description="控制课程更新、系统消息和营销提醒。"
              dialogOpen={isNotificationDialogOpen}
              onDialogOpenChange={setIsNotificationDialogOpen}
              dialogTitle="通知设置"
            >
              <NotificationForm initialData={userData.notifications} onSubmit={handleUpdateNotifications} onCancel={() => setIsNotificationDialogOpen(false)} />
            </SettingsActionRow>
          </Card>
        </section>

        <section className="space-y-2">
          <p className="px-1 text-[11px] tracking-[0.18em] text-[#7d90ae]">通用偏好</p>
          <Card className="rounded-[22px] border-white/70 bg-white/82 shadow-[0_10px_24px_rgba(69,89,120,0.08)] backdrop-blur-sm">
            <ToggleRow
              icon={<Bell className="h-5 w-5 text-[#496ea5]" />}
              title="学习提醒"
              description="在本地记录你是否需要课程提醒。"
              checked={userData.general.learningReminders}
              onCheckedChange={(checked) => handleUpdateGeneral("learningReminders", checked)}
            />
            <Separator />
            <ToggleRow
              icon={<Smartphone className="h-5 w-5 text-[#496ea5]" />}
              title="订单动态提醒"
              description="保留本地偏好，便于后续接入更完整的消息链路。"
              checked={userData.general.orderUpdates}
              onCheckedChange={(checked) => handleUpdateGeneral("orderUpdates", checked)}
            />
            <Separator />
            <ToggleRow
              icon={<CircleHelp className="h-5 w-5 text-[#496ea5]" />}
              title="移动网络加载媒体"
              description="控制在移动网络环境下是否默认加载大图和视频。"
              checked={userData.general.useCellularMedia}
              onCheckedChange={(checked) => handleUpdateGeneral("useCellularMedia", checked)}
            />
          </Card>
        </section>

        <section className="space-y-2">
          <p className="px-1 text-[11px] tracking-[0.18em] text-[#7d90ae]">说明</p>
          <Card className="rounded-[22px] border-white/70 bg-white/82 shadow-[0_10px_24px_rgba(69,89,120,0.08)] backdrop-blur-sm">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between rounded-2xl bg-[#f5f8fc] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">当前版本</p>
                  <p className="text-xs text-slate-500">用于项目展示与评审体验。</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs text-[#5e7598] ring-1 ring-black/5">1.3.x</span>
              </div>
              <p className="text-sm leading-6 text-slate-600">
                外观设置已从这里移除，当前页面风格统一维护，避免出现多个尚未打磨完成的主题入口。
              </p>
            </CardContent>
          </Card>
        </section>

        <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="h-11 w-full rounded-2xl">
              <LogOut className="mr-2 h-5 w-5" />
              退出登录
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>确认退出登录</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>您确定要退出登录吗？</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)}>取消</Button>
              <Button variant="destructive" onClick={handleLogout}>确认退出</Button>
            </div>
          </DialogContent>
        </Dialog>
        <div className="h-12" aria-hidden="true" />
      </main>

      <BottomNav />
    </div>
  )
}

function SettingsActionRow({
  icon,
  title,
  description,
  dialogOpen,
  onDialogOpenChange,
  dialogTitle,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  dialogOpen: boolean
  onDialogOpenChange: (open: boolean) => void
  dialogTitle: string
  children: React.ReactNode
}) {
  return (
    <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
      <DialogTrigger asChild>
        <button type="button" className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-black/[0.02]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#edf4ff]">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-medium text-slate-900">{title}</p>
            <p className="mt-0.5 text-[12px] leading-5 text-slate-500">{description}</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

function SettingsLabelRow({
  icon,
  title,
  description,
  trailing,
}: {
  icon: React.ReactNode
  title: string
  description: string
  trailing: string
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#edf4ff]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium text-slate-900">{title}</p>
        <p className="mt-0.5 text-[12px] leading-5 text-slate-500">{description}</p>
      </div>
      <span className="shrink-0 text-[12px] text-[#6f86a8]">{trailing}</span>
    </div>
  )
}

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: React.ReactNode
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#edf4ff]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium text-slate-900">{title}</p>
        <p className="mt-0.5 text-[12px] leading-5 text-slate-500">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

interface ProfileFormProps {
  initialData: UserData
  onSubmit: (data: ProfileUpdate) => void
  onCancel: () => void
}

function ProfileForm({ initialData, onSubmit, onCancel }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    bio: initialData.bio || "",
    avatar: initialData.avatar || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (newUrl: string | null) => {
    setFormData((prev) => ({ ...prev, avatar: newUrl || "" }))
    onSubmit({ ...formData, avatar: newUrl || "" })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col items-center space-y-2">
        <Label className="text-center">头像</Label>
        <AvatarUpload currentAvatarUrl={formData.avatar} onAvatarChange={handleAvatarChange} size="lg" />
        <p className="text-xs text-muted-foreground">点击头像更换，支持 JPG、PNG、WebP，最大 5MB</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">姓名</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">邮箱</Label>
        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">手机号</Label>
        <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">个人简介</Label>
        <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={3} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>取消</Button>
        <Button type="submit">保存</Button>
      </div>
    </form>
  )
}

interface PasswordFormProps {
  onSubmit: (data: { currentPassword: string; newPassword: string }) => void
  onCancel: () => void
}

function PasswordForm({ onSubmit, onCancel }: PasswordFormProps) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      setError("两次输入的新密码不一致")
      return
    }

    if (formData.newPassword.length < 6) {
      setError("新密码长度不能少于 6 位")
      return
    }

    onSubmit({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">当前密码</Label>
        <Input id="currentPassword" name="currentPassword" type="password" value={formData.currentPassword} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">新密码</Label>
        <Input id="newPassword" name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">确认新密码</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>取消</Button>
        <Button type="submit">更新密码</Button>
      </div>
    </form>
  )
}

interface NotificationFormProps {
  initialData: NotificationSettings
  onSubmit: (data: NotificationSettings) => void
  onCancel: () => void
}

function NotificationForm({ initialData, onSubmit, onCancel }: NotificationFormProps) {
  const [formData, setFormData] = useState<NotificationSettings>({
    email: initialData.email || false,
    push: initialData.push || false,
    sms: initialData.sms || false,
    promotions: initialData.promotions || false,
  })

  const handleSwitchChange = (name: keyof NotificationSettings, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">电子邮件通知</p>
          <p className="text-sm text-muted-foreground">接收课程更新和重要通知</p>
        </div>
        <Switch checked={formData.email} onCheckedChange={(checked) => handleSwitchChange("email", checked)} />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">推送通知</p>
          <p className="text-sm text-muted-foreground">接收应用内推送通知</p>
        </div>
        <Switch checked={formData.push} onCheckedChange={(checked) => handleSwitchChange("push", checked)} />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">短信通知</p>
          <p className="text-sm text-muted-foreground">接收短信通知和提醒</p>
        </div>
        <Switch checked={formData.sms} onCheckedChange={(checked) => handleSwitchChange("sms", checked)} />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">营销信息</p>
          <p className="text-sm text-muted-foreground">接收促销和优惠信息</p>
        </div>
        <Switch checked={formData.promotions} onCheckedChange={(checked) => handleSwitchChange("promotions", checked)} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>取消</Button>
        <Button type="submit">保存</Button>
      </div>
    </form>
  )
}
