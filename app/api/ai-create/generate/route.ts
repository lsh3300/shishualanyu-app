import { NextRequest, NextResponse } from "next/server"

type GenerateRequestBody = {
  imageUrl?: string
  styleId?: string
  parameters?: {
    styleStrength?: number
    detailRetention?: number
    colorSaturation?: number
    textureComplexity?: number
    artEffectIntensity?: number
  }
}

const stylePromptMap: Record<string, string> = {
  "classic-indigo": "传统蓝染质感，蓝白层次分明，手工纹理自然。",
  "shibori-pattern": "突出扎染折叠痕迹与节奏感，保留明显手作肌理。",
  "modern-geometric": "融合现代几何分区与蓝染表达，画面更利落。",
  "nature-inspired": "融入水波、云纹、植物等自然元素，气质更柔和。",
  minimalist: "保留更多留白与简洁轮廓，整体更克制。",
  "vintage-wash": "呈现复古水洗与旧布质感，画面更温润。",
}

function buildPrompt(styleId?: string, parameters?: GenerateRequestBody["parameters"]) {
  const basePrompt =
    process.env.AI6800_BASE_PROMPT?.trim() ||
    "请基于参考图片生成蓝染风格图像，保留主体结构与主要轮廓，突出蓝白层次、布料肌理与传统工艺气质。"

  const stylePrompt = styleId ? stylePromptMap[styleId] || "" : ""
  const details: string[] = []

  if (parameters) {
    if ((parameters.styleStrength ?? 0) >= 80) details.push("蓝染风格表现更明显。")
    if ((parameters.detailRetention ?? 0) >= 70) details.push("尽量保留原图更多细节。")
    if ((parameters.colorSaturation ?? 0) >= 70) details.push("蓝色饱和度更高。")
    if ((parameters.textureComplexity ?? 0) >= 70) details.push("增加纹理层次与扎染肌理。")
    if ((parameters.artEffectIntensity ?? 0) >= 70) details.push("增强艺术化表达。")
  }

  return [basePrompt, stylePrompt, ...details].filter(Boolean).join(" ")
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.AI6800_API_KEY?.trim()
    const baseUrl = (process.env.AI6800_BASE_URL || "https://api.ai6800.com/v1").replace(/\/+$/, "")
    const model = process.env.AI6800_IMAGE_MODEL?.trim() || "gpt-image-2"
    const size = process.env.AI6800_DEFAULT_SIZE?.trim() || "1024x1536"
    const quality = process.env.AI6800_DEFAULT_QUALITY?.trim() || "high"

    if (!apiKey) {
      return NextResponse.json(
        { error: "缺少 AI6800_API_KEY，请先在本地环境变量中填写。" },
        { status: 500 }
      )
    }

    const body = (await request.json()) as GenerateRequestBody
    const imageUrl = body.imageUrl?.trim()

    if (!imageUrl) {
      return NextResponse.json({ error: "缺少图片地址 imageUrl。" }, { status: 400 })
    }

    const prompt = buildPrompt(body.styleId, body.parameters)

    const response = await fetch(`${baseUrl}/media/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt,
        size,
        quality,
        background: "opaque",
        n: 1,
        images: [imageUrl],
      }),
      cache: "no-store",
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || "创建 AI 图片任务失败。", details: data },
        { status: response.status }
      )
    }

    const taskId = data?.task_id
    if (!taskId) {
      return NextResponse.json({ error: "第三方接口未返回 task_id。", details: data }, { status: 502 })
    }

    return NextResponse.json({
      success: true,
      taskId: String(taskId),
      raw: data,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "创建 AI 任务失败。",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
