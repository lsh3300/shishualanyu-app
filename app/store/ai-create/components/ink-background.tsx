"use client"

/**
 * 水墨晕染背景组件
 * 使用SVG滤镜 + CSS动画创建流动的水墨效果
 * 性能优化：使用transform和opacity，避免重绘
 */

export default function InkBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* SVG滤镜定义 */}
      <svg className="absolute w-0 h-0">
        <defs>
          {/* 水墨模糊效果 */}
          <filter id="ink-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="60" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 18 -7"
            />
            <feBlend in="SourceGraphic" in2="blurred" mode="normal" />
          </filter>
          
          {/* 晕染扩散效果 */}
          <filter id="ink-diffusion">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01"
              numOctaves="3"
              seed="1"
            >
              <animate
                attributeName="baseFrequency"
                values="0.01;0.015;0.01"
                dur="20s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="40" />
          </filter>
        </defs>
      </svg>

      {/* 渐变背景基础层 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100" />

      {/* 水墨晕染动画层 - 第一组 */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full opacity-30 animate-ink-float-1"
        style={{
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, transparent 70%)',
          filter: 'url(#ink-blur)',
          top: '10%',
          left: '5%',
        }}
      />

      {/* 水墨晕染动画层 - 第二组 */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-25 animate-ink-float-2"
        style={{
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, transparent 70%)',
          filter: 'url(#ink-blur)',
          top: '40%',
          right: '10%',
        }}
      />

      {/* 水墨晕染动画层 - 第三组 */}
      <div
        className="absolute w-[700px] h-[700px] rounded-full opacity-20 animate-ink-float-3"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
          filter: 'url(#ink-blur)',
          bottom: '10%',
          left: '30%',
        }}
      />

      {/* 细小的水墨粒子（装饰） */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-blue-400 opacity-20 animate-float-particle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
