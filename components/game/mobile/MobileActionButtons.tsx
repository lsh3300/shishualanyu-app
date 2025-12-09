'use client'

import { useState } from 'react'
import { Undo2, Redo2, Trash2, Copy, Eye, EyeOff, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface MobileActionButtonsProps {
  // 撤销/重做
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  
  // 图层操作
  hasSelection: boolean
  onDelete: () => void
  onDuplicate: () => void
  onClear: () => void
  
  // 显示控制
  onToggleLayerPanel?: () => void
  onTogglePropertyPanel?: () => void
}

/**
 * 移动端浮动操作按钮组
 * 替代PC端快捷键功能
 */
export function MobileActionButtons({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  hasSelection,
  onDelete,
  onDuplicate,
  onClear,
  onToggleLayerPanel,
  onTogglePropertyPanel
}: MobileActionButtonsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      {/* 主按钮 - 始终显示 */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="
          fixed bottom-6 right-6 z-50
          w-14 h-14 rounded-full
          bg-gradient-to-br from-blue-600 to-indigo-600
          text-white shadow-lg
          flex items-center justify-center
          md:hidden
        "
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isExpanded ? 45 : 0 }}
      >
        <Menu className="w-6 h-6" />
      </motion.button>

      {/* 扩展按钮组 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="
              fixed bottom-24 right-6 z-40
              flex flex-col gap-3
              md:hidden
            "
          >
            {/* 撤销 */}
            <ActionButton
              icon={<Undo2 className="w-5 h-5" />}
              label="撤销"
              onClick={() => {
                onUndo()
                setIsExpanded(false)
              }}
              disabled={!canUndo}
              variant="primary"
            />

            {/* 重做 */}
            <ActionButton
              icon={<Redo2 className="w-5 h-5" />}
              label="重做"
              onClick={() => {
                onRedo()
                setIsExpanded(false)
              }}
              disabled={!canRedo}
              variant="primary"
            />

            {/* 分隔线 */}
            {hasSelection && <div className="w-full h-px bg-gray-300" />}

            {/* 复制图层 */}
            {hasSelection && (
              <ActionButton
                icon={<Copy className="w-5 h-5" />}
                label="复制"
                onClick={() => {
                  onDuplicate()
                  setIsExpanded(false)
                }}
                variant="success"
              />
            )}

            {/* 删除图层 */}
            {hasSelection && (
              <ActionButton
                icon={<Trash2 className="w-5 h-5" />}
                label="删除"
                onClick={() => {
                  onDelete()
                  setIsExpanded(false)
                }}
                variant="danger"
              />
            )}

            {/* 清空画布 */}
            <ActionButton
              icon={<Trash2 className="w-5 h-5" />}
              label="清空"
              onClick={() => {
                if (confirm('确定要清空画布吗？')) {
                  onClear()
                  setIsExpanded(false)
                }
              }}
              variant="danger"
            />

            {/* 图层面板切换 */}
            {onToggleLayerPanel && (
              <ActionButton
                icon={<Eye className="w-5 h-5" />}
                label="图层"
                onClick={() => {
                  onToggleLayerPanel()
                  setIsExpanded(false)
                }}
                variant="info"
              />
            )}

            {/* 属性面板切换 */}
            {onTogglePropertyPanel && hasSelection && (
              <ActionButton
                icon={<EyeOff className="w-5 h-5" />}
                label="属性"
                onClick={() => {
                  onTogglePropertyPanel()
                  setIsExpanded(false)
                }}
                variant="info"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 遮罩层 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="
              fixed inset-0 bg-black/20 z-30
              md:hidden
            "
          />
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * 单个操作按钮
 */
function ActionButton({
  icon,
  label,
  onClick,
  disabled = false,
  variant = 'primary'
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'success' | 'danger' | 'info'
}) {
  const variants = {
    primary: 'from-blue-500 to-blue-600',
    success: 'from-green-500 to-green-600',
    danger: 'from-red-500 to-red-600',
    info: 'from-purple-500 to-purple-600'
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.9 }}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-full
        bg-gradient-to-r ${variants[variant]}
        text-white shadow-lg
        disabled:opacity-40 disabled:cursor-not-allowed
        min-w-[120px]
      `}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  )
}
