-- ============================================================================
-- 修复所有游戏相关表的 RLS 策略
-- 允许 Service Role Key 绕过 RLS
-- ============================================================================

-- 1. cloth_scores 表
DROP POLICY IF EXISTS "Anyone can view scores" ON cloth_scores;
DROP POLICY IF EXISTS "Users can insert own scores" ON cloth_scores;

CREATE POLICY "Anyone can view scores"
  ON cloth_scores FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own scores"
  ON cloth_scores FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR auth.jwt() IS NULL
  );

-- 2. user_inventory 表
DROP POLICY IF EXISTS "Users can view own inventory" ON user_inventory;
DROP POLICY IF EXISTS "Users can manage own inventory" ON user_inventory;

CREATE POLICY "Users can view own inventory"
  ON user_inventory FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() IS NULL);

CREATE POLICY "Users can manage own inventory"
  ON user_inventory FOR ALL
  USING (auth.uid() = user_id OR auth.jwt() IS NULL);

-- 3. player_profile 表
DROP POLICY IF EXISTS "Users can view all profiles" ON player_profile;
DROP POLICY IF EXISTS "Users can update own profile" ON player_profile;
DROP POLICY IF EXISTS "Users can insert own profile" ON player_profile;

CREATE POLICY "Users can view all profiles"
  ON player_profile FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON player_profile FOR UPDATE
  USING (auth.uid() = user_id OR auth.jwt() IS NULL);

CREATE POLICY "Users can insert own profile"
  ON player_profile FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.jwt() IS NULL);

-- 4. user_shops 表
DROP POLICY IF EXISTS "Anyone can view shops" ON user_shops;
DROP POLICY IF EXISTS "Users can manage own shop" ON user_shops;

CREATE POLICY "Anyone can view shops"
  ON user_shops FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own shop"
  ON user_shops FOR ALL
  USING (auth.uid() = user_id OR auth.jwt() IS NULL);

-- 5. shop_listings 表
DROP POLICY IF EXISTS "Anyone can view listed items" ON shop_listings;
DROP POLICY IF EXISTS "Users can manage own listings" ON shop_listings;

CREATE POLICY "Anyone can view listed items"
  ON shop_listings FOR SELECT
  USING (status = 'listed' OR auth.uid() = user_id OR auth.jwt() IS NULL);

CREATE POLICY "Users can manage own listings"
  ON shop_listings FOR ALL
  USING (auth.uid() = user_id OR auth.jwt() IS NULL);

-- 6. transactions 表
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "System can create transactions" ON transactions;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = seller_id OR auth.uid() = buyer_id OR auth.jwt() IS NULL);

CREATE POLICY "System can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (true);

-- 完成
SELECT '✅ All game tables RLS policies updated!' as status;
