"use client";

import React, { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// 定义匠人卡片组件的Props接口
interface CraftsmanCardProps {
  id: string;
  name: string;
  title: string;
  avatar: string;
  specialties: string[];
  experience: string;
  rating: number;
}

// 匠人卡片组件
export function CraftsmanCard({ craftsman }: { craftsman: CraftsmanCardProps }) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={craftsman.avatar} alt={craftsman.name} />
            <AvatarFallback>{craftsman.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{craftsman.name}</h3>
            <p className="text-sm text-muted-foreground">{craftsman.title}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-sm ${i < craftsman.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                ★
              </span>
            ))}
            <span className="text-sm text-muted-foreground ml-1">({craftsman.rating}.0)</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{craftsman.experience}</p>
          <div className="flex flex-wrap gap-1">
            {craftsman.specialties.map((specialty, index) => (
              <span key={index} className="bg-accent/10 text-accent text-xs px-2 py-1 rounded-full">
                {specialty}
              </span>
            ))}
          </div>
        </div>
        
        <Button className="w-full bg-primary hover:bg-primary/90">
          选择这位匠人
        </Button>
      </div>
    </Card>
  );
}

// 匠人卡片骨架屏
function CraftsmanCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-4" />
            ))}
            <Skeleton className="h-4 w-12 ml-1" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <div className="flex flex-wrap gap-1">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-16 rounded-full" />
            ))}
          </div>
        </div>
        
        <Skeleton className="h-10 w-full" />
      </div>
    </Card>
  );
}

// 懒加载的匠人卡片组件
const LazyCraftsmanCard = lazy(() => import('./custom-craftsmen').then(module => ({
  default: module.CraftsmanCard
})));

// 匠人团队组件
export function CraftsmenTeam({ craftsmen }: { craftsmen: CraftsmanCardProps[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {craftsmen.map((craftsman) => (
        <Suspense key={craftsman.id} fallback={<CraftsmanCardSkeleton />}>
          <LazyCraftsmanCard craftsman={craftsman} />
        </Suspense>
      ))}
    </div>
  );
}

export { CraftsmanCardSkeleton, LazyCraftsmanCard };