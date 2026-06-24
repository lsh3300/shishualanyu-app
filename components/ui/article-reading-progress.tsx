"use client"

import { useEffect, useState } from "react"

export function ArticleReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight

      if (scrollHeight <= 0) {
        setProgress(0)
        return
      }

      setProgress(Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)))
    }

    updateProgress()
    window.addEventListener("scroll", updateProgress, { passive: true })
    window.addEventListener("resize", updateProgress)

    return () => {
      window.removeEventListener("scroll", updateProgress)
      window.removeEventListener("resize", updateProgress)
    }
  }, [])

  return (
    <div className="fixed inset-x-0 top-0 z-40 h-[3px] bg-transparent">
      <div
        className="h-full bg-[linear-gradient(90deg,#2c4f7c_0%,#587ea7_100%)] transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
