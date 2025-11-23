-- ============================================
-- 修复产品图片路径：替换为在线占位图
-- ============================================
-- 
-- 问题：数据库中使用了本地图片路径 /images/products/xxx.jpg
-- 这些图片不存在，导致404错误
-- 
-- 解决：替换为 picsum.photos 占位图
-- ============================================

BEGIN;

-- 更新所有本地图片路径为在线占位图
UPDATE public.product_media
SET url = CASE 
  -- 服饰类
  WHEN url LIKE '%spiral-tshirt%' THEN 'https://picsum.photos/seed/spiral-tshirt/800/1000'
  WHEN url LIKE '%accordion-shirt%' THEN 'https://picsum.photos/seed/accordion-shirt/800/1000'
  WHEN url LIKE '%silk-scarf%' THEN 'https://picsum.photos/seed/silk-scarf/800/800'
  WHEN url LIKE '%canvas-bag%' THEN 'https://picsum.photos/seed/canvas-bag/800/900'
  WHEN url LIKE '%bucket-hat%' THEN 'https://picsum.photos/seed/bucket-hat/800/800'
  
  -- 家居类
  WHEN url LIKE '%pillow-cover%' THEN 'https://picsum.photos/seed/pillow-cover/800/800'
  WHEN url LIKE '%wall-tapestry%' THEN 'https://picsum.photos/seed/wall-tapestry/800/1200'
  WHEN url LIKE '%table-runner%' THEN 'https://picsum.photos/seed/table-runner/800/600'
  WHEN url LIKE '%bedding-set%' THEN 'https://picsum.photos/seed/bedding-set/800/800'
  WHEN url LIKE '%tea-mat%' THEN 'https://picsum.photos/seed/tea-mat/800/800'
  
  -- 文创类
  WHEN url LIKE '%notebook%' THEN 'https://picsum.photos/seed/notebook/800/1000'
  WHEN url LIKE '%bookmark-set%' THEN 'https://picsum.photos/seed/bookmark-set/800/600'
  WHEN url LIKE '%pencil-case%' THEN 'https://picsum.photos/seed/pencil-case/800/600'
  
  -- 艺术装饰类
  WHEN url LIKE '%framed-art%' THEN 'https://picsum.photos/seed/framed-art/800/1000'
  WHEN url LIKE '%room-divider%' THEN 'https://picsum.photos/seed/room-divider/600/1200'
  
  -- 礼品类
  WHEN url LIKE '%tea-gift%' THEN 'https://picsum.photos/seed/tea-gift/800/800'
  WHEN url LIKE '%stationery-gift%' THEN 'https://picsum.photos/seed/stationery-gift/800/800'
  WHEN url LIKE '%home-gift%' THEN 'https://picsum.photos/seed/home-gift/800/800'
  
  -- 配件类
  WHEN url LIKE '%headband%' THEN 'https://picsum.photos/seed/headband/800/600'
  WHEN url LIKE '%mask-cover%' THEN 'https://picsum.photos/seed/mask-cover/800/800'
  
  ELSE url
END
WHERE url LIKE '/images/products/%';

-- 验证更新结果
SELECT 
  product_id,
  type,
  url,
  cover,
  position
FROM public.product_media
WHERE type = 'image'
ORDER BY product_id, position
LIMIT 30;

COMMIT;

-- ============================================
-- 执行后应该看到：
-- - 所有 /images/products/ 路径已替换为 https://picsum.photos
-- - 图片不再404
-- ============================================
