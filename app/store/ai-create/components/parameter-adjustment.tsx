"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RotateCcw, Sparkles } from "lucide-react"

type WorkshopParameters = {
  styleStrength: number
  detailRetention: number
  colorSaturation: number
  textureComplexity: number
  artEffectIntensity: number
}

interface ParameterAdjustmentProps {
  parameters: WorkshopParameters
  onParametersChange: (newParameters: WorkshopParameters) => void
  isGenerating?: boolean
}

const defaultParameters: WorkshopParameters = {
  styleStrength: 75,
  detailRetention: 50,
  colorSaturation: 60,
  textureComplexity: 65,
  artEffectIntensity: 70,
}

const presets: Array<{ label: string; values: WorkshopParameters }> = [
  {
    label: "柔和",
    values: {
      styleStrength: 58,
      detailRetention: 62,
      colorSaturation: 48,
      textureComplexity: 50,
      artEffectIntensity: 56,
    },
  },
  {
    label: "平衡",
    values: defaultParameters,
  },
  {
    label: "浓郁",
    values: {
      styleStrength: 88,
      detailRetention: 46,
      colorSaturation: 80,
      textureComplexity: 76,
      artEffectIntensity: 82,
    },
  },
  {
    label: "古朴",
    values: {
      styleStrength: 72,
      detailRetention: 58,
      colorSaturation: 52,
      textureComplexity: 82,
      artEffectIntensity: 78,
    },
  },
]

const controls: Array<{
  key: keyof WorkshopParameters
  label: string
  description: string
  max?: number
}> = [
  {
    key: "styleStrength",
    label: "蓝染强度",
    description: "控制蓝染覆盖感，数值越高，风格表达越明显。",
  },
  {
    key: "detailRetention",
    label: "细节保留",
    description: "保留原图轮廓与纹理，适合主体明确的照片。",
  },
  {
    key: "colorSaturation",
    label: "色彩浓度",
    description: "调节蓝色饱和度，让成品更清透或更厚重。",
  },
  {
    key: "textureComplexity",
    label: "纹理层次",
    description: "影响扎染肌理与过渡层次，适合做风格区分。",
  },
  {
    key: "artEffectIntensity",
    label: "艺术化处理",
    description: "提高整体工艺感，适合做更明显的创作风格。",
  },
]

export default function ParameterAdjustment({
  parameters,
  onParametersChange,
  isGenerating = false,
}: ParameterAdjustmentProps) {
  const updateParam = (key: keyof WorkshopParameters, value: number[]) => {
    onParametersChange({
      ...parameters,
      [key]: value[0],
    })
  }

  const resetParams = () => {
    onParametersChange(defaultParameters)
  }

  return (
    <Card className="rounded-[30px] border-blue-100 bg-white/84 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <CardHeader className="space-y-3">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Sparkles className="h-5 w-5" />
          参数调整
        </CardTitle>
        <CardDescription className="leading-6">
          先用预设定调，再微调关键参数。
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium">工坊预设</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={() => onParametersChange(preset.values)}
                disabled={isGenerating}
                className="rounded-xl"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        <div className="grid gap-5 lg:grid-cols-2">
          {controls.map((control) => (
            <div key={control.key} className="rounded-[22px] border border-slate-100 bg-slate-50/70 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <Label className="text-sm font-medium text-slate-800">{control.label}</Label>
                <span className="text-sm text-slate-500">{parameters[control.key]}%</span>
              </div>
              <Slider
                value={[parameters[control.key]]}
                onValueChange={(value) => updateParam(control.key, value)}
                max={control.max ?? 100}
                step={5}
                disabled={isGenerating}
                className="w-full"
              />
              <p className="mt-3 text-xs leading-5 text-slate-500 line-clamp-2">{control.description}</p>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex justify-center">
          <Button variant="outline" onClick={resetParams} disabled={isGenerating} className="rounded-xl">
            <RotateCcw className="mr-2 h-4 w-4" />
            重置参数
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
