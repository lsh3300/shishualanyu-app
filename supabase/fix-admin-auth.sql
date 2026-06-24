-- ============================================
-- 管理员权限修复脚本
-- 请在 Supabase SQL 编辑器中执行
-- ============================================

-- 步骤 1: 检查 profiles 表结构
-- 查看 profiles 表的所有列
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- ============================================
-- 步骤 2: 查看你的用户信息
-- ============================================

-- 查看 auth.users 表中的用户（找到你的用户ID）
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- ============================================
-- 步骤 3: 检查 profiles 表中是否有你的记录
-- ============================================

-- 查看所有 profiles 记录
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 10;

-- ============================================
-- 步骤 4: 修复 - 为现有用户添加/更新 profile
-- 请将 'YOUR_USER_ID' 替换为你的实际用户ID
-- 请将 'YOUR_EMAIL' 替换为你的实际邮箱
-- ============================================

-- 方法 A: 如果 profiles 表中已有记录，只需更新角色
-- UPDATE profiles 
-- SET role = 'admin', status = 'active' 
-- WHERE id = 'YOUR_USER_ID';

-- 方法 B: 如果 profiles 表中没有记录，需要插入
-- 注意：根据你的表结构，可能需要调整字段
-- INSERT INTO profiles (id, role, status)
-- VALUES ('YOUR_USER_ID', 'admin', 'active')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin', status = 'active';

-- ============================================
-- 步骤 5: 检查 RLS 策略
-- ============================================

-- 查看 profiles 表的 RLS 策略
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- ============================================
-- 步骤 6: 确保 RLS 策略允许用户读取自己的 profile
-- ============================================

-- 如果没有允许用户读取自己 profile 的策略，添加：
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 允许用户更新自己的 profile（但不能修改 role）
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 步骤 7: 验证修复结果
-- ============================================

-- 再次检查你的 profile
-- SELECT id, username, full_name, role, status 
-- FROM profiles 
-- WHERE id = 'YOUR_USER_ID';

-- ============================================
-- 快速修复命令（一键执行）
-- 请先替换 YOUR_USER_ID 为你的实际用户ID
-- ============================================

/*
-- 取消注释并执行以下命令：

-- 1. 首先找到你的用户ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- 2. 然后执行更新（将 YOUR_USER_ID 替换为上一步查到的 ID）
UPDATE profiles 
SET role = 'admin', status = 'active' 
WHERE id = 'YOUR_USER_ID';

-- 如果上面的 UPDATE 返回 0 行，说明 profiles 表中没有你的记录
-- 需要先检查表结构，然后插入记录

-- 3. 验证结果
SELECT id, username, role, status FROM profiles WHERE id = 'YOUR_USER_ID';
*/
