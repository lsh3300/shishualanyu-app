import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url")?.trim()

    if (!url) {
      return NextResponse.json({ error: "缺少结果图片地址 url。" }, { status: 400 })
    }

    const response = await fetch(url, {
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json({ error: "拉取结果图片失败。" }, { status: response.status })
    }

    const contentType = response.headers.get("content-type") || "image/png"
    const arrayBuffer = await response.arrayBuffer()

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "读取结果图片失败。",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
