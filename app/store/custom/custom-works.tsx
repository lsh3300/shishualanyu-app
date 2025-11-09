"use client";

import React from "react";
import { Card } from "@/components/ui/card";

// 精选作品组件
export function FeaturedWorks() {
  const works = [
    { id: "1", title: "蓝染围巾", image: "/placeholder.jpg", price: "¥280" },
    { id: "2", title: "扎染T恤", image: "/placeholder.jpg", price: "¥180" },
    { id: "3", title: "蜡染抱枕", image: "/placeholder.jpg", price: "¥220" },
    { id: "4", title: "蓝染帆布包", image: "/placeholder.jpg", price: "¥320" },
  ];

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">精选作品</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {works.map((work) => (
          <Card key={work.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
            <img 
              src={work.image} 
              alt={work.title} 
              className="w-full h-32 object-cover"
            />
            <div className="p-3">
              <h4 className="text-sm font-medium mb-1">{work.title}</h4>
              <p className="text-sm text-primary font-semibold">{work.price}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}