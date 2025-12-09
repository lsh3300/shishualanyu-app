'use client'

/**
 * 光束组件 - 模拟光线穿透效果
 * 
 * 用途：
 * - 晨曦：阳光透过雾气的光束
 * - 日间：水面下的光线波动
 * - 黄昏：夕阳的金色光柱
 * - 夜晚：月光洒落的银色光道
 */

export interface LightBeamProps {
  /** 起始X位置 */
  startX: number
  /** 起始Y位置（通常在画布外）*/
  startY: number
  /** 终点Y位置 */
  endY: number
  /** 光束颜色（HSL格式）*/
  color: string
  /** 光束宽度（rx）*/
  width: number
  /** 光束长度（ry）*/
  length: number
  /** 动画时长（秒）*/
  duration: number
  /** 延迟开始（秒）*/
  delay: number
  /** 横向飘动幅度（像素）*/
  driftAmount: number
  /** 最大不透明度 */
  maxOpacity: number
  /** 模糊程度 */
  blur?: number
}

export function LightBeam({
  startX,
  startY,
  endY,
  color,
  width,
  length,
  duration,
  delay,
  driftAmount,
  maxOpacity,
  blur = 0,
}: LightBeamProps) {
  const id = `beam-${Math.random().toString(36).substr(2, 9)}`

  // 计算中间漂移点（让下落不是直线）
  const midX = startX + (Math.random() - 0.5) * driftAmount
  const midY = (startY + endY) / 2

  return (
    <g>
      {blur > 0 && (
        <defs>
          <filter id={`${id}-blur`}>
            <feGaussianBlur stdDeviation={blur} />
          </filter>
        </defs>
      )}
      
      <ellipse
        cx={startX}
        cy={startY}
        rx={width}
        ry={length}
        fill={color}
        opacity={0}
        filter={blur > 0 ? `url(#${id}-blur)` : undefined}
      >
        {/* Y轴移动动画（主要运动）*/}
        <animate
          attributeName="cy"
          values={`${startY}; ${midY}; ${endY}`}
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />

        {/* X轴飘动（随机漂移）*/}
        <animate
          attributeName="cx"
          values={`${startX}; ${midX}; ${startX + (Math.random() - 0.5) * driftAmount * 0.8}`}
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />

        {/* 透明度：淡入->保持->淡出 */}
        <animate
          attributeName="opacity"
          values={`0; ${maxOpacity * 0.3}; ${maxOpacity}; ${maxOpacity * 0.5}; 0`}
          keyTimes="0; 0.1; 0.5; 0.8; 1"
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />

        {/* 长度微妙变化（模拟光强波动）*/}
        <animate
          attributeName="ry"
          values={`${length}; ${length * 1.2}; ${length * 0.9}; ${length}`}
          dur={`${duration * 0.6}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
      </ellipse>
    </g>
  )
}
