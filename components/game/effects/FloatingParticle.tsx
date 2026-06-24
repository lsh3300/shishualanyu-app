'use client'

/**
 * 漂浮粒子组件 - 模拟空气中的微小粒子
 * 
 * 用途：
 * - 晨曦：水汽粒子、露珠反光
 * - 日间：空气中的尘埃
 * - 黄昏：浮尘、花粉
 * - 夜晚：萤火虫、星点
 */

export interface FloatingParticleProps {
  /** X位置 */
  x: number
  /** 起始Y位置 */
  startY: number
  /** 粒子大小 */
  size: number
  /** 颜色 */
  color: string
  /** 动画类型 */
  type: 'rise' | 'fall' | 'float' | 'firefly'
  /** 动画时长 */
  duration: number
  /** 延迟 */
  delay: number
  /** 横向漂移范围 */
  driftX: number
  /** 纵向移动距离 */
  moveY: number
  /** 最大不透明度 */
  maxOpacity: number
}

export function FloatingParticle({
  x,
  startY,
  size,
  color,
  type,
  duration,
  delay,
  driftX,
  moveY,
  maxOpacity,
}: FloatingParticleProps) {
  const id = `particle-${Math.random().toString(36).substr(2, 9)}`

  // 根据类型生成不同的路径
  const getAnimationPath = () => {
    switch (type) {
      case 'rise':
        // 上升（水汽）
        return {
          cy: `${startY}; ${startY - moveY}`,
          cx: `${x}; ${x + driftX}; ${x - driftX * 0.5}; ${x + driftX * 0.3}`,
          opacity: `0; ${maxOpacity}; ${maxOpacity * 0.7}; 0`,
        }
      case 'fall':
        // 下落（尘埃）
        return {
          cy: `${startY}; ${startY + moveY}`,
          cx: `${x}; ${x - driftX * 0.5}; ${x + driftX}; ${x - driftX * 0.3}`,
          opacity: `0; ${maxOpacity}; ${maxOpacity * 0.8}; 0`,
        }
      case 'float':
        // 漂浮（随机）
        return {
          cy: `${startY}; ${startY - moveY * 0.3}; ${startY + moveY * 0.2}; ${startY}`,
          cx: `${x}; ${x + driftX}; ${x - driftX}; ${x}`,
          opacity: `${maxOpacity * 0.3}; ${maxOpacity}; ${maxOpacity * 0.5}; ${maxOpacity * 0.3}`,
        }
      case 'firefly':
        // 萤火虫（闪烁 + 随机路径）
        return {
          cy: `${startY}; ${startY + moveY * 0.5}; ${startY - moveY * 0.3}; ${startY + moveY * 0.2}; ${startY}`,
          cx: `${x}; ${x + driftX * 0.7}; ${x - driftX * 0.5}; ${x + driftX * 0.3}; ${x}`,
          opacity: `0; ${maxOpacity}; 0; ${maxOpacity * 0.8}; 0; ${maxOpacity}; 0`,
        }
    }
  }

  const animations = getAnimationPath()

  return (
    <g>
      {type === 'firefly' && (
        <defs>
          <filter id={`${id}-glow`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feFlood floodColor={color} floodOpacity="0.8" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}

      <circle
        cx={x}
        cy={startY}
        r={size}
        fill={color}
        opacity={0}
        filter={type === 'firefly' ? `url(#${id}-glow)` : undefined}
      >
        {/* Y轴动画 */}
        <animate
          attributeName="cy"
          values={animations.cy}
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />

        {/* X轴动画 */}
        <animate
          attributeName="cx"
          values={animations.cx}
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />

        {/* 透明度动画 */}
        <animate
          attributeName="opacity"
          values={animations.opacity}
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />

        {/* 大小微妙变化 */}
        {(type === 'float' || type === 'firefly') && (
          <animate
            attributeName="r"
            values={`${size}; ${size * 1.3}; ${size * 0.8}; ${size}`}
            dur={`${duration * 0.7}s`}
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        )}
      </circle>
    </g>
  )
}
