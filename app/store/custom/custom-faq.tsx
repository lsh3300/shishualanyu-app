"use client";

import React from "react";
import { Card } from "@/components/ui/card";

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