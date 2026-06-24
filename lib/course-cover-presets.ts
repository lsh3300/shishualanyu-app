export const CURATED_VIDEO_COVERS = [
  "/course-covers/01.jpg",
  "/course-covers/02.jpg",
  "/course-covers/03.jpg",
  "/course-covers/04.jpg",
  "/course-covers/05.jpg",
  "/course-covers/06.jpg",
  "/course-covers/07.jpg",
  "/course-covers/08.jpg",
  "/course-covers/09.jpg",
  "/course-covers/10.jpg",
  "/course-covers/11.jpg",
] as const

export function getCuratedVideoCover(index: number) {
  return CURATED_VIDEO_COVERS[index] || null
}

export function isCuratedVideoCover(url?: string | null) {
  return typeof url === "string" && url.startsWith("/course-covers/")
}

export function getCourseVisualPriority(imageUrl?: string | null, videoUrl?: string | null) {
  if (isCuratedVideoCover(imageUrl)) return 3
  if (typeof imageUrl === "string" && imageUrl.length > 0 && imageUrl !== "/placeholder.svg") return 2
  if (typeof videoUrl === "string" && videoUrl.length > 0) return 1
  return 0
}
