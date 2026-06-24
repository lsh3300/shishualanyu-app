'use client';

import { useEffect, useState } from 'react';
import { Monitor, Smartphone, Tablet, X } from 'lucide-react';

interface MobileContainerProps {
  children: React.ReactNode;
}

export function MobileContainer({ children }: MobileContainerProps) {
  const [viewMode, setViewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [showControls, setShowControls] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobileDevice) {
      setViewMode('desktop');
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobileDevice) return;

    const root = document.documentElement;
    if (viewMode === 'desktop') {
      root.classList.remove('simulator-lock-scroll');
      return;
    }

    root.classList.add('simulator-lock-scroll');
    return () => {
      root.classList.remove('simulator-lock-scroll');
    };
  }, [viewMode, isMounted]);

  if (!isMounted) {
    return <>{children}</>;
  }

  const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobileDevice) {
    return (
      <div className="relative min-h-screen bg-app-background">
        <div id="mobile-toast-root" className="pointer-events-none fixed inset-x-0 bottom-0 z-[200] h-0" />

        <div className="mobile-frame relative min-h-screen overflow-x-hidden">
          {children}
        </div>

        <div
          id="mobile-fixed-actions-root"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[180] h-0"
        />

        <div
          id="mobile-bottom-nav-root"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[190] flex items-end"
        />
      </div>
    );
  }

  const containerWidths = {
    mobile: 'w-[420px]',
    tablet: 'w-[768px]',
    desktop: 'w-full',
  };

  return (
    <div
      className={`${
        viewMode === 'desktop' ? 'min-h-screen' : 'h-screen overflow-hidden'
      } flex justify-center bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 py-4`}
    >
      <div className="fixed left-6 top-6 z-[100] flex items-center gap-2">
        {showControls ? (
          <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white/95 p-1 shadow-lg backdrop-blur-sm">
            <button
              onClick={() => setViewMode('mobile')}
              className={`rounded-full p-2 transition-all ${
                viewMode === 'mobile' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="手机视图"
            >
              <Smartphone className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={`rounded-full p-2 transition-all ${
                viewMode === 'tablet' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="平板视图"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              className={`rounded-full p-2 transition-all ${
                viewMode === 'desktop' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="桌面视图"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <div className="mx-1 h-6 w-px bg-gray-200" />
            <button
              onClick={() => setShowControls(false)}
              className="rounded-full p-2 text-gray-400 transition-all hover:text-gray-600"
              title="关闭"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowControls(true)}
            className="rounded-full border border-gray-200 bg-white/95 p-2.5 text-gray-500 shadow-lg transition-all hover:text-indigo-600 backdrop-blur-sm"
            title="切换视图"
          >
            <Smartphone className="h-5 w-5" />
          </button>
        )}
      </div>

      {viewMode !== 'desktop' ? (
        <div
          className={`${containerWidths[viewMode]} relative transition-all duration-300`}
          style={{ height: 'calc(100vh - 32px)' }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-[3rem] border-[14px] border-gray-900 bg-gray-900 shadow-2xl">
            <div className="relative flex h-full w-full flex-col bg-app-background">
              <div id="mobile-toast-root" className="absolute inset-x-0 bottom-0 z-[200] h-0" />

              <div className="mobile-frame relative flex-1 overflow-y-auto overflow-x-hidden">
                {children}
              </div>

              <div
                id="mobile-fixed-actions-root"
                className="pointer-events-none absolute inset-x-0 bottom-0 z-[180] h-0"
              />

              <div
                id="mobile-bottom-nav-root"
                className="pointer-events-none absolute inset-x-0 bottom-0 z-[190] flex items-end"
              />

              <div className="hidden h-5 shrink-0 items-center justify-center bg-app-background">
                <div className="h-1 w-32 rounded-full bg-gray-400" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full">{children}</div>
      )}
    </div>
  );
}
