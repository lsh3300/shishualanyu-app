-- ============================================================================
-- 游戏系统数据库初始化脚本
-- Game System Database Initialization
-- 
-- 特点：
-- 1. 使用 IF NOT EXISTS 确保幂等性
-- 2. 包含所有游戏相关表
-- 3. 包含索引和RLS策略
-- ============================================================================

-- ============================================================================
-- 1. 玩家档案表
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_profile (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dye_house_name TEXT DEFAULT '无名染坊',
  level INT DEFAULT 1 CHECK (level >= 1 AND level <= 100),
  exp INT DEFAULT 0 CHECK (exp >= 0),
  currency INT DEFAULT 100 CHECK (currency >= 0),
  total_cloths_created INT DEFAULT 0 CHECK (total_cloths_created >= 0),
  total_score BIGINT DEFAULT 0,
  highest_score INT DEFAULT 0,
  shop_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_player_profile_level ON player_profile(level DESC);
CREATE INDEX IF NOT EXISTS idx_player_profile_score ON player_profile(highest_score DESC);

-- RLS
ALTER TABLE player_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON player_profile;
CREATE POLICY "Users can view all profiles"
  ON player_profile FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON player_profile;
CREATE POLICY "Users can update own profile"
  ON player_profile FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON player_profile;
CREATE POLICY "Users can insert own profile"
  ON player_profile FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 2. 作品表
-- ============================================================================

CREATE TABLE IF NOT EXISTS cloths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  layers JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_inventory', 'listed', 'sold')),
  layer_count INT DEFAULT 0 CHECK (layer_count >= 0 AND layer_count <= 20),
  is_recent BOOLEAN DEFAULT false,
  ai_name TEXT,
  ai_biography TEXT,
  final_image_url TEXT,
  views_count INT DEFAULT 0,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_cloths_creator ON cloths(creator_id);
CREATE INDEX IF NOT EXISTS idx_cloths_status ON cloths(status);
CREATE INDEX IF NOT EXISTS idx_cloths_created_at ON cloths(created_at DESC);

-- RLS
ALTER TABLE cloths ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view cloths" ON cloths;
CREATE POLICY "Anyone can view cloths"
  ON cloths FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own cloths" ON cloths;
CREATE POLICY "Users can insert own cloths"
  ON cloths FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users can update own cloths" ON cloths;
CREATE POLICY "Users can update own cloths"
  ON cloths FOR UPDATE
  USING (auth.uid() = creator_id);

-- ============================================================================
-- 3. 评分记录表
-- ============================================================================

CREATE TABLE IF NOT EXISTS cloth_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cloth_id UUID REFERENCES cloths(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  color_score INT CHECK (color_score >= 0 AND color_score <= 100),
  pattern_score INT CHECK (pattern_score >= 0 AND pattern_score <= 100),
  creativity_score INT CHECK (creativity_score >= 0 AND creativity_score <= 100),
  technique_score INT CHECK (technique_score >= 0 AND technique_score <= 100),
  total_score INT CHECK (total_score >= 0 AND total_score <= 100),
  grade TEXT CHECK (grade IN ('C', 'B', 'A', 'S', 'SS', 'SSS')),
  exp_reward INT DEFAULT 0,
  currency_reward INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_cloth_scores_cloth ON cloth_scores(cloth_id);
CREATE INDEX IF NOT EXISTS idx_cloth_scores_user ON cloth_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_cloth_scores_grade ON cloth_scores(grade);

-- RLS
ALTER TABLE cloth_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view scores" ON cloth_scores;
CREATE POLICY "Anyone can view scores"
  ON cloth_scores FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own scores" ON cloth_scores;
CREATE POLICY "Users can insert own scores"
  ON cloth_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 4. 用户背包表
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cloth_id UUID NOT NULL REFERENCES cloths(id) ON DELETE CASCADE,
  slot_type TEXT NOT NULL CHECK (slot_type IN ('inventory', 'recent')),
  added_at TIMESTAMPTZ DEFAULT now(),
  sort_order INT DEFAULT 0,
  UNIQUE(user_id, cloth_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_inventory_user ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_cloth ON user_inventory(cloth_id);
CREATE INDEX IF NOT EXISTS idx_inventory_type ON user_inventory(user_id, slot_type);

-- RLS
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own inventory" ON user_inventory;
CREATE POLICY "Users can view own inventory"
  ON user_inventory FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own inventory" ON user_inventory;
CREATE POLICY "Users can manage own inventory"
  ON user_inventory FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. 用户商店表
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL DEFAULT '我的蓝染坊',
  shop_level INT DEFAULT 1,
  shop_exp INT DEFAULT 0,
  max_inventory_size INT DEFAULT 20,
  max_listing_slots INT DEFAULT 5,
  theme TEXT DEFAULT 'traditional',
  character_customization JSONB DEFAULT '{"hairstyle": "default", "outfit_color": "indigo", "accessory": "none"}'::jsonb,
  total_sales INT DEFAULT 0,
  total_earnings BIGINT DEFAULT 0,
  total_views INT DEFAULT 0,
  total_likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_shops_user ON user_shops(user_id);
CREATE INDEX IF NOT EXISTS idx_shops_level ON user_shops(shop_level DESC);

-- RLS
ALTER TABLE user_shops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view shops" ON user_shops;
CREATE POLICY "Anyone can view shops"
  ON user_shops FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage own shop" ON user_shops;
CREATE POLICY "Users can manage own shop"
  ON user_shops FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. 商店上架表
-- ============================================================================

CREATE TABLE IF NOT EXISTS shop_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES user_shops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cloth_id UUID NOT NULL REFERENCES cloths(id) ON DELETE CASCADE,
  price INT NOT NULL CHECK (price > 0),
  base_price INT NOT NULL,
  status TEXT DEFAULT 'listed' CHECK (status IN ('listed', 'sold', 'withdrawn')),
  display_order INT DEFAULT 999,
  is_featured BOOLEAN DEFAULT false,
  listed_at TIMESTAMPTZ DEFAULT now(),
  sold_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,
  UNIQUE(cloth_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_listings_shop ON shop_listings(shop_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_user ON shop_listings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_status ON shop_listings(status, listed_at DESC);

-- RLS
ALTER TABLE shop_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view listed items" ON shop_listings;
CREATE POLICY "Anyone can view listed items"
  ON shop_listings FOR SELECT
  USING (status = 'listed' OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own listings" ON shop_listings;
CREATE POLICY "Users can manage own listings"
  ON shop_listings FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 7. 交易记录表
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cloth_id UUID NOT NULL REFERENCES cloths(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES shop_listings(id) ON DELETE SET NULL,
  price INT NOT NULL,
  actual_price INT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('player_buy', 'system_buy')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id, created_at DESC);

-- RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

DROP POLICY IF EXISTS "System can create transactions" ON transactions;
CREATE POLICY "System can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 8. 商店访问记录表
-- ============================================================================

CREATE TABLE IF NOT EXISTS shop_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES user_shops(id) ON DELETE CASCADE,
  visited_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_visits_shop ON shop_visits(shop_id, visited_at DESC);

-- RLS
ALTER TABLE shop_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create visits" ON shop_visits;
CREATE POLICY "Anyone can create visits"
  ON shop_visits FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 9. 商店收藏表
-- ============================================================================

CREATE TABLE IF NOT EXISTS shop_favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES user_shops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, shop_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_favorites_user ON shop_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_shop ON shop_favorites(shop_id);

-- RLS
ALTER TABLE shop_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own favorites" ON shop_favorites;
CREATE POLICY "Users can view own favorites"
  ON shop_favorites FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own favorites" ON shop_favorites;
CREATE POLICY "Users can manage own favorites"
  ON shop_favorites FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 10. 辅助函数
-- ============================================================================

-- 增加商店访问量
CREATE OR REPLACE FUNCTION increment_shop_views(shop_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE user_shops
  SET total_views = total_views + 1
  WHERE id = shop_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 自动创建玩家档案触发器
CREATE OR REPLACE FUNCTION create_player_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO player_profile (user_id, dye_house_name)
  VALUES (NEW.id, '无名染坊')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 删除旧触发器（如果存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_player_profile_on_signup();

-- ============================================================================
-- 完成
-- ============================================================================

COMMENT ON TABLE player_profile IS '玩家档案，存储等级、经验、货币等';
COMMENT ON TABLE cloths IS '作品表，存储用户创作的蓝染作品';
COMMENT ON TABLE cloth_scores IS '评分记录，存储作品的评分详情';
COMMENT ON TABLE user_inventory IS '用户背包，存储保存的作品';
COMMENT ON TABLE user_shops IS '用户商店，每个用户一个商店';
COMMENT ON TABLE shop_listings IS '商店上架作品';
COMMENT ON TABLE transactions IS '交易记录';
COMMENT ON TABLE shop_visits IS '商店访问记录';
COMMENT ON TABLE shop_favorites IS '商店收藏';
