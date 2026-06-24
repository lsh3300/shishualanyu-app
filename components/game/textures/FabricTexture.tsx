'use client'

/**
 * 布料纹理组件
 * 模拟亚麻布或棉布的纤维纹理
 */

interface FabricTextureProps {
  id?: string
  opacity?: number
  scale?: number
}

export function FabricTexture({ 
  id = 'fabric-texture',
  opacity = 0.15,
  scale = 1
}: FabricTextureProps) {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        {/* 布料纹理滤镜 */}
        <filter id={id} x="0%" y="0%" width="100%" height="100%">
          {/* 基础噪点 - 模拟纤维 */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            seed="2"
            result="noise"
          />
          
          {/* 颜色映射 - 米色到浅棕色 */}
          <feColorMatrix
            in="noise"
            type="matrix"
            values="
              0.95 0 0 0 0.05
              0.92 0 0 0 0.08
              0.85 0 0 0 0.15
              0 0 0 0.15 0
            "
            result="coloredNoise"
          />
          
          {/* 混合原图 */}
          <feBlend
            in="SourceGraphic"
            in2="coloredNoise"
            mode="multiply"
            result="blend"
          />
          
          {/* 添加细微的凹凸感 */}
          <feGaussianBlur in="blend" stdDeviation="0.5" result="blur" />
          
          {/* 最终合成 */}
          <feComposite
            in="SourceGraphic"
            in2="blur"
            operator="over"
            result="final"
          />
        </filter>

        {/* 布料纹理图案 - 用作背景 */}
        <pattern
          id={`${id}-pattern`}
          x="0"
          y="0"
          width="200"
          height="200"
          patternUnits="userSpaceOnUse"
        >
          {/* 基础布料色 */}
          <rect width="200" height="200" fill="#f5f3f0" />
          
          {/* 纹理噪点 */}
          <rect
            width="200"
            height="200"
            fill="url(#fabric-noise)"
            opacity={opacity}
          />
        </pattern>

        {/* 噪点图案 */}
        <filter id="fabric-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.2"
            numOctaves="3"
            seed="5"
          />
          <feColorMatrix
            type="saturate"
            values="0"
          />
        </filter>
      </defs>
    </svg>
  )
}

/**
 * 布料纹理背景组件
 * 可以直接作为画布背景使用
 */
export function FabricBackground({ 
  className = '',
  children 
}: { 
  className?: string
  children?: React.ReactNode 
}) {
  return (
    <div 
      className={`relative ${className}`}
      style={{
        background: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.02) 2px,
            rgba(0,0,0,0.02) 4px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.02) 2px,
            rgba(0,0,0,0.02) 4px
          ),
          #f8f6f3
        `,
        backgroundBlendMode: 'multiply'
      }}
    >
      <FabricTexture />
      {children}
    </div>
  )
}
