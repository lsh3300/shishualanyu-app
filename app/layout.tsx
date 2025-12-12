import type React from "react"
import type { Metadata } from "next"
import { Noto_Sans_SC } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthLayout } from "@/components/auth/auth-layout"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { PageLoadingBar } from "@/components/ui/page-loading"
import "./globals.css"

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-source-han-sans",
  weight: ["300", "400", "500", "700"],
})

export const metadata: Metadata = {
  title: "世说蓝语 - 传承蓝染文化",
  description: "探索传统蓝染工艺，学习扎染技艺，购买精美文创产品",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`font-sans ${notoSansSC.variable} ${GeistMono.variable}`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Suspense fallback={null}>
            <PageLoadingBar />
          </Suspense>
          <AuthLayout>
            <Suspense fallback={null}>{children}</Suspense>
          </AuthLayout>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
