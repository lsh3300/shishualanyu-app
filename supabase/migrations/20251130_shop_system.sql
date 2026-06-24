-- ============================================================================
-- 商店游戏系统数据库迁移
-- Shop Game System Migration
-- 创建日期: 2025-11-30
-- ============================================================================

-- ============================================================================
-- 1. 作品表扩展（给cloths表添加新字段）
-- ============================================================================

-- 添加作品状态字段
ALTER TABLE cloths
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_inventory', 'listed', 'sold'));

-- 添加保存时间
ALTER TABLE cloths
ADD COLUMN IF NOT EXISTS saved_at TIMESTAMPTZ;

-- 添加是否在"最近创作"中
ALTER TABLE cloths
ADD COLUMN IF NOT EXISTS is_recent BOOLEAN DEFAULT false;

-- ============================================================================
-- 2. 用户背包表
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cloth_id UUID NOT NULL REFERENCES cloths(id) ON DELETE CASCADE,
  slot_type TEXT NOT NULL CHECK (slot_type IN ('inventory', 'recent')),
  added_at TIMESTAMPTZ DEFAULT now(),
  sort_order INT DEFAULT 0,
  
  UNIQUE(user_id, cloth_id),
  UNIQUE(user_id, cloth_id, slot_type)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_inventory_user ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_cloth ON user_inventory(cloth_id);
CREATE INDEX IF NOT EXISTS idx_inventory_type ON user_inventory(user_id, slot_type);

-- ============================================================================
-- 3. 商店表
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL DEFAULT '我的蓝染坊',
  shop_level INT DEFAULT 1,
  shop_exp INT DEFAULT 0,
  
  -- 商店配置
  max_inventory_size INT DEFAULT 20, -- 背包最大容量
  max_listing_slots INT DEFAULT 5,   -- 同时上架数量
  
  -- 商店自定义
  theme TEXT DEFAULT 'traditional', -- 主题
  character_customization JSONB DEFAULT '{
    "hairstyle": "default",
    "outfit_color": "indigo",
    "accessory": "none"
  }'::jsonb,
  
  -- 统计数据
  total_sales INT DEFAULT 0,        -- 总销售数量
  total_earnings BIGINT DEFAULT 0,  -- 总收入
  total_views INT DEFAULT 0,        -- 被访问次数
  total_likes INT DEFAULT 0,        -- 被点赞次数
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_shops_user ON user_shops(user_id);
CREATE INDEX IF NOT EXISTS idx_shops_level ON user_shops(shop_level DESC);

-- ============================================================================
-- 4. 商店上架作品表
-- ============================================================================

CREATE TABLE IF NOT EXISTS shop_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES user_shops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cloth_id UUID NOT NULL REFERENCES cloths(id) ON DELETE CASCADE,
  
  -- 价格信息
  price INT NOT NULL CHECK (price > 0),
  base_price INT NOT NULL, -- 系统建议价格
  
  -- 状态
  status TEXT DEFAULT 'listed' CHECK (status IN ('listed', 'sold', 'withdrawn')),
  
  -- 展示位置
  display_order INT DEFAULT 999, -- 越小越靠前
  is_featured BOOLEAN DEFAULT false, -- 是否精选展示
  
  -- 时间
  listed_at TIMESTAMPTZ DEFAULT now(),
  sold_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,
  
  UNIQUE(cloth_id) -- 一个作品只能上架一次
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_listings_shop ON shop_listings(shop_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_user ON shop_listings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_status ON shop_listings(status, listed_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON shop_listings(is_featured, listed_at DESC) WHERE status = 'listed';

-- ============================================================================
-- 5. 交易记录表
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 交易双方
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL表示系统收购
  
  -- 交易内容
  cloth_id UUID NOT NULL REFERENCES cloths(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES shop_listings(id) ON DELETE SET NULL,
  
  -- 价格信息
  price INT NOT NULL,          -- 标价
  actual_price INT NOT NULL,   -- 实际获得（系统收购时打折）
  
  -- 交易类型
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('player_buy', 'system_buy')),
  
  -- 时间
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type, created_at DESC);

-- ============================================================================
-- 6. 商店访问记录表
-- ============================================================================

CREATE TABLE IF NOT EXISTS shop_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES user_shops(id) ON DELETE CASCADE,
  visited_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_visits_shop ON shop_visits(shop_id, visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_visitor ON shop_visits(visitor_id, visited_at DESC);

-- ============================================================================
-- 7. 商店收藏表
-- ============================================================================

CREATE TABLE IF NOT EXISTS shop_favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES user_shops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  PRIMARY KEY (user_id, shop_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_favorites_user ON shop_favorites(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_shop ON shop_favorites(shop_id, created_at DESC);

-- ============================================================================
-- 8. RLS 安全策略
-- ============================================================================

-- 背包表 RLS
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inventory"
  ON user_inventory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own inventory"
  ON user_inventory FOR ALL
  USING (auth.uid() = user_id);

-- 商店表 RLS
ALTER TABLE user_shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shops"
  ON user_shops FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own shop"
  ON user_shops FOR ALL
  USING (auth.uid() = user_id);

-- 上架作品表 RLS
ALTER TABLE shop_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view listed items"
  ON shop_listings FOR SELECT
  USING (status = 'listed' OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own listings"
  ON shop_listings FOR ALL
  USING (auth.uid() = user_id);

-- 交易记录表 RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

CREATE POLICY "System can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (true);

-- 访问记录表 RLS
ALTER TABLE shop_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view visit records of their shop"
  ON shop_visits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_shops
      WHERE user_shops.id = shop_visits.shop_id
      AND user_shops.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create visit records"
  ON shop_visits FOR INSERT
  WITH CHECK (true);

-- 收藏表 RLS
ALTER TABLE shop_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON shop_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites"
  ON shop_favorites FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 9. 辅助函数
-- ============================================================================

-- 自动创建商店（在用户首次需要时）
CREATE OR REPLACE FUNCTION ensure_user_shop()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_shops (user_id, shop_name)
  VALUES (NEW.user_id, NEW.user_id || '的蓝染坊')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 在player_profile创建时自动创建商店
CREATE TRIGGER trigger_create_shop_on_profile
  AFTER INSERT ON player_profile
  FOR EACH ROW
  EXECUTE FUNCTION ensure_user_shop();

-- 更新商店统计数据
CREATE OR REPLACE FUNCTION update_shop_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.transaction_type IN ('player_buy', 'system_buy') THEN
    -- 更新卖家商店统计
    UPDATE user_shops
    SET 
      total_sales = total_sales + 1,
      total_earnings = total_earnings + NEW.actual_price,
      updated_at = now()
    WHERE user_id = NEW.seller_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 交易后更新统计
CREATE TRIGGER trigger_update_shop_stats
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_shop_stats();

-- 计算建议价格函数
CREATE OR REPLACE FUNCTION calculate_suggested_price(
  p_total_score NUMERIC,
  p_grade TEXT
)
RETURNS INT AS $$
DECLARE
  multiplier NUMERIC;
BEGIN
  -- 根据评级确定系数
  multiplier := CASE p_grade
    WHEN 'SSS' THEN 15
    WHEN 'SS' THEN 10
    WHEN 'S' THEN 7
    WHEN 'A' THEN 5
    WHEN 'B' THEN 3
    WHEN 'C' THEN 1
    ELSE 1
  END;
  
  RETURN ROUND(p_total_score * multiplier)::INT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 10. 初始数据
-- ============================================================================

-- 为现有用户创建商店（如果有的话）
INSERT INTO user_shops (user_id, shop_name)
SELECT 
  user_id,
  '我的蓝染坊'
FROM player_profile
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- 完成
-- ============================================================================

COMMENT ON TABLE user_inventory IS '用户背包，存储保存的作品';
COMMENT ON TABLE user_shops IS '用户商店，每个用户一个商店';
COMMENT ON TABLE shop_listings IS '商店上架作品，在售的作品列表';
COMMENT ON TABLE transactions IS '交易记录，包括玩家购买和系统收购';
COMMENT ON TABLE shop_visits IS '商店访问记录';
COMMENT ON TABLE shop_favorites IS '商店收藏';
