"use client";

import React, { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

// 精选作品骨架屏
function FeaturedWorksSkeleton() {
  return (
    <div className="mb-8">
      <Skeleton className="h-7 w-32 mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="w-full h-32" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// FAQ部分组件
export function FAQSection() {
  const faqs = [
    {
      question: "定制周期需要多长时间？",
      answer: "根据产品复杂程度，定制周期通常在2-4周之间。我们会根据您的具体需求提供准确的时间预估。"
    },
    {
      question: "可以定制哪些类型的产品？",
      answer: "我们提供围巾、服装、家居用品、配饰等多种蓝染产品的定制服务。您可以提出具体需求，我们会评估可行性。"
    },
    {
      question: "定制价格如何计算？",
      answer: "定制价格根据产品类型、尺寸、工艺复杂度和设计难度等因素确定。我们会在确认订单前提供详细报价。"
    },
    {
      question: "可以提供自己的设计吗？",
      answer: "当然可以！我们非常欢迎客户提供自己的设计想法，我们的匠人会与您沟通，确保最终产品符合您的期望。"
    }
  ];

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">常见问题</h3>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Card key={index} className="p-4">
            <h4 className="font-medium mb-2">{faq.question}</h4>
            <p className="text-sm text-muted-foreground">{faq.answer}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

// FAQ部分骨架屏
function FAQSectionSkeleton() {
  return (
    <div className="mb-8">
      <Skeleton className="h-7 w-32 mb-4" />
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </Card>
        ))}
      </div>
    </div>
  );
}

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

// CTA部分骨架屏
function CTASectionSkeleton() {
  return (
    <Card className="p-8 text-center">
      <Skeleton className="h-8 w-64 mx-auto mb-4" />
      <div className="space-y-2 mb-6 max-w-2xl mx-auto">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mx-auto" />
      </div>
      <Skeleton className="h-12 w-32 mx-auto" />
    </Card>
  );
}

// 懒加载组件
const LazyFeaturedWorks = lazy(() => import('./custom-works').then(module => ({
  default: module.FeaturedWorks
})));

const LazyFAQSection = lazy(() => import('./custom-faq').then(module => ({
  default: module.FAQSection
})));

const LazyCTASection = lazy(() => import('./custom-cta').then(module => ({
  default: module.CTASection
})));

// 导出懒加载组件和骨架屏
export { 
  FeaturedWorksSkeleton, 
  FAQSectionSkeleton, 
  CTASectionSkeleton,
  LazyFeaturedWorks,
  LazyFAQSection,
  LazyCTASection
};