"use client";

import React, { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 定义服务卡片组件的Props接口
interface ServiceCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  popular: boolean;
}

// 服务卡片组件
export function ServiceCard({ service }: { service: ServiceCardProps }) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative">
        <img 
          src={service.image} 
          alt={service.title} 
          className="w-full h-48 object-cover"
        />
        {service.popular && (
          <div className="absolute top-3 left-3 bg-accent text-white text-xs px-2 py-1 rounded-full">
            热门
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
        <p className="text-muted-foreground mb-4 text-sm">{service.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-accent">¥{service.price}</span>
          <Button className="bg-primary hover:bg-primary/90">
            立即定制
          </Button>
        </div>
      </div>
    </Card>
  );
}

// 服务卡片骨架屏
function ServiceCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="w-full h-48" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </Card>
  );
}

// 懒加载的服务卡片组件
const LazyServiceCard = lazy(() => import('./custom-services').then(module => ({
  default: module.ServiceCard
})));

// 服务列表组件
export function ServicesList({ services }: { services: ServiceCardProps[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {services.map((service) => (
        <Suspense key={service.id} fallback={<ServiceCardSkeleton />}>
          <LazyServiceCard service={service} />
        </Suspense>
      ))}
    </div>
  );
}

export { ServiceCardSkeleton, LazyServiceCard };