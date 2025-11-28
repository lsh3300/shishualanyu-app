import { AuthLayout } from "@/components/auth/auth-layout"
import { NewPasswordForm } from "@/components/ui/new-password-form"
import { useRouter } from "next/navigation"

export default function ResetPasswordPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/")
  }

  return (
    <AuthLayout>
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md p-4">
          <NewPasswordForm onSuccess={handleSuccess} />
        </div>
      </div>
    </AuthLayout>
  )
}