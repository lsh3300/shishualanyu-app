-- 购物车相关数据表
-- 此脚本应在Supabase SQL编辑器中执行

-- 1. 购物车表
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  color TEXT, -- 可选：商品颜色
  size TEXT, -- 可选：商品尺寸
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id, COALESCE(color, ''), COALESCE(size, ''))
);

-- 为cart_items表添加更新时间戳触发器
CREATE TRIGGER update_cart_items_updated_at 
  BEFORE UPDATE ON cart_items 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Users can view own cart items" 
  ON cart_items FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" 
  ON cart_items FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" 
  ON cart_items FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" 
  ON cart_items FOR DELETE 
  USING (auth.uid() = user_id);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_product ON cart_items(user_id, product_id);

-- 2. 订单表优化（如果需要）
-- 注：订单相关表已在主schema中定义，这里可以补充必要的触发器或视图

COMMENT ON TABLE cart_items IS '购物车表，存储用户的购物车商品';
COMMENT ON COLUMN cart_items.color IS '商品颜色规格（可选）';
COMMENT ON COLUMN cart_items.size IS '商品尺寸规格（可选）';