"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RotateCcw, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdjustmentParams {
  intensity: number
  contrast: number
  saturation: number
  blur: number
  patternComplexity: number
}

interface ParameterAdjustmentProps {
  onParamsChange?: (params: AdjustmentParams) => void
  initialParams?: Partial<AdjustmentParams>
  parameters?: {
    styleStrength: number
    detailRetention: number
    colorSaturation: number
  }
  onParametersChange?: (newParameters: {
    styleStrength: number
    detailRetention: number
    colorSaturation: number
  }) => void
  isGenerating?: boolean
}

const defaultParams: AdjustmentParams = {
  intensity: 70,
  contrast: 50,
  saturation: 60,
  blur: 0,
  patternComplexity: 50
}

export default function ParameterAdjustment({ 
  onParamsChange, 
  initialParams = {},
  parameters,
  onParametersChange,
  isGenerating = false
}: ParameterAdjustmentProps) {
  const [params, setParams] = useState<AdjustmentParams>({
    ...defaultParams,
    ...initialParams
  })

  const updateParam = (key: keyof AdjustmentParams, value: number[]) => {
    const newParams = { ...params, [key]: value[0] }
    setParams(newParams)
    onParamsChange?.(newParams)
    
    // 如果有parameters和onParametersChange，则转换并调用
    if (parameters && onParametersChange) {
      const convertedParams = {
        styleStrength: newParams.intensity,
        detailRetention: newParams.contrast,
        colorSaturation: newParams.saturation
      }
      onParametersChange(convertedParams)
    }
  }

  const resetParams = () => {
    const resetParams: AdjustmentParams = {
      intensity: 70,
      contrast: 50,
      saturation: 60,
      blur: 0,
      patternComplexity: 50
    }
    setParams(resetParams)
    onParamsChange?.(resetParams)
    
    // 如果有parameters和onParametersChange，则转换并调用
    if (parameters && onParametersChange) {
      const convertedParams = {
        styleStrength: resetParams.intensity,
        detailRetention: resetParams.contrast,
        colorSaturation: resetParams.saturation
      }
      onParametersChange(convertedParams)
    }
  }

  const applyPreset = (preset: Partial<AdjustmentParams>) => {
    const newParams = { ...params, ...preset }
    setParams(newParams)
    onParamsChange?.(newParams)
    
    // 如果有parameters和onParametersChange，则转换并调用
    if (parameters && onParametersChange) {
      const convertedParams = {
        styleStrength: newParams.intensity,
        detailRetention: newParams.contrast,
        colorSaturation: newParams.saturation
      }
      onParametersChange(convertedParams)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          参数调整
        </CardTitle>
        <CardDescription>
          调整AI生成效果的各种参数，获得理想的蓝染效果
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 预设效果 */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">快速预设</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => applyPreset({ intensity: 50, contrast: 30, saturation: 40 })}
            >
              轻柔
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => applyPreset({ intensity: 70, contrast: 50, saturation: 60 })}
            >
              平衡
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => applyPreset({ intensity: 85, contrast: 70, saturation: 80 })}
            >
              浓郁
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => applyPreset({ intensity: 90, contrast: 85, saturation: 90, patternComplexity: 80 })}
            >
              复古
            </Button>
          </div>
        </div>

        <Separator />

        {/* 参数滑块 */}
        <div className="space-y-5">
          {/* 蓝染强度 */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm font-medium">蓝染强度</Label>
              <span className="text-sm text-muted-foreground">{params.intensity}%</span>
            </div>
            <Slider
              value={[params.intensity]}
              onValueChange={(value) => updateParam('intensity', value)}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              控制蓝染效果的明显程度，数值越高效果越明显
            </p>
          </div>

          {/* 对比度 */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm font-medium">对比度</Label>
              <span className="text-sm text-muted-foreground">{params.contrast}%</span>
            </div>
            <Slider
              value={[params.contrast]}
              onValueChange={(value) => updateParam('contrast', value)}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              调整图像明暗对比，增强蓝染图案的清晰度
            </p>
          </div>

          {/* 饱和度 */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm font-medium">饱和度</Label>
              <span className="text-sm text-muted-foreground">{params.saturation}%</span>
            </div>
            <Slider
              value={[params.saturation]}
              onValueChange={(value) => updateParam('saturation', value)}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              控制蓝色的饱和程度，影响色彩的鲜艳度
            </p>
          </div>

          {/* 模糊效果 */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm font-medium">模糊效果</Label>
              <span className="text-sm text-muted-foreground">{params.blur}%</span>
            </div>
            <Slider
              value={[params.blur]}
              onValueChange={(value) => updateParam('blur', value)}
              max={50}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              添加轻微模糊效果，模拟传统蓝染的自然晕染
            </p>
          </div>

          {/* 图案复杂度 */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm font-medium">图案复杂度</Label>
              <span className="text-sm text-muted-foreground">{params.patternComplexity}%</span>
            </div>
            <Slider
              value={[params.patternComplexity]}
              onValueChange={(value) => updateParam('patternComplexity', value)}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              控制生成图案的复杂程度，数值越高图案越精细
            </p>
          </div>
        </div>

        <Separator />

        {/* 重置按钮 */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={resetParams} className="w-full sm:w-auto">
            <RotateCcw className="h-4 w-4 mr-2" />
            重置参数
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}