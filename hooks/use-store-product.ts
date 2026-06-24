"use client"

import useSWR from "swr"
import { fetchJson, HttpError } from "@/lib/fetch-json"

export function useStoreProduct(identifier: string | undefined) {
  const swr = useSWR<Record<string, unknown> | null>(
    identifier ? ["store-product", identifier] : null,
    async () => {
      try {
        return await fetchJson<Record<string, unknown>>(`/api/products/${identifier}`, {
          timeoutMs: 12000,
          retries: 1,
        })
      } catch (err) {
        if (err instanceof HttpError && err.status === 404) {
          return null
        }
        throw err
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
    }
  )

  return {
    product: swr.data ?? null,
    loading: swr.isLoading,
    error: swr.error as Error | undefined,
    mutate: swr.mutate,
  }
}
