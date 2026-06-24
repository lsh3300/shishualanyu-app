export type FriendAction = "accept" | "reject" | "cancel" | "remove"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function extractFriendUserId(input: string): string | null {
  const value = input.trim()
  if (!value) return null

  if (UUID_PATTERN.test(value)) {
    return value
  }

  try {
    const url = new URL(value)
    const addValue = url.searchParams.get("add")
    if (addValue && UUID_PATTERN.test(addValue)) {
      return addValue
    }
  } catch {
    const match = value.match(UUID_PATTERN)
    if (match?.[0]) {
      return match[0]
    }
  }

  return null
}

export function shortenUserId(userId: string, lead = 8, tail = 6) {
  if (!userId) return ""
  if (userId.length <= lead + tail + 3) return userId
  return `${userId.slice(0, lead)}...${userId.slice(-tail)}`
}
