const STATIC_ASSET_BASE_URL = (process.env.NEXT_PUBLIC_STATIC_ASSET_BASE_URL || "").replace(/\/+$/, "")

const LOCAL_ASSET_ALIAS_RULES: Array<[RegExp, string]> = [
  [/^\/course-covers\/(.+)\.png$/i, "/course-covers/$1.jpg"],
  [/^\/culture-covers\/(.+)\.png$/i, "/culture-covers/$1.jpg"],
]

export function resolvePreferredLocalAssetPath(path?: string | null) {
  if (!path || typeof path !== "string") return path ?? undefined

  for (const [pattern, replacement] of LOCAL_ASSET_ALIAS_RULES) {
    if (pattern.test(path)) {
      return path.replace(pattern, replacement)
    }
  }

  return path
}

export function resolveStaticAssetUrl(path?: string | null) {
  const resolvedPath = resolvePreferredLocalAssetPath(path)
  if (!resolvedPath || typeof resolvedPath !== "string") return resolvedPath ?? undefined

  if (!resolvedPath.startsWith("/")) return resolvedPath
  if (!STATIC_ASSET_BASE_URL) return resolvedPath

  return `${STATIC_ASSET_BASE_URL}${resolvedPath}`
}

export function getStaticAssetBaseUrl() {
  return STATIC_ASSET_BASE_URL
}
