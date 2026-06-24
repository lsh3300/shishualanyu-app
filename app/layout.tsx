import type React from "react"
import type { Metadata } from "next"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import Script from "next/script"
import { AuthLayout } from "@/components/auth/auth-layout"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { PageLoadingBar } from "@/components/ui/page-loading"
import { MobileContainer } from "@/components/ui/mobile-container"
import { resolveStaticAssetUrl } from "@/lib/local-asset-paths"
import "./globals.css"

export const metadata: Metadata = {
  title: "世说蓝语 - 传承蓝染文化",
  description: "探索传统蓝染工艺，学习扎染技艺，购买精美文创产品",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/favicon-current.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/favicon-current.png",
  },
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1e3a5f" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1f33" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const sharedHomeBackgroundUrl = resolveStaticAssetUrl("/home-backgrounds/home-page-full-01.jpg")

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`font-sans ${GeistMono.variable}`}
        suppressHydrationWarning
        style={
          sharedHomeBackgroundUrl
            ? ({
                ["--ssly-home-background-image" as string]: `url("${sharedHomeBackgroundUrl}")`,
              } as React.CSSProperties)
            : undefined
        }
      >
        <Script id="theme-sanitize" strategy="beforeInteractive">
          {`(function(){try{var k='indigo-theme';var v=localStorage.getItem(k);if(v==='system'){localStorage.setItem(k,'light');}if(v==='dark'){localStorage.setItem(k,'porcelain-blue');}document.documentElement.classList.remove('system');document.documentElement.classList.remove('dark');}catch(e){}})();`}
        </Script>
        <ThemeProvider>
          <Suspense fallback={null}>
            <PageLoadingBar />
          </Suspense>
          <MobileContainer>
            <AuthLayout>
              <Suspense fallback={null}>{children}</Suspense>
            </AuthLayout>
          </MobileContainer>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
