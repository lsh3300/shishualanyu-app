export type FetchJsonOptions = Omit<RequestInit, "signal"> & {
  timeoutMs?: number
  retries?: number
  retryDelayMs?: number
  retryBackoffFactor?: number
  retryJitterRatio?: number
}

type CircuitState = {
  failures: number
  lastFailureAt: number
  openedUntil: number
}

export class HttpError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "HttpError"
    this.status = status
  }
}

const circuit = new Map<string, CircuitState>()

function circuitKey(url: string, init: Omit<RequestInit, "signal">) {
  const method = (init.method || "GET").toUpperCase()
  return `${method} ${url}`
}

function getErrorName(err: unknown): string | undefined {
  if (typeof err !== "object" || err === null) return undefined
  if (!("name" in err)) return undefined
  const name = (err as Record<string, unknown>).name
  return typeof name === "string" ? name : undefined
}

function getErrorStatus(err: unknown): number | undefined {
  if (typeof err !== "object" || err === null) return undefined
  if (!("status" in err)) return undefined
  const status = (err as Record<string, unknown>).status
  return typeof status === "number" ? status : undefined
}

function isRetryableError(err: unknown) {
  if (getErrorName(err) === "AbortError") return true
  const status = getErrorStatus(err)
  if (typeof status === "number" && status >= 500) return true
  return err instanceof TypeError
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions = {}
): Promise<T> {
  const {
    timeoutMs = 12000,
    retries = 0,
    retryDelayMs = 400,
    retryBackoffFactor = 2,
    retryJitterRatio = 0.2,
    ...init
  } = options

  const method = (init.method || "GET").toUpperCase()
  const key = circuitKey(url, init)
  const now = Date.now()

  if (method === "GET") {
    const s = circuit.get(key)
    if (s && s.openedUntil > now) {
      throw new HttpError("Service temporarily unavailable", 503)
    }
  }

  for (let attempt = 0; ; attempt += 1) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
      })

      if (!res.ok) {
        let message = `Request failed: ${res.status}`
        try {
          const data = await res.json()
          if (data?.error) message = data.error
        } catch {
          try {
            const text = await res.text()
            if (text) message = text
          } catch {
          }
        }

        throw new HttpError(message, res.status)
      }

      if (method === "GET") {
        circuit.delete(key)
      }

      return (await res.json()) as T
    } catch (err) {
      if (method === "GET" && isRetryableError(err)) {
        const t = Date.now()
        const prev = circuit.get(key)
        const state: CircuitState = prev
          ? {
              failures: t - prev.lastFailureAt > 30000 ? 0 : prev.failures,
              lastFailureAt: t,
              openedUntil: prev.openedUntil,
            }
          : { failures: 0, lastFailureAt: t, openedUntil: 0 }

        state.failures += 1
        if (state.failures >= 3) {
          state.openedUntil = t + 20000
        }
        circuit.set(key, state)
      }

      const shouldRetry = attempt < retries
      if (!shouldRetry) {
        throw err
      }

      const baseDelay = retryDelayMs * Math.pow(retryBackoffFactor, attempt)
      const jitter = baseDelay * retryJitterRatio * (Math.random() * 2 - 1)
      const delay = Math.max(0, Math.round(baseDelay + jitter))
      await sleep(delay)
    } finally {
      clearTimeout(timeoutId)
    }
  }
}
