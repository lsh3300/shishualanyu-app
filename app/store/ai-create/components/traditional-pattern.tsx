"use client"

import { motion } from "framer-motion"

/**
 * 传统纹样装饰组件
 * 使用SVG绘制扎染和蜡染的传统图案作为页面装饰
 * 低透明度，不抢夺主内容视线
 */
export default function TraditionalPattern() {
  return (
    <div className="fixed inset-0 -z-5 pointer-events-none opacity-10">
      {/* 扎染放射纹样 - 左上角 */}
      <motion.svg
        className="absolute -top-20 -left-20 w-64 h-64"
        viewBox="0 0 200 200"
        initial={{ rotate: 0, scale: 0.8 }}
        animate={{ rotate: 360, scale: 1 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <radialGradient id="tie-dye-1">
            <stop offset="0%" stopColor="#1e40af" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.1" />
          </radialGradient>
        </defs>
        
        {/* 中心圆 */}
        <circle cx="100" cy="100" r="10" fill="#1e40af" />
        
        {/* 放射线 */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180
          const x1 = 100 + Math.cos(angle) * 15
          const y1 = 100 + Math.sin(angle) * 15
          const x2 = 100 + Math.cos(angle) * 90
          const y2 = 100 + Math.sin(angle) * 90
          
          return (
            <g key={i}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#1e40af"
                strokeWidth="2"
                strokeDasharray="5,3"
              />
              <circle
                cx={x2}
                cy={y2}
                r="4"
                fill="url(#tie-dye-1)"
              />
            </g>
          )
        })}
        
        {/* 同心圆 */}
        {[30, 50, 70].map((r, i) => (
          <circle
            key={i}
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1"
            strokeDasharray="8,4"
            opacity={0.4 - i * 0.1}
          />
        ))}
      </motion.svg>

      {/* 蜡染几何纹样 - 右上角 */}
      <motion.svg
        className="absolute top-32 -right-16 w-48 h-48"
        viewBox="0 0 150 150"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <defs>
          <pattern id="batik-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <rect width="30" height="30" fill="none" />
            <path
              d="M15,0 L30,15 L15,30 L0,15 Z"
              fill="#1e40af"
              opacity="0.3"
            />
            <circle cx="15" cy="15" r="3" fill="#3b82f6" opacity="0.5" />
          </pattern>
        </defs>
        
        <rect width="150" height="150" fill="url(#batik-pattern)" />
        
        {/* 装饰边框 */}
        <rect
          x="10"
          y="10"
          width="130"
          height="130"
          fill="none"
          stroke="#1e40af"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      </motion.svg>

      {/* 水墨线条 - 左下角 */}
      <motion.svg
        className="absolute bottom-20 left-10 w-72 h-32"
        viewBox="0 0 300 100"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 3, ease: "easeInOut" }}
      >
        <motion.path
          d="M 10,50 Q 50,20 100,50 T 200,50 T 290,50"
          fill="none"
          stroke="#1e40af"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        />
        
        {/* 墨点装饰 */}
        {[50, 150, 250].map((x, i) => (
          <motion.circle
            key={i}
            cx={x}
            cy="50"
            r="4"
            fill="#3b82f6"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ delay: i * 0.3 + 1, duration: 0.5 }}
          />
        ))}
      </motion.svg>

      {/* 扎染纹样 - 右下角 */}
      <motion.svg
        className="absolute bottom-32 right-24 w-56 h-56"
        viewBox="0 0 200 200"
        initial={{ rotate: 0 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      >
        {/* 多层同心圆纹样 */}
        {[...Array(8)].map((_, i) => {
          const radius = 20 + i * 12
          const opacity = 0.5 - i * 0.05
          
          return (
            <circle
              key={i}
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#1e40af"
              strokeWidth="1.5"
              strokeDasharray={`${i % 2 === 0 ? '4,4' : '8,2'}`}
              opacity={opacity}
            />
          )
        })}
        
        {/* 花瓣装饰 */}
        {[...Array(6)].map((_, i) => {
          const angle = (i * 60 * Math.PI) / 180
          const x = 100 + Math.cos(angle) * 60
          const y = 100 + Math.sin(angle) * 60
          
          return (
            <ellipse
              key={i}
              cx={x}
              cy={y}
              rx="12"
              ry="6"
              fill="#3b82f6"
              opacity="0.2"
              transform={`rotate(${i * 60}, ${x}, ${y})`}
            />
          )
        })}
      </motion.svg>

      {/* 蜡染纹样 - 中部装饰 */}
      <motion.div
        className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 1.5 }}
      >
        <svg width="80" height="80" viewBox="0 0 100 100">
          <defs>
            <filter id="batik-texture">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.9"
                numOctaves="4"
                result="turbulence"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="turbulence"
                scale="2"
              />
            </filter>
          </defs>
          
          {/* 几何图形组合 */}
          <polygon
            points="50,10 90,40 70,80 30,80 10,40"
            fill="none"
            stroke="#1e40af"
            strokeWidth="2"
            opacity="0.3"
            filter="url(#batik-texture)"
          />
          
          <circle
            cx="50"
            cy="50"
            r="15"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            opacity="0.4"
          />
        </svg>
      </motion.div>
    </div>
  )
}
