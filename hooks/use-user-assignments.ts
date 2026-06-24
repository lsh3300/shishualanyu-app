"use client";

import { useCallback } from "react";
import useSWR from "swr";

import { useAuth } from "@/contexts/auth-context";
import { fetchJson, HttpError } from "@/lib/fetch-json";

export type UserCreationStatus = "draft" | "completed" | "listed" | "sold";
export type UserCreationSlot = "recent" | "inventory" | null;

export interface UserAssignmentRecord {
  id: string;
  title: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  completedAt?: string | null;
  status: UserCreationStatus;
  slotType: UserCreationSlot;
  addedAt?: string | null;
  layerCount: number;
  totalScore?: number | null;
  grade?: string | null;
}

interface UserAssignmentsResponse {
  assignments: {
    total: number;
    draftCount: number;
    completedCount: number;
    list: UserAssignmentRecord[];
  };
}

export function useUserAssignments() {
  const { user, getToken } = useAuth();

  const swr = useSWR<UserAssignmentsResponse>(
    user ? ["user-assignments", user.id] : null,
    async () => {
      const token = await getToken();
      if (!token) {
        throw new HttpError("Unauthorized", 401);
      }

      return fetchJson<UserAssignmentsResponse>("/api/user/assignments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeoutMs: 15000,
        retries: 1,
      });
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 15000,
    },
  );

  const refresh = useCallback(async () => {
    await swr.mutate();
  }, [swr]);

  return {
    assignmentsData: swr.data?.assignments,
    loading: swr.isLoading,
    error: swr.error as Error | undefined,
    refresh,
  };
}
