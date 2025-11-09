"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, User, Bell, Lock, Moon, Sun, LogOut, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    avatar: "",
    bio: "",
    phone: "",
    notifications: {
      email: true,
      push: true,
      sms: false,
      promotions: true
    }
  })
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  // 当用户信息变化时，更新userData状态
  useEffect(() => {
    if (user) {
      // 从认证上下文获取用户信息
      const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "用户"
      const email = user.email || ""
      const avatar = user.user_metadata?.avatar_url || ""
      
      setUserData(prev => ({
        ...prev,
        name: displayName,
        email: email,
        avatar: avatar
      }))
      
      // 尝试从localStorage获取额外的用户数据
      const savedUserData = localStorage.getItem('userData')
      if (savedUserData) {
        const parsedData = JSON.parse(savedUserData)
        setUserData(prev => ({
          ...prev,
          bio: parsedData.bio || "",
          phone: parsedData.phone || "",
          notifications: parsedData.notifications || prev.notifications
        }))
      }
    }
  }, [user])

  // 更新用户资料
  const handleUpdateProfile = (updatedProfile: any) => {
    const newUserData = { ...userData, ...updatedProfile }
    setUserData(newUserData)
    localStorage.setItem('userData', JSON.stringify(newUserData))
    
    // 更新认证上下文中的用户元数据
    if (user && updatedProfile.name) {
      // 注意：实际应用中应该调用API更新用户元数据
      // 这里仅作为示例，实际需要通过Supabase API更新
      console.log("更新用户元数据:", updatedProfile)
    }
    
    setIsProfileDialogOpen(false)
  }

  // 更新密码
  const handleUpdatePassword = (data: { currentPassword: string, newPassword: string }) => {
    // 实际应用中应该调用API更新密码
    console.log("密码已更新", data)
    setIsPasswordDialogOpen(false)
    // 显示密码更新成功提示
    alert("密码已成功更新")
  }

  // 更新通知设置
  const handleUpdateNotifications = (updatedNotifications: any) => {
    const newUserData = { 
      ...userData, 
      notifications: updatedNotifications 
    }
    setUserData(newUserData)
    localStorage.setItem('userData', JSON.stringify(newUserData))
    setIsNotificationDialogOpen(false)
  }

  // 切换主题
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // 退出登录
  const handleLogout = async () => {
    await signOut()
    setIsLogoutDialogOpen(false)
    router.push('/profile')
  }

  // 如果未登录，显示提示登录界面
  if (!user) {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="p-8 text-center">
            <div className="mb-6">
              <User className="h-12 w-12 mx-auto text-muted-foreground" />
              <h1 className="text-2xl font-bold mt-4">设置</h1>
              <p className="text-muted-foreground mt-2">登录后可以管理您的账户设置</p>
            </div>
            <Link href="/auth">
              <Button className="w-full">去登录</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 头部 */}
      <header className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">设置</h1>
          </div>
        </div>
      </header>

      {/* 设置列表 */}
      <div className="p-4 space-y-6">
        {/* 账户设置 */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">账户设置</h2>
          <Card>
            {/* 个人资料 */}
            <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-4 h-auto">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={userData.avatar} alt={userData.name} />
                        <AvatarFallback>{userData.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium">{userData.name}</p>
                        <p className="text-sm text-muted-foreground">{userData.email}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>编辑个人资料</DialogTitle>
                </DialogHeader>
                <ProfileForm 
                  initialData={userData} 
                  onSubmit={handleUpdateProfile} 
                  onCancel={() => setIsProfileDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>

            <Separator />

            {/* 密码安全 */}
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-4 h-auto">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Lock className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">密码与安全</p>
                        <p className="text-sm text-muted-foreground">管理您的密码和安全设置</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>修改密码</DialogTitle>
                </DialogHeader>
                <PasswordForm 
                  onSubmit={handleUpdatePassword} 
                  onCancel={() => setIsPasswordDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>

            <Separator />

            {/* 通知设置 */}
            <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-4 h-auto">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Bell className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">通知设置</p>
                        <p className="text-sm text-muted-foreground">管理您接收通知的方式</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>通知设置</DialogTitle>
                </DialogHeader>
                <NotificationForm 
                  initialData={userData.notifications} 
                  onSubmit={handleUpdateNotifications} 
                  onCancel={() => setIsNotificationDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </Card>
        </div>

        {/* 外观设置 */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">外观设置</h2>
          <Card>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  {theme === 'dark' ? (
                    <Moon className="h-5 w-5 text-primary" />
                  ) : (
                    <Sun className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium">深色模式</p>
                  <p className="text-sm text-muted-foreground">切换应用的显示主题</p>
                </div>
              </div>
              <Switch 
                checked={theme === 'dark'} 
                onCheckedChange={toggleTheme} 
              />
            </div>
          </Card>
        </div>

        {/* 退出登录 */}
        <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <LogOut className="h-5 w-5 mr-2" />
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
              <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)}>
                取消
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                确认退出
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// 个人资料表单组件
interface ProfileFormProps {
  initialData: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

function ProfileForm({ initialData, onSubmit, onCancel }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    bio: initialData.bio || ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">姓名</Label>
        <Input 
          id="name" 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">邮箱</Label>
        <Input 
          id="email" 
          name="email" 
          type="email"
          value={formData.email} 
          onChange={handleChange} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">手机号码</Label>
        <Input 
          id="phone" 
          name="phone" 
          value={formData.phone} 
          onChange={handleChange} 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bio">个人简介</Label>
        <Textarea 
          id="bio" 
          name="bio" 
          value={formData.bio} 
          onChange={handleChange} 
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          保存
        </Button>
      </div>
    </form>
  )
}

// 密码表单组件
interface PasswordFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

function PasswordForm({ onSubmit, onCancel }: PasswordFormProps) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError("两次输入的新密码不一致")
      return
    }
    
    if (formData.newPassword.length < 6) {
      setError("新密码长度不能少于6位")
      return
    }
    
    onSubmit({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">当前密码</Label>
        <Input 
          id="currentPassword" 
          name="currentPassword" 
          type="password"
          value={formData.currentPassword} 
          onChange={handleChange} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="newPassword">新密码</Label>
        <Input 
          id="newPassword" 
          name="newPassword" 
          type="password"
          value={formData.newPassword} 
          onChange={handleChange} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">确认新密码</Label>
        <Input 
          id="confirmPassword" 
          name="confirmPassword" 
          type="password"
          value={formData.confirmPassword} 
          onChange={handleChange} 
          required 
        />
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          更新密码
        </Button>
      </div>
    </form>
  )
}

// 通知设置表单组件
interface NotificationFormProps {
  initialData: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

function NotificationForm({ initialData, onSubmit, onCancel }: NotificationFormProps) {
  const [formData, setFormData] = useState({
    email: initialData.email || false,
    push: initialData.push || false,
    sms: initialData.sms || false,
    promotions: initialData.promotions || false
  })

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }))
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
        <Switch 
          checked={formData.email} 
          onCheckedChange={(checked) => handleSwitchChange("email", checked)} 
        />
      </div>
      
      <Separator />
      
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">推送通知</p>
          <p className="text-sm text-muted-foreground">接收应用内推送通知</p>
        </div>
        <Switch 
          checked={formData.push} 
          onCheckedChange={(checked) => handleSwitchChange("push", checked)} 
        />
      </div>
      
      <Separator />
      
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">短信通知</p>
          <p className="text-sm text-muted-foreground">接收短信通知和提醒</p>
        </div>
        <Switch 
          checked={formData.sms} 
          onCheckedChange={(checked) => handleSwitchChange("sms", checked)} 
        />
      </div>
      
      <Separator />
      
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">营销信息</p>
          <p className="text-sm text-muted-foreground">接收促销和优惠信息</p>
        </div>
        <Switch 
          checked={formData.promotions} 
          onCheckedChange={(checked) => handleSwitchChange("promotions", checked)} 
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          保存
        </Button>
      </div>
    </form>
  )
}