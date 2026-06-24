'use client'

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useFavorites } from "@/hooks/use-favorites"
import { useCourseDetail } from "@/hooks/use-course-detail"
import { useAuth } from "@/contexts/auth-context"
import { resolveStaticAssetUrl } from "@/lib/local-asset-paths"
import { toast } from "sonner"
import {
  ArrowLeft,
  ChevronRight,
  Expand,
  Heart,
  Lock,
  MessageCircle,
  Pause,
  Play,
  Share2,
  ThumbsUp,
  Timer,
  Trash2,
} from "lucide-react"

function SectionCard({
  className = "",
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <Card className={`overflow-hidden rounded-[24px] border border-[#e7e1d8] bg-white shadow-[0_10px_22px_rgba(15,23,42,0.04)] ${className}`}>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  )
}

function formatDuration(minutes?: number | null) {
  if (!minutes || minutes <= 0) return "12:58"
  const totalSeconds = Math.round(minutes * 60)
  const mm = Math.floor(totalSeconds / 60)
  const ss = totalSeconds % 60
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
}

function formatPlaybackTime(seconds?: number | null) {
  if (!seconds || Number.isNaN(seconds) || seconds < 0) return "00:00"
  const totalSeconds = Math.floor(seconds)
  const mm = Math.floor(totalSeconds / 60)
  const ss = totalSeconds % 60
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
}

export default function CourseDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const { user, getToken } = useAuth()
  const heroRef = useRef<HTMLElement | null>(null)
  const commentsRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const heroControlsTimerRef = useRef<number | null>(null)
  const learningStartedRef = useRef(false)
  const lastSyncedProgressRef = useRef(0)
  const progressSyncTimerRef = useRef<number | null>(null)

  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [isHeroPlaying, setIsHeroPlaying] = useState(false)
  const [heroControlsVisible, setHeroControlsVisible] = useState(true)
  const [heroCurrentSeconds, setHeroCurrentSeconds] = useState(0)
  const [heroDurationSeconds, setHeroDurationSeconds] = useState(0)
  const [heroVideoReady, setHeroVideoReady] = useState(false)
  const [heroMediaAspect, setHeroMediaAspect] = useState(16 / 9)
  const [heroMediaFrame, setHeroMediaFrame] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  })

  const { isCourseFavorite, addCourseToFavorites, removeCourseFromFavorites } = useFavorites()

  const courseId = Array.isArray(params?.id) ? params.id[0] : params?.id
  const { courseDetail, loading, error, mutate } = useCourseDetail(courseId)

  const course = (courseDetail?.course as Record<string, unknown> | null) ?? null
  const courseIdStr = (course?.id as string) ?? ""
  const courseTitle = (course?.title as string) ?? ""
  const courseDescription = (course?.description as string) ?? null
  const courseImageUrl = resolveStaticAssetUrl((course?.image_url as string) ?? null) ?? null
  const courseVideoUrl = (course?.video_url as string) ?? null
  const courseDuration = (course?.duration as number) ?? null
  const hasPlayableVideo = Boolean(courseVideoUrl)
  const returnTo = searchParams.get("returnTo")
  const from = searchParams.get("from")
  const inheritedParams = new URLSearchParams(returnTo ? { returnTo } : from ? { from } : {})
  const inheritedQuery = inheritedParams.toString()
  const inheritedSuffix = inheritedQuery ? `?${inheritedQuery}` : ""

  const comments = (courseDetail?.comments as Record<string, unknown>[]) ?? []
  const [localComments, setLocalComments] = useState<Record<string, unknown>[]>([])
  const allComments = localComments.length > 0
    ? [...localComments, ...comments.filter((c) => !localComments.find((l) => l.id === c.id))]
    : comments
  const relatedCourses = (courseDetail?.relatedCourses as Record<string, unknown>[]) ?? []

  const description =
    courseDescription ||
    "从一株蓼蓝到一匹布，探寻千年不褪色的东方智慧，在蓝与白之间，感受时光沉淀的匠心。"

  const totalDurationLabel = formatDuration(courseDuration)
  const currentPlaybackLabel = formatPlaybackTime(heroCurrentSeconds)
  const totalPlaybackLabel = heroDurationSeconds > 0 ? formatPlaybackTime(heroDurationSeconds) : totalDurationLabel
  const heroProgress = heroDurationSeconds > 0 ? Math.min(100, (heroCurrentSeconds / heroDurationSeconds) * 100) : 0

  const detailBackHref = useMemo(() => {
    if (returnTo) return returnTo
    if (from === "home") return "/"
    if (from === "teaching") return "/teaching"
    return null
  }, [from, returnTo])

  const handleBackClick = () => {
    if (detailBackHref) {
      router.push(detailBackHref)
      return
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
      return
    }

    router.push("/teaching")
  }

  const episodeItems = useMemo(() => {
    const current = {
      id: courseIdStr || "current",
      title: courseTitle || "靛蓝之境·古法蓝染工艺",
      subtitle: "探索蓝草的秘密",
      imageUrl: courseImageUrl,
      durationLabel: totalDurationLabel,
      locked: false,
      route: courseIdStr ? `/teaching/${courseIdStr}${inheritedSuffix}` : undefined,
    }

    const extras = relatedCourses.slice(0, 5).map((item, index) => ({
      id: (item.id as string) || `related-${index}`,
      title: (item.title as string) || `章节 ${index + 2}`,
      subtitle: index % 2 === 0 ? "取蓝与染布过程" : "纹样与工艺细节",
      imageUrl: resolveStaticAssetUrl((item.image_url as string | null) ?? courseImageUrl) ?? courseImageUrl,
      durationLabel: formatDuration((item.duration as number | null) ?? 13),
      locked: false,
      route: `/teaching/${item.id as string}${inheritedSuffix}`,
    }))

    return [current, ...extras]
  }, [courseIdStr, courseTitle, courseImageUrl, relatedCourses, totalDurationLabel, inheritedSuffix])

  const chaptersCount = episodeItems.length
  const watchedPercent = heroDurationSeconds > 0 ? Math.round(heroProgress) : 0
  const heroDisplayAspect = Math.min(heroMediaAspect, 1.66)

  const syncLearningProgress = async (progress: number) => {
    if (!user || !courseIdStr) return

    const normalized = Math.max(0, Math.min(100, Math.round(progress)))
    if (normalized <= lastSyncedProgressRef.current) return

    try {
      const token = await getToken()
      if (!token) return

      const response = await fetch(`/api/courses/${courseIdStr}/enroll`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ progress: normalized }),
      })

      if (!response.ok) return

      lastSyncedProgressRef.current = normalized
      window.dispatchEvent(new CustomEvent("statsUpdateRequired"))
    } catch {
      // ignore sync failures during playback
    }
  }

  const startLearningRecord = async () => {
    if (!user || !courseIdStr || learningStartedRef.current) return

    try {
      const token = await getToken()
      if (!token) return

      const response = await fetch(`/api/courses/${courseIdStr}/enroll`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) return

      learningStartedRef.current = true
      window.dispatchEvent(new CustomEvent("statsUpdateRequired"))
    } catch {
      // ignore enrollment sync failures
    }
  }

  const handleFavorite = async () => {
    if (!courseIdStr) return
    try {
      const isFav = isCourseFavorite(courseIdStr)
      if (isFav) {
        await removeCourseFromFavorites(courseIdStr)
        toast.success("已取消收藏")
      } else {
        await addCourseToFavorites(courseIdStr)
        toast.success("已收藏课程")
      }
    } catch {
      toast.error("操作失败")
    }
  }

  const handleCommentSubmit = async () => {
    if (!user) {
      toast.error("请先登录")
      return
    }
    if (!newComment.trim()) {
      toast.error("请输入评论内容")
      return
    }
    setIsSubmitting(true)
    try {
      const token = await getToken()
      if (!token) {
        toast.error("请先登录")
        setIsSubmitting(false)
        return
      }
      const response = await fetch(`/api/courses/${courseId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      })
      if (response.ok) {
        const data = await response.json()
        setLocalComments((prev) => [data.comment, ...prev])
        setNewComment("")
        toast.success("评论发表成功")
      } else {
        const err = await response.json()
        toast.error(err.error || "评论提交失败")
      }
    } catch {
      toast.error("评论提交失败")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!user) {
      toast.error("请先登录")
      return
    }
    if (!confirm("确定要删除这条评论吗？")) {
      return
    }
    try {
      const token = await getToken()
      if (!token) {
        toast.error("请先登录")
        return
      }
      const response = await fetch(`/api/courses/${courseId}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        setLocalComments((prev) => prev.filter((c) => c.id !== commentId))
        toast.success("评论已删除")
      } else {
        const err = await response.json()
        toast.error(err.error || "删除失败")
      }
    } catch {
      toast.error("删除失败")
    }
  }

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({
        title: courseTitle,
        text: `推荐课程：${courseTitle}`,
        url,
      })
    } else {
      navigator.clipboard.writeText(url)
      toast.success("链接已复制到剪贴板")
    }
  }

  const toggleHeroPlayback = async () => {
    if (!hasPlayableVideo) {
      toast.info("当前课程为预告内容，视频暂未上线")
      return
    }
    const video = videoRef.current
    if (!video) return
    if (isHeroPlaying) {
      video.pause()
      setIsHeroPlaying(false)
      return
    }
    try {
      await startLearningRecord()
      await video.play()
      setIsHeroPlaying(true)
    } catch {
      toast.error("视频播放失败")
    }
  }

  const handleHeroLoadedMetadata = () => {
    const video = videoRef.current
    if (!video) return
    setHeroDurationSeconds(video.duration || 0)
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      setHeroMediaAspect(video.videoWidth / video.videoHeight)
    }
  }

  const handleHeroLoadedData = () => {
    const video = videoRef.current
    if (!video) return
    setHeroVideoReady(true)
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      setHeroMediaAspect(video.videoWidth / video.videoHeight)
    }
  }

  const handleHeroTimeUpdate = () => {
    const video = videoRef.current
    if (!video) return
    setHeroCurrentSeconds(video.currentTime || 0)
    if (video.duration && !Number.isNaN(video.duration)) {
      setHeroDurationSeconds(video.duration)
      const progress = (video.currentTime / video.duration) * 100

      if (progress >= 100) {
        void syncLearningProgress(100)
      } else if (progress - lastSyncedProgressRef.current >= 8) {
        if (progressSyncTimerRef.current) {
          window.clearTimeout(progressSyncTimerRef.current)
        }
        progressSyncTimerRef.current = window.setTimeout(() => {
          void syncLearningProgress(progress)
        }, 400)
      }
    }
  }

  const handleHeroSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!hasPlayableVideo || !video || !heroDurationSeconds) return
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    video.currentTime = ratio * heroDurationSeconds
    setHeroCurrentSeconds(video.currentTime)
  }

  const handleHeroFullscreen = async () => {
    const video = videoRef.current
    if (!hasPlayableVideo || !video) {
      toast.info("当前课程暂无可全屏播放的视频")
      return
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        return
      }

      await video.requestFullscreen()
    } catch {
      toast.error("暂时无法进入全屏")
    }
  }

  const revealHeroControls = () => {
    setHeroControlsVisible(true)
    if (heroControlsTimerRef.current) {
      window.clearTimeout(heroControlsTimerRef.current)
    }
    if (isHeroPlaying) {
      heroControlsTimerRef.current = window.setTimeout(() => {
        setHeroControlsVisible(false)
      }, 900)
    }
  }

  const handleIntroClick = () => {
    setIsDescriptionExpanded(true)
    requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  useEffect(() => {
    if (!user || !courseIdStr) return
    void startLearningRecord()
  }, [user, courseIdStr])

  useEffect(() => {
    const node = heroRef.current
    if (!node) return

    const updateHeroMediaFrame = () => {
      const rect = node.getBoundingClientRect()
      const containerWidth = rect.width
      const containerHeight = rect.height
      const containerAspect = containerWidth / containerHeight

      let width = containerWidth
      let height = containerHeight
      let left = 0
      let top = 0

      if (heroMediaAspect > containerAspect) {
        height = containerWidth / heroMediaAspect
        top = (containerHeight - height) / 2
      } else {
        width = containerHeight * heroMediaAspect
        left = (containerWidth - width) / 2
      }

      setHeroMediaFrame({ left, top, width, height })
    }

    updateHeroMediaFrame()

    const observer = new ResizeObserver(() => {
      updateHeroMediaFrame()
    })

    observer.observe(node)
    return () => observer.disconnect()
  }, [heroMediaAspect])

  useEffect(() => {
    if (!isHeroPlaying) {
      if (heroControlsTimerRef.current) {
        window.clearTimeout(heroControlsTimerRef.current)
      }
      setHeroControlsVisible(true)
      return
    }

    heroControlsTimerRef.current = window.setTimeout(() => {
      setHeroControlsVisible(false)
    }, 900)

    return () => {
      if (heroControlsTimerRef.current) {
        window.clearTimeout(heroControlsTimerRef.current)
      }
    }
  }, [isHeroPlaying])

  useEffect(() => {
    return () => {
      if (progressSyncTimerRef.current) {
        window.clearTimeout(progressSyncTimerRef.current)
      }

      if (heroProgress > 0 && heroProgress < 100) {
        void syncLearningProgress(heroProgress)
      }
    }
  }, [heroProgress])

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      </div>
    )
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="mx-auto max-w-md px-6 py-20 text-center">
          <p className="mb-4 text-muted-foreground">数据加载失败，请检查网络后重试</p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => mutate()}>
              重新加载
            </Button>
            <Button onClick={() => router.push("/teaching")}>
              返回课程列表
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="py-20 text-center">
          <p className="text-muted-foreground">课程不存在</p>
          <Button onClick={() => router.push("/teaching")} className="mt-4">
            返回课程列表
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1a1a1a]">
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden bg-[#111a28]"
        style={{ aspectRatio: Math.min(heroDisplayAspect, 1.18) }}
      >
        {hasPlayableVideo ? (
          <>
            <video
              className="absolute inset-0 h-full w-full object-cover opacity-45 blur-[10px] scale-105"
              preload="auto"
              poster={courseImageUrl || undefined}
              playsInline
              muted
            >
              <source src={courseVideoUrl} type="video/mp4" />
            </video>
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,rgba(0,0,0,0.18)_55%,rgba(0,0,0,0.34)_100%)]">
              <video
                ref={videoRef}
                className={`h-full w-full object-contain transition-opacity duration-300 ${heroVideoReady ? "opacity-100" : "opacity-0"}`}
                preload="auto"
                playsInline
                onPause={() => setIsHeroPlaying(false)}
                onPlay={() => setIsHeroPlaying(true)}
                onLoadedMetadata={handleHeroLoadedMetadata}
                onLoadedData={handleHeroLoadedData}
                onTimeUpdate={handleHeroTimeUpdate}
              >
                <source src={courseVideoUrl} type="video/mp4" />
              </video>
              {!heroVideoReady && courseImageUrl ? (
                <Image
                  src={courseImageUrl}
                  alt={courseTitle}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              ) : null}
            </div>
          </>
        ) : courseImageUrl ? (
          <>
            <Image
              src={courseImageUrl}
              alt={courseTitle}
              fill
              sizes="100vw"
              className="object-cover opacity-45 blur-[10px] scale-105"
              priority
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src={courseImageUrl}
                alt={courseTitle}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
          </>
        ) : null}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.46)_0%,rgba(0,0,0,0.12)_22%,rgba(0,0,0,0.1)_54%,rgba(0,0,0,0.72)_100%)]" />

        <div
          className="absolute z-20 overflow-hidden"
          style={{
            left: heroMediaFrame.left,
            top: heroMediaFrame.top,
            width: heroMediaFrame.width || "100%",
            height: heroMediaFrame.height || "100%",
          }}
          onClick={revealHeroControls}
          onMouseMove={revealHeroControls}
          onTouchStart={revealHeroControls}
        >
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.08)_28%,rgba(0,0,0,0)_46%,rgba(0,0,0,0.18)_72%,rgba(0,0,0,0.58)_100%)]" />

          <div className="absolute inset-x-0 top-0 z-20 grid grid-cols-[44px_1fr_44px] items-center px-5 pb-2 pt-[max(18px,env(safe-area-inset-top))]">
            <button
              type="button"
              onClick={handleBackClick}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/18 text-white backdrop-blur-[10px]"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="justify-self-center px-3 text-center font-serif text-[1.08rem] font-medium tracking-[0.16em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
              世说蓝语
            </div>
            <div />
          </div>

          <div
            className="absolute bottom-[108px] left-7 z-10 flex items-end gap-4 text-white/88"
            style={{
              opacity: hasPlayableVideo && heroVideoReady && heroMediaFrame.width > 260 ? 1 : 0,
            }}
          >
            <div className="text-[0.92rem] font-light leading-[1.7] tracking-[0.18em] text-white/92 [writing-mode:vertical-rl]">
              一抹蓝，万物生。
            </div>
            <div className="pb-1 text-[0.82rem] tracking-[0.18em] text-white/78">
              古法蓝染之美
            </div>
          </div>

          <button
            type="button"
            onClick={handleIntroClick}
            className={`absolute right-5 top-[43%] z-20 flex -translate-y-1/2 items-center gap-1 rounded-full border border-white/28 bg-black/14 px-3.5 py-1.5 text-[0.88rem] text-white/95 backdrop-blur-[8px] transition-opacity duration-300 ${heroControlsVisible || !hasPlayableVideo ? "opacity-100" : "opacity-0"}`}
          >
            简介
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-500 ${!isHeroPlaying || heroControlsVisible || !hasPlayableVideo ? "opacity-100" : "opacity-0"}`}>
            <button
              type="button"
              onClick={toggleHeroPlayback}
              className={`pointer-events-auto relative flex h-[58px] w-[58px] items-center justify-center rounded-full border-[2px] shadow-[0_6px_16px_rgba(0,0,0,0.14)] backdrop-blur-[4px] ${
                hasPlayableVideo ? "border-white/62 bg-white/[0.03]" : "border-white/28 bg-black/20"
              }`}
            >
              <span className="absolute inset-[-4px] rounded-full border border-white/10" />
              {hasPlayableVideo ? (
                isHeroPlaying ? (
                  <Pause className="relative z-10 h-5 w-5 fill-white text-white" />
                ) : (
                  <Play className="relative z-10 ml-0.5 h-5 w-5 fill-white text-white" />
                )
              ) : (
                <Lock className="relative z-10 h-5 w-5 text-white" />
              )}
            </button>
          </div>

          {!hasPlayableVideo ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-[112px] z-20 flex justify-center px-6">
              <div className="rounded-full border border-white/18 bg-black/24 px-4 py-2 text-sm text-white/90 backdrop-blur-[10px]">
                预告课程，视频内容暂未上线
              </div>
            </div>
          ) : null}

          {hasPlayableVideo ? (
            <div className="absolute inset-x-0 bottom-0 z-30 px-5 pb-3">
              <div className={`relative rounded-[18px] bg-[linear-gradient(180deg,rgba(12,21,38,0.06)_0%,rgba(12,21,38,0.28)_100%)] px-3 pb-3 pr-14 pt-1.5 backdrop-blur-[8px] transition-opacity duration-300 ${heroControlsVisible ? "opacity-100" : "opacity-0"}`}>
                <div className="mb-1.5 flex items-center justify-between pr-10 text-[0.92rem] font-medium text-white/95">
                  <span>{currentPlaybackLabel}</span>
                  <span>{totalPlaybackLabel}</span>
                </div>
                <div className="relative pointer-events-auto">
                  <div
                    role="button"
                    aria-label="调整视频进度"
                    tabIndex={0}
                    onClick={handleHeroSeek}
                    className="h-[5px] cursor-pointer rounded-full bg-white/25"
                  >
                    <div
                      className="relative h-[5px] rounded-full bg-[linear-gradient(90deg,#325c93_0%,#7da1cf_100%)]"
                      style={{ width: `${heroProgress}%` }}
                    >
                      <span className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 rounded-full border border-white/90 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.35)]" />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleHeroFullscreen}
                  className="absolute bottom-3 right-3 z-40 flex h-8 w-8 items-center justify-center rounded-full border border-white/24 bg-black/16 text-white backdrop-blur-[8px]"
                >
                  <Expand className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="absolute inset-x-0 bottom-0 z-30 px-5 pb-3">
              <div className="rounded-[18px] bg-[linear-gradient(180deg,rgba(12,21,38,0.06)_0%,rgba(12,21,38,0.22)_100%)] px-4 py-3 text-[0.9rem] text-white/88 backdrop-blur-[8px]">
                <div className="flex items-center justify-between gap-4">
                  <span>当前章节为图文预告，可先查看简介与选集。</span>
                  <span className="shrink-0 text-white/70">未上线</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section
        ref={contentRef}
        className="relative z-20 rounded-t-[34px] bg-[#faf6f0] px-5 pb-8 pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]"
      >
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 pr-2">
            <h1 className="max-w-[11.5em] font-serif text-[1.25rem] leading-[1.18] tracking-[0.02em] text-[#162c57]">
              {courseTitle || "靛蓝之境·古法蓝染工艺"}
            </h1>
          </div>
          <div className="flex flex-shrink-0 gap-5 pt-0.5">
            <button
              type="button"
              onClick={handleFavorite}
              className="flex min-w-[38px] flex-col items-center gap-1 text-[#72737a] transition-colors hover:text-[#223d6d]"
            >
              <Heart
                className={`h-5 w-5 stroke-[1.6] ${
                  courseIdStr && isCourseFavorite(courseIdStr) ? "fill-[#2c4f7c] text-[#2c4f7c]" : ""
                }`}
              />
              <span className="text-[0.72rem]">收藏</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex min-w-[38px] flex-col items-center gap-1 text-[#72737a] transition-colors hover:text-[#223d6d]"
            >
              <Share2 className="h-5 w-5 stroke-[1.6]" />
              <span className="text-[0.72rem]">分享</span>
            </button>
          </div>
        </div>

        <p className="mb-3 max-w-[34rem] text-[0.8rem] leading-[1.8] text-[#737277]">
          {isDescriptionExpanded ? description : `${description.slice(0, 52)}${description.length > 52 ? "..." : ""}`}
        </p>

        <div className="mb-4 flex items-center justify-between rounded-[18px] border border-[rgba(20,43,84,0.1)] bg-white px-4 py-3 shadow-[0_4px_12px_rgba(20,43,84,0.04)]">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 text-[0.82rem] text-[#7b7b80]">
            <span className="shrink-0">已观看</span>
            <span className="shrink-0 font-serif text-[1.15rem] font-bold text-[#162c57]">{watchedPercent}%</span>
            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#eceef3]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#183a73_0%,#244d8f_100%)]"
                style={{ width: `${watchedPercent}%` }}
              />
            </div>
          </div>
          <div className="shrink-0 pl-3 text-[0.82rem] tracking-[0.06em] text-[#7b7b80]">共 {chaptersCount} 章</div>
        </div>

        <div ref={commentsRef} className="mt-1">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => setShowComments(false)}
                className={`font-serif text-[1.5rem] tracking-[0.03em] transition-colors ${
                  showComments ? "text-[#8b93a3]" : "text-[#162c57]"
                }`}
              >
                选集
              </button>
              <button
                type="button"
                onClick={() => setShowComments(true)}
                className={`text-[0.96rem] transition-colors ${
                  showComments ? "font-medium text-[#162c57]" : "text-[#566f96]"
                }`}
              >
                评论
              </button>
            </div>
            {!showComments ? (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[0.88rem] text-[#566f96]"
              >
                全部章节
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {!showComments ? (
            <div className="space-y-3">
              {episodeItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.route) router.push(item.route)
                  }}
                  className={`relative flex w-full items-center gap-3 overflow-hidden rounded-[20px] border bg-white p-3.5 text-left transition-all ${
                    index === 0
                      ? "border-[rgba(22,44,87,0.28)] shadow-[0_8px_18px_rgba(22,44,87,0.08)]"
                      : "border-[rgba(22,44,87,0.08)] shadow-[0_6px_14px_rgba(0,0,0,0.04)] hover:border-[#8fa8c8] hover:shadow-[0_10px_24px_rgba(26,39,68,0.08)]"
                  } ${item.locked ? "opacity-70" : ""}`}
                >
                  <div className="relative h-[90px] w-[116px] flex-shrink-0 overflow-hidden rounded-[14px] border border-[rgba(22,44,87,0.08)] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="116px"
                        className="object-cover"
                      />
                    ) : null}
                    {!item.locked ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#0c1a32]/28">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/85 bg-black/12 backdrop-blur-[4px]">
                          <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-[0.78rem] tracking-[0.12em] text-[#345789]">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="mt-1 line-clamp-1 font-serif text-[1.12rem] leading-[1.25] text-[#162c57]">{item.title}</div>
                    <div className="mt-1.5 line-clamp-1 text-[0.88rem] text-[#7c7a7a]">{item.subtitle}</div>
                  </div>

                  <div className="flex items-center gap-1 self-end pb-1 text-[0.82rem] text-[#3d4f6d]">
                    {item.locked ? <Lock className="h-4 w-4" /> : <Timer className="h-4 w-4" />}
                    {item.durationLabel}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <SectionCard>
                <div className="px-5 py-5">
                  <textarea
                    className="min-h-[92px] w-full resize-none rounded-[24px] bg-[#f4f5f6] p-4 text-base outline-none placeholder:text-[#9a9da2] focus:ring-2 focus:ring-[#d9dee6]"
                    placeholder="写下你的学习感受或问题..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    maxLength={500}
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-[#74889d]">{newComment.length}/500</span>
                    <Button
                      onClick={handleCommentSubmit}
                      disabled={isSubmitting || !newComment.trim()}
                      className="h-12 rounded-[20px] bg-[#173d71] px-5 text-base text-white hover:bg-[#14355f]"
                    >
                      {isSubmitting ? "发表中..." : "发表评论"}
                    </Button>
                  </div>
                </div>
              </SectionCard>

              <div className="space-y-3">
                {allComments.length > 0 ? (
                  allComments.map((rawComment) => {
                    const comment = rawComment as Record<string, unknown>
                    const commentId = comment.id as string
                    const commentUserId = comment.user_id as string | null
                    const commentUserName = (comment.user_name as string) || "用户"
                    const commentCreatedAt = (comment.created_at as string) ?? ""
                    const commentContent = (comment.content as string) ?? ""
                    const commentLikesCount = (comment.likes_count as number) ?? 0

                    return (
                      <SectionCard key={commentId}>
                        <div className="px-5 py-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="text-base font-medium text-[#17314f]">{commentUserName}</div>
                              <div className="mt-1 text-sm text-[#72869a]">
                                {commentCreatedAt ? new Date(commentCreatedAt).toLocaleDateString("zh-CN") : ""}
                              </div>
                              <p className="mt-3 text-base leading-8 text-[#555b63]">{commentContent}</p>
                              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#f3f5f7] px-3 py-1.5 text-sm text-[#72869a]">
                                <ThumbsUp className="h-4 w-4" />
                                {commentLikesCount}
                              </div>
                            </div>
                            {user && commentUserId === user.id ? (
                              <button
                                onClick={() => handleDeleteComment(commentId)}
                                className="rounded-full p-2 text-[#72869a] transition-colors hover:bg-[#eef5fb] hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </SectionCard>
                    )
                  })
                ) : (
                  <SectionCard>
                    <div className="px-5 py-10 text-center text-[#72869a]">
                      <MessageCircle className="mx-auto mb-3 h-10 w-10 opacity-30" />
                      <p className="text-base">暂无评论，欢迎留下第一条评论。</p>
                    </div>
                  </SectionCard>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
