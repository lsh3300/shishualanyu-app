import type React from "react"
import { Noto_Serif_SC } from "next/font/google"

const storeFont = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-source-han-sans",
  display: "swap",
})

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div className={`${storeFont.className} ${storeFont.variable}`}>{children}</div>
}
