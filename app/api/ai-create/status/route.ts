import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.AI6800_API_KEY?.trim()
    const baseUrl = (process.env.AI6800_BASE_URL || "https://api.ai6800.com/v1").replace(/\/+$/, "")
    const taskId = request.nextUrl.searchParams.get("taskId")?.trim()

    if (!apiKey) {
      return NextResponse.json(
        { error: "缺少 AI6800_API_KEY，请先在本地环境变量中填写。" },
        { status: 500 }
      )
    }

    if (!taskId) {
      return NextResponse.json({ error: "缺少 taskId 参数。" }, { status: 400 })
    }

    const response = await fetch(`${baseUrl}/media/status?task_id=${encodeURIComponent(taskId)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || "查询 AI 图片任务失败。", details: data },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      taskId: String(data?.task_id ?? taskId),
      state: data?.state ?? "pending",
      isFinal: Boolean(data?.is_final),
      progress: data?.progress ?? "",
      resultUrl: data?.result_url ?? "",
      error: data?.error ?? "",
      raw: data,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "查询 AI 任务状态失败。",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
