"use client"

import { useEffect, useRef, useState } from "react"
import { Maximize, Pause, Play, Settings, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OptimizedImage } from "@/components/ui/optimized-image"

interface VideoPlayerProps {
  url?: string
  thumbnail: string
  title: string
  duration: string
}

export function VideoPlayer({ url, thumbnail, title, duration }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState("0:00")
  const [progress, setProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !shouldLoadVideo) return

    const updateTime = () => {
      const current = video.currentTime
      const total = video.duration || 0

      if (!Number.isNaN(current) && !Number.isNaN(total) && total > 0) {
        setProgress((current / total) * 100)
        const minutes = Math.floor(current / 60)
        const seconds = Math.floor(current % 60)
        setCurrentTime(`${minutes}:${seconds.toString().padStart(2, "0")}`)
      }
    }

    const handleLoadedMetadata = () => {
      setIsLoaded(true)
      if (isPlaying) {
        void video.play().catch(() => {
          setIsPlaying(false)
        })
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(100)
    }

    video.addEventListener("timeupdate", updateTime)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("ended", handleEnded)

    return () => {
      video.removeEventListener("timeupdate", updateTime)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("ended", handleEnded)
    }
  }, [isPlaying, shouldLoadVideo])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !shouldLoadVideo || !isLoaded) return

    if (isPlaying) {
      void video.play().catch(() => {
        setIsPlaying(false)
      })
      return
    }

    video.pause()
  }, [isLoaded, isPlaying, shouldLoadVideo])

  const togglePlay = () => {
    if (!url) return

    if (!shouldLoadVideo) {
      setShouldLoadVideo(true)
      setIsPlaying(true)
      return
    }

    setIsPlaying((prev) => !prev)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video || !isLoaded) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const clickedValue = (x / rect.width) * 100

    video.currentTime = (clickedValue / 100) * video.duration
    setProgress(clickedValue)
  }

  return (
    <div className="relative overflow-hidden rounded-lg bg-black">
      <div className="relative aspect-video">
        {shouldLoadVideo && url ? (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src={url}
            poster={thumbnail}
            preload="none"
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : null}

        {(!shouldLoadVideo || !isLoaded) && (
          <OptimizedImage
            src={thumbnail || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover"
            priority={true}
            usage="detail"
          />
        )}

        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Button
              size="lg"
              className="rounded-full bg-white/20 p-4 backdrop-blur-sm hover:bg-white/30"
              onClick={togglePlay}
            >
              <Play className="h-8 w-8 fill-white text-white" />
            </Button>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center gap-4">
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={togglePlay}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <div className="flex flex-1 items-center gap-2 text-sm text-white">
            <span>{currentTime}</span>
            <div className="h-1 flex-1 cursor-pointer rounded-full bg-white/20" onClick={handleProgressClick}>
              <div className="h-1 rounded-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
            <span>{duration}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
              <Settings className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
