"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// CTA部分组件
export function CTASection() {
  return (
    <Card className="bg-gradient-to-r from-primary to-primary/80 text-white p-8 text-center">
      <h3 className="text-2xl font-bold mb-4">开始您的蓝染定制之旅</h3>
      <p className="mb-6 max-w-2xl mx-auto">
        我们的匠人团队将根据您的需求，为您打造独一无二的蓝染作品，传承千年工艺，展现现代美学。
      </p>
      <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
        立即咨询定制
      </Button>
    </Card>
  );
}