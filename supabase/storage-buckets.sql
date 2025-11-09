-- Supabase Storage 存储桶和策略配置
-- 此脚本应在Supabase SQL编辑器中执行

-- 1. 创建存储桶
-- 注意：这些命令需要在Supabase Dashboard的SQL编辑器中执行
-- 或者使用Supabase CLI

-- 创建产品图片存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products-images', 
  'products-images', 
  true, 
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 创建课程图片存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'courses-images', 
  'courses-images', 
  true, 
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 创建用户头像存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 创建课程视频存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'courses-videos', 
  'courses-videos', 
  true, 
  104857600, -- 100MB
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
) ON CONFLICT (id) DO NOTHING;

-- 创建产品视频存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products-videos', 
  'products-videos', 
  true, 
  104857600, -- 100MB
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
) ON CONFLICT (id) DO NOTHING;

-- 2. 创建存储策略 (Storage Policies)

-- 产品图片存储策略
-- 允许所有人查看产品图片
CREATE POLICY "Public Access Product Images" ON storage.objects
  FOR SELECT USING (bucket_id = 'products-images');

-- 允许认证用户上传产品图片
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'products-images' AND 
    auth.role() = 'authenticated'
  );

-- 允许认证用户更新自己的产品图片
CREATE POLICY "Authenticated users can update own product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'products-images' AND 
    auth.role() = 'authenticated'
  );

-- 允许认证用户删除自己的产品图片
CREATE POLICY "Authenticated users can delete own product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'products-images' AND 
    auth.role() = 'authenticated'
  );

-- 课程图片存储策略
-- 允许所有人查看课程图片
CREATE POLICY "Public Access Course Images" ON storage.objects
  FOR SELECT USING (bucket_id = 'courses-images');

-- 允许认证用户上传课程图片
CREATE POLICY "Authenticated users can upload course images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'courses-images' AND 
    auth.role() = 'authenticated'
  );

-- 允许认证用户更新自己的课程图片
CREATE POLICY "Authenticated users can update own course images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'courses-images' AND 
    auth.role() = 'authenticated'
  );

-- 允许认证用户删除自己的课程图片
CREATE POLICY "Authenticated users can delete own course images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'courses-images' AND 
    auth.role() = 'authenticated'
  );

-- 用户头像存储策略
-- 允许所有人查看用户头像
CREATE POLICY "Public Access Avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- 允许认证用户上传头像
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated' AND
    (auth.uid()::text = (storage.foldername(name))[1])
  );

-- 允许用户更新自己的头像
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated' AND
    (auth.uid()::text = (storage.foldername(name))[1])
  );

-- 允许用户删除自己的头像
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated' AND
    (auth.uid()::text = (storage.foldername(name))[1])
  );

-- 课程视频存储策略
-- 允许所有人查看课程视频
CREATE POLICY "Public Access Course Videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'courses-videos');

-- 允许认证用户上传课程视频
CREATE POLICY "Authenticated users can upload course videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'courses-videos' AND 
    auth.role() = 'authenticated'
  );

-- 允许认证用户更新自己的课程视频
CREATE POLICY "Authenticated users can update own course videos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'courses-videos' AND 
    auth.role() = 'authenticated'
  );

-- 允许认证用户删除自己的课程视频
CREATE POLICY "Authenticated users can delete own course videos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'courses-videos' AND 
    auth.role() = 'authenticated'
  );

-- 产品视频存储策略
-- 允许所有人查看产品视频
CREATE POLICY "Public Access Product Videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'products-videos');

-- 允许认证用户上传产品视频
CREATE POLICY "Authenticated users can upload product videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'products-videos' AND 
    auth.role() = 'authenticated'
  );

-- 允许认证用户更新自己的产品视频
CREATE POLICY "Authenticated users can update own product videos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'products-videos' AND 
    auth.role() = 'authenticated'
  );

-- 允许认证用户删除自己的产品视频
CREATE POLICY "Authenticated users can delete own product videos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'products-videos' && 
    auth.role() = 'authenticated'
  );