-- 修复收藏功能的SQL脚本
-- 请在Supabase控制台的SQL编辑器中执行这些命令

-- 1. 首先检查favorites表的结构
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'favorites' 
AND table_schema = 'public';

-- 2. 创建users表（如果不存在）
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 插入测试用户（如果不存在）
INSERT INTO users (id, email) 
VALUES ('12345678-1234-1234-1234-123456789abc', 'test@example.com')
ON CONFLICT (id) DO NOTHING;

-- 4. 删除favorites表的外键约束（如果存在）
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'favorites_user_id_fkey' 
        AND table_name = 'favorites'
    ) THEN
        ALTER TABLE favorites DROP CONSTRAINT favorites_user_id_fkey;
    END IF;
END $$;

-- 5. 创建宽松的RLS策略，允许所有操作
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can update their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

-- 创建允许所有操作的策略
CREATE POLICY "Enable all operations for favorites" ON favorites
  FOR ALL USING (true) WITH CHECK (true);

-- 6. 确保RLS已启用
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 7. 测试查询
SELECT 'Users table count: ' || COUNT(*) FROM users;
SELECT 'Favorites table count: ' || COUNT(*) FROM favorites;

-- 8. 检查测试用户是否存在
SELECT * FROM users WHERE id = '12345678-1234-1234-1234-123456789abc';

-- 9. 检查当前RLS策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'favorites';