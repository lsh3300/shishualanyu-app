"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, Maximize, Settings } from "lucide-react"
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
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => {
      const current = video.currentTime
      const total = video.duration || 0
      
      if (!isNaN(current) && !isNaN(total) && total > 0) {
        const progressPercent = (current / total) * 100
        setProgress(progressPercent)
        
        const minutes = Math.floor(current / 60)
        const seconds = Math.floor(current % 60)
        setCurrentTime(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      }
    }

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', () => setIsLoaded(true))
    
    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', () => setIsLoaded(true))
    }
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const clickedValue = (x / rect.width) * 100
    
    video.currentTime = (clickedValue / 100) * video.duration
    setProgress(clickedValue)
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <div className="aspect-video relative">
        {/* Video Element */}
        {url && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src={url}
            poster={thumbnail}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        )}
        
        {/* Fallback to image if no URL or not loaded */}
        {(!url || !isLoaded) && (
          <OptimizedImage 
            src={thumbnail || "/placeholder.svg"} 
            alt={title} 
            fill 
            className="object-cover" 
            priority={true} // 视频封面优先加载
          />
        )}
        
        {/* Play button overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Button
              size="lg"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-4"
              onClick={togglePlay}
            >
              <Play className="h-8 w-8 text-white fill-white" />
            </Button>
          </div>
        )}
      </div>

      {/* Video Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center gap-4">
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={togglePlay}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <div className="flex-1 flex items-center gap-2 text-white text-sm">
            <span>{currentTime}</span>
            <div 
              className="flex-1 bg-white/20 rounded-full h-1 cursor-pointer"
              onClick={handleProgressClick}
            >
              <div className="bg-primary h-1 rounded-full" style={{ width: `${progress}%` }}></div>
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
