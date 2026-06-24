import { NextRequest, NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/server";

type InventorySlot = "recent" | "inventory";
type CreationStatus = "draft" | "completed" | "listed" | "sold";
type ScoreGrade = "SSS" | "SS" | "S" | "A" | "B" | "C";

interface CreationItem {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  status: string | null;
  layer_count?: number | null;
  is_recent?: boolean | null;
}

interface ScoreItem {
  cloth_id: string;
  total_score?: number | null;
  grade?: ScoreGrade | null;
  created_at?: string | null;
}

interface InventoryItem {
  cloth_id: string;
  slot_type: InventorySlot;
  added_at?: string | null;
}

async function resolveUserId(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "").trim()
    : undefined;

  if (!token) {
    return null;
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    console.error("Failed to resolve assignments user:", error);
    return null;
  }

  return data.user.id;
}

function normalizeStatus(item: CreationItem, inventorySlot?: InventorySlot, hasScore?: boolean): CreationStatus {
  if (item.status === "sold") return "sold";
  if (item.status === "listed") return "listed";
  if (inventorySlot === "inventory") return "completed";
  if (hasScore) return "completed";
  return "draft";
}

function buildPreviewTitle(status: CreationStatus, grade?: string | null) {
  if (status === "sold") return "已售作品";
  if (status === "listed") return "在售作品";
  if (grade) return `${grade} 级作品`;
  return "创作草稿";
}

export async function GET(request: NextRequest) {
  try {
    const userId = await resolveUserId(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    const { data: clothsData, error: clothsError } = await supabase
      .from("cloths")
      .select("id, created_at, updated_at, status, layer_count, is_recent")
      .eq("creator_id", userId)
      .order("created_at", { ascending: false });

    if (clothsError) {
      console.error("Failed to load user creations:", clothsError);
      return NextResponse.json({ error: "Failed to load creations" }, { status: 500 });
    }

    const cloths = (Array.isArray(clothsData) ? clothsData : []) as CreationItem[];
    const clothIds = cloths.map((item) => item.id);

    const [{ data: scoresData, error: scoresError }, { data: inventoryData, error: inventoryError }] =
      await Promise.all([
        clothIds.length
          ? supabase
              .from("cloth_scores")
              .select("cloth_id, total_score, grade, created_at")
              .in("cloth_id", clothIds)
              .order("created_at", { ascending: false })
          : Promise.resolve({ data: [], error: null }),
        clothIds.length
          ? supabase.from("user_inventory").select("cloth_id, slot_type, added_at").in("cloth_id", clothIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

    if (scoresError) {
      console.error("Failed to load creation scores:", scoresError);
      return NextResponse.json({ error: "Failed to load creations" }, { status: 500 });
    }

    if (inventoryError) {
      console.error("Failed to load creation inventory:", inventoryError);
      return NextResponse.json({ error: "Failed to load creations" }, { status: 500 });
    }

    const scoreMap = new Map<string, ScoreItem>();
    (Array.isArray(scoresData) ? scoresData : []).forEach((item) => {
      const row = item as ScoreItem;
      if (!row.cloth_id || scoreMap.has(row.cloth_id)) return;
      scoreMap.set(row.cloth_id, row);
    });

    const inventoryMap = new Map<string, InventoryItem>();
    (Array.isArray(inventoryData) ? inventoryData : []).forEach((item) => {
      const row = item as InventoryItem;
      if (!row.cloth_id || inventoryMap.has(row.cloth_id)) return;
      inventoryMap.set(row.cloth_id, row);
    });

    const list = cloths.map((item) => {
      const score = scoreMap.get(item.id);
      const inventory = inventoryMap.get(item.id);
      const normalizedStatus = normalizeStatus(item, inventory?.slot_type, Boolean(score));

      return {
        id: item.id,
        title: buildPreviewTitle(normalizedStatus, score?.grade),
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        completedAt: score?.created_at || null,
        status: normalizedStatus,
        slotType: inventory?.slot_type || (item.is_recent ? "recent" : null),
        addedAt: inventory?.added_at || null,
        layerCount: item.layer_count ?? 0,
        totalScore: score?.total_score ?? null,
        grade: score?.grade ?? null,
      };
    });

    const draftCount = list.filter((item) => item.status === "draft").length;
    const completedCount = list.length - draftCount;

    return NextResponse.json({
      assignments: {
        total: list.length,
        draftCount,
        completedCount,
        list,
      },
    });
  } catch (error) {
    console.error("Assignments API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
