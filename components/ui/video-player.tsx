"use client"

import { useState } from "react"
import { Play, Pause, Volume2, Maximize, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OptimizedImage } from "@/components/ui/optimized-image"

interface VideoPlayerProps {
  thumbnail: string
  title: string
  duration: string
}

export function VideoPlayer({ thumbnail, title, duration }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState("0:00")

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <div className="aspect-video relative">
        <OptimizedImage 
          src={thumbnail || "/placeholder.svg"} 
          alt={title} 
          fill 
          className="object-cover" 
          priority={true} // 视频封面优先加载
        />
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Button
              size="lg"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-4"
              onClick={() => setIsPlaying(true)}
            >
              <Play className="h-8 w-8 text-white fill-white" />
            </Button>
          </div>
        )}
      </div>

      {/* Video Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center gap-4">
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <div className="flex-1 flex items-center gap-2 text-white text-sm">
            <span>{currentTime}</span>
            <div className="flex-1 bg-white/20 rounded-full h-1">
              <div className="bg-primary h-1 rounded-full w-1/4"></div>
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
