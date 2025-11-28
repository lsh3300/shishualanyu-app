"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

// 精选作品组件
export function FeaturedWorks() {
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 从数据库获取精选作品（使用家居、配饰等类别的产品）
  useEffect(() => {
    async function fetchFeaturedWorks() {
      try {
        const supabase = createClient();
        
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .in('category', ['家居', '配饰', '服饰'])
          .eq('status', 'published')
          .limit(4);
        
        if (error) {
          console.error('获取精选作品失败:', error);
          setWorks([]);
          return;
        }

        // 获取每个产品的封面图
        const worksWithImages = await Promise.all(
          (products || []).map(async (product) => {
            const { data: media } = await supabase
              .from('product_media')
              .select('url')
              .eq('product_id', product.id)
              .eq('cover', true)
              .single();
            
            return {
              id: product.id,
              title: product.name,
              image: media?.url || '/placeholder.jpg',
              price: `¥${product.price}`,
            };
          })
        );
        
        setWorks(worksWithImages);
      } catch (err) {
        console.error('获取精选作品异常:', err);
        setWorks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedWorks();
  }, []);

  if (loading) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">精选作品</h3>
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (works.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">精选作品</h3>
        <div className="text-center py-12 bg-muted/50 rounded-xl">
          <div className="text-4xl mb-3">🎨</div>
          <p className="text-muted-foreground">精选作品即将展示</p>
        </div>
      </div>
    );
  }

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
              <h4 className="text-sm font-medium mb-1 line-clamp-1">{work.title}</h4>
              <p className="text-sm text-primary font-semibold">{work.price}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}