-- 修复 user_items 表的 RLS 策略
-- Fix RLS policies for user_items table

-- 先删除所有现有策略
DROP POLICY IF EXISTS "Users can view own items" ON user_items;
DROP POLICY IF EXISTS "Users can insert own items" ON user_items;
DROP POLICY IF EXISTS "Users can update own items" ON user_items;
DROP POLICY IF EXISTS "Users can delete own items" ON user_items;
DROP POLICY IF EXISTS "Service role has full access to user_items" ON user_items;

-- 创建新的策略 - 允许所有操作（通过 service role）
-- 因为我们使用 service client，所以需要允许所有操作
CREATE POLICY "Allow all operations on user_items" ON user_items
  FOR ALL USING (true) WITH CHECK (true);

-- 或者如果你想要更严格的策略，可以使用以下替代方案：
-- CREATE POLICY "Users can manage own items" ON user_items
--   FOR ALL USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role')
--   WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');
