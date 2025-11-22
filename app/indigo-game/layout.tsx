import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "染蓝时光 - 蓝染工艺模拟游戏",
  description: "沉浸式体验传统蓝染工艺，学习扎染、蜡染技法",
}

export default function IndigoGameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
