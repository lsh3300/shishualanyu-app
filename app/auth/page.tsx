import { AuthLayout } from "@/components/auth/auth-layout"
import { AuthModal } from "@/components/auth/auth-modal"
import { PublicRoute } from "@/components/auth/public-route"

export default function AuthPage() {
  return (
    <PublicRoute>
      <AuthLayout>
        <AuthModal />
      </AuthLayout>
    </PublicRoute>
  )
}