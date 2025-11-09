import { UserMenu } from "@/components/auth/user-menu"
import { AuthButton } from "@/components/auth/auth-button"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogIn, LogOut } from "lucide-react"

export function HeaderAuth() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleLogin = () => {
    router.push("/auth")
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground hidden md:inline">
          欢迎, {user.user_metadata?.display_name || user.email?.split("@")[0] || "用户"}
        </span>
        <UserMenu />
      </div>
    )
  }

  return (
    <Button onClick={handleLogin} variant="outline">
      <LogIn className="mr-2 h-4 w-4" />
      登录/注册
    </Button>
  )
}