'use client';

import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export default function TestFavorites() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    // 获取当前用户
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        setError('用户未登录');
        setLoading(false);
        return;
      }
      
      // 获取收藏列表
      try {
        const response = await fetch('/api/user/favorites');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFavorites(data.favorites || []);
      } catch (err: any) {
        setError(err?.message ?? String(err));
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  if (!user) return <div>请先登录</div>;

  const addTestFavorite = async () => {
    try {
      const response = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: '7f777c05-80e6-4927-ac3a-3bc373222dbb' }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('添加收藏成功:', data);
      
      // 重新获取收藏列表而不是刷新整个页面
      try {
        const favResponse = await fetch('/api/user/favorites');
        if (favResponse.ok) {
          const favData = await favResponse.json();
          setFavorites(favData.favorites || []);
        }
      } catch (err) {
        console.error('重新获取收藏列表失败:', err);
      }
    } catch (err: any) {
      setError(err?.message ?? String(err));
    }
  };

  return (
    <div>
      <h1>收藏测试页面</h1>
      <p>当前用户: {user.email}</p>
      
      <button onClick={addTestFavorite} style={{ padding: '8px 16px', marginBottom: '16px' }}>
        添加测试收藏
      </button>
      
      <h2>收藏列表 ({favorites.length})</h2>
      <ul>
        {favorites.map((fav) => (
          <li key={fav.id}>
            {fav.products?.name || '未知商品'} - ¥{fav.products?.price || 0}
          </li>
        ))}
      </ul>
      {favorites.length === 0 && <p>暂无收藏</p>}
    </div>
  );
}