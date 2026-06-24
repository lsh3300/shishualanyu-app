'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'

export function Toaster() {
  const { toasts } = useToast()
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setPortalRoot(document.getElementById('mobile-toast-root'))
  }, [])

  const inMobileFrame = !!portalRoot

  const content = (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast
            key={id}
            {...props}
            className={
              inMobileFrame
                ? 'sm:max-w-[280px] sm:space-x-2.5 sm:p-2.5 sm:pr-6'
                : undefined
            }
          >
            <div className="grid flex-1 min-w-0 gap-1">
              {title && (
                <ToastTitle className={inMobileFrame ? 'break-words sm:text-[12px]' : 'break-words'}>
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription
                  className={inMobileFrame ? 'break-words sm:text-[11px]' : 'break-words'}
                >
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport
        className={
          inMobileFrame
            ? '!absolute !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !w-full !max-w-none items-center sm:!left-0 sm:!right-0 sm:!bottom-0 sm:!top-auto sm:!items-center sm:gap-1.5 sm:p-2.5 md:!max-w-none'
            : undefined
        }
        style={
          portalRoot
          ? {
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
              }
            : undefined
        }
      />
    </ToastProvider>
  )

  return portalRoot ? createPortal(content, portalRoot) : content
}
