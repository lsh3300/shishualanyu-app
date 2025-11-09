"use client";

import React, { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// 定义定制步骤组件的Props接口
interface CustomStepProps {
  id: string;
  title: string;
  description: string;
}

// 定制步骤组件
export function CustomStep({ step, index }: { step: CustomStepProps; index: number }) {
  return (
    <div 
      className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6 items-center md:items-start`}
    >
      <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:text-right pr-8' : 'md:text-left pl-8'}`}>
        <h4 className="text-lg font-semibold mb-2">{step.title}</h4>
        <p className="text-muted-foreground">{step.description}</p>
      </div>
      
      <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center z-20">
        {parseInt(step.id)}
      </div>
      
      <div className="w-full md:w-1/2"></div>
    </div>
  );
}

// 定制步骤骨架屏
function CustomStepSkeleton({ index }: { index: number }) {
  return (
    <div 
      className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6 items-center md:items-start`}
    >
      <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:text-right pr-8' : 'md:text-left pl-8'}`}>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      
      <Skeleton className="h-10 w-10 rounded-full" />
      
      <div className="w-full md:w-1/2"></div>
    </div>
  );
}

// 懒加载的定制步骤组件
const LazyCustomStep = lazy(() => import('./custom-process').then(module => ({
  default: module.CustomStep
})));

// 定制流程组件
export function CustomProcess({ steps }: { steps: CustomStepProps[] }) {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">定制流程</h3>
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-0 md:left-1/2 h-full w-0.5 bg-primary/20 transform md:-translate-x-1/2 z-0"></div>
        
        {/* Timeline Items */}
        <div className="space-y-12 relative z-10">
          {steps.map((step, index) => (
            <Suspense key={step.id} fallback={<CustomStepSkeleton index={index} />}>
              <LazyCustomStep step={step} index={index} />
            </Suspense>
          ))}
        </div>
      </div>
    </div>
  );
}

export { CustomStepSkeleton, LazyCustomStep };