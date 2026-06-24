-- 为现有products表添加images和videos字段
-- 此脚本应在Supabase SQL编辑器中执行

-- 添加images字段（文本数组）
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- 添加videos字段（JSONB）
ALTER TABLE products ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]';

-- 更新现有产品的images字段，将image_url复制到images数组
UPDATE products 
SET images = ARRAY[image_url] 
WHERE image_url IS NOT NULL AND image_url != '' AND (images IS NULL OR array_length(images, 1) IS NULL);

-- 添加注释
COMMENT ON COLUMN products.images IS '产品图片数组';
COMMENT ON COLUMN products.videos IS '产品视频JSON数组';