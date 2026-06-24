-- 修复 profiles 表结构
-- 添加可能缺失的列

-- 添加 website 列（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'website'
  ) THEN
    ALTER TABLE profiles ADD COLUMN website TEXT;
  END IF;
END $$;

-- 添加 updated_at 列（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- 添加 created_at 列（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- 确保 avatars 存储桶存在且公开可访问
-- 注意：这需要在 Supabase Dashboard 中手动设置，或使用以下 SQL（需要 storage admin 权限）
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('avatars', 'avatars', true)
-- ON CONFLICT (id) DO UPDATE SET public = true;
