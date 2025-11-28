# Supabase收藏表创建指南

## 问题分析
经过检查，发现收藏功能无法正常工作的原因是数据库中缺少`favorites`表。

## 解决方案

### 1. 访问Supabase控制台
请访问以下URL进入Supabase项目的SQL编辑器：
https://ihsghruaglrolmpnxewt.supabase.co/project/default/sql

### 2. 执行SQL创建表
在SQL编辑器中执行以下SQL语句来创建`favorites`表：

```sql
-- 创建收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 启用行级安全
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY IF NOT EXISTS "Users can view own favorites" 
  ON favorites FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own favorites" 
  ON favorites FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own favorites" 
  ON favorites FOR DELETE 
  USING (auth.uid() = user_id);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
```

### 3. 验证表创建
执行完SQL后，可以在左侧的表列表中查看`favorites`表是否已成功创建。

## 注意事项
1. 请确保在Supabase控制台中已登录并选择了正确的项目
2. 如果遇到权限问题，可能需要使用项目的`service_role`密钥
3. 创建表后，收藏功能应该能够正常工作

## 后续步骤
创建表完成后，我们可以继续测试收藏功能是否正常工作。