-- 蓝染文创产品数据
-- 在 Supabase SQL Editor 中执行此脚本添加产品

-- 插入蓝染文创产品
INSERT INTO public.products (id, name, slug, description, price, original_price, category, inventory, is_new, discount, metadata)
VALUES
  -- 服饰类
  ('a1111111-1111-1111-1111-111111111111', '螺旋扎染T恤', 'spiral-tie-dye-tshirt', '采用经典螺旋扎染技法，100%纯棉材质，图案独特永不重复。每一件都是手工艺术品。', 158.00, 198.00, '服饰', 50, true, 20, '{"colors":["靛蓝","深蓝","浅蓝"],"sizes":["S","M","L","XL","XXL"],"material":"100%纯棉","weight":"200g"}'),
  
  ('a2222222-2222-2222-2222-222222222222', '手风琴染条纹衬衫', 'accordion-dye-shirt', '运用手风琴折叠技法，呈现规律条纹图案，适合商务休闲场合。', 228.00, 298.00, '服饰', 40, true, 23, '{"colors":["靛蓝条纹","海军蓝条纹"],"sizes":["S","M","L","XL","XXL"],"material":"棉麻混纺","weight":"220g"}'),
  
  ('a3333333-3333-3333-3333-333333333333', '蜡染真丝丝巾', 'wax-dye-silk-scarf', '传统蜡染工艺，真丝材质，轻盈飘逸。精致的几何图案展现东方美学。', 268.00, 358.00, '配饰', 60, true, 25, '{"colors":["靛蓝","暮紫蓝","月白蓝"],"size":"90x90cm","material":"100%真丝","weight":"50g"}'),
  
  ('a4444444-4444-4444-4444-444444444444', '扎染帆布包', 'tie-dye-canvas-bag', '环保帆布材质，大容量设计。独特的扎染图案让你在人群中脱颖而出。', 128.00, 168.00, '配饰', 80, false, 24, '{"colors":["靛蓝","混合蓝"],"size":"40x35x10cm","material":"12安帆布","capacity":"15L"}'),
  
  ('a5555555-5555-5555-5555-555555555555', '蓝染渔夫帽', 'indigo-bucket-hat', '夏日必备单品，手工蓝染工艺，每一顶都独一无二。透气舒适，防晒时尚。', 88.00, 118.00, '配饰', 100, true, 25, '{"colors":["浅靛蓝","深靛蓝"],"sizes":["均码"],"material":"纯棉","weight":"80g"}'),
  
  -- 家居类
  ('b1111111-1111-1111-1111-111111111111', '蓝染抱枕套', 'indigo-pillow-cover', '为家居增添艺术气息，精美的扎染图案与现代简约风格完美融合。', 78.00, 98.00, '家居', 120, false, 20, '{"colors":["靛蓝","暮蓝"],"sizes":["45x45cm","50x50cm"],"material":"纯棉","includes":"不含枕芯"}'),
  
  ('b2222222-2222-2222-2222-222222222222', '扎染艺术壁挂', 'tie-dye-wall-tapestry', '大型艺术壁挂，采用传统扎染工艺。适合客厅、卧室或工作室装饰。', 388.00, 488.00, '家居', 30, true, 20, '{"colors":["靛蓝渐变"],"size":"150x100cm","material":"纯棉布","includes":"含挂杆"}'),
  
  ('b3333333-3333-3333-3333-333333333333', '蓝染桌旗', 'indigo-table-runner', '为餐桌增添雅致氛围，传统蓝染工艺与现代设计的完美结合。', 138.00, 178.00, '家居', 70, false, 22, '{"colors":["靛蓝","月白蓝"],"sizes":["30x180cm","30x220cm"],"material":"棉麻混纺","weight":"200g"}'),
  
  ('b4444444-4444-4444-4444-444444444444', '扎染床品四件套', 'tie-dye-bedding-set', '将艺术带入睡眠空间，柔软舒适的纯棉材质，独特的扎染图案。', 588.00, 788.00, '家居', 40, true, 25, '{"colors":["靛蓝梦境","星空蓝"],"sizes":["1.5m床","1.8m床"],"material":"60支长绒棉","includes":"被套、床单、枕套x2"}'),
  
  ('b5555555-5555-5555-5555-555555555555', '蓝染茶席', 'indigo-tea-mat', '禅意茶席，传统蓝染工艺。为茶道增添一份宁静与雅致。', 158.00, 198.00, '家居', 50, false, 20, '{"colors":["深靛蓝","浅靛蓝"],"size":"30x40cm","material":"亚麻","weight":"150g"}'),
  
  -- 文具类
  ('c1111111-1111-1111-1111-111111111111', '蓝染笔记本', 'indigo-notebook', '手工装帧笔记本，蓝染布面封面。记录你的创意与灵感。', 68.00, 88.00, '文具', 150, true, 23, '{"colors":["靛蓝","月白蓝"],"size":"A5","pages":"192页","paper":"道林纸"}'),
  
  ('c2222222-2222-2222-2222-222222222222', '蓝染书签套装', 'indigo-bookmark-set', '精致书签套装，每一枚都是独特的艺术品。送礼自用两相宜。', 38.00, 48.00, '文具', 200, false, 21, '{"colors":["混合蓝色系"],"quantity":"5枚/套","material":"纯棉布","size":"5x15cm"}'),
  
  ('c3333333-3333-3333-3333-333333333333', '蓝染笔袋', 'indigo-pencil-case', '简约实用的笔袋，蓝染工艺赋予其独特个性。学生办公皆宜。', 48.00, 58.00, '文具', 180, false, 17, '{"colors":["靛蓝","深蓝"],"size":"20x8x5cm","material":"帆布","closure":"拉链"}'),
  
  -- 艺术品类
  ('d1111111-1111-1111-1111-111111111111', '蓝染装饰画（有框）', 'indigo-framed-art', '专业装裱的蓝染艺术作品，为空间增添艺术气息。限量手工制作。', 688.00, 888.00, '艺术品', 20, true, 22, '{"colors":["靛蓝抽象"],"sizes":["40x60cm","50x70cm"],"material":"纯棉布+实木框","includes":"含框+玻璃"}'),
  
  ('d2222222-2222-2222-2222-222222222222', '蓝染屏风', 'indigo-room-divider', '三折屏风，传统蓝染工艺。既是隔断又是艺术品。', 1888.00, 2388.00, '艺术品', 10, true, 21, '{"colors":["靛蓝山水"],"size":"180x120cm(每扇40cm)","material":"纯棉布+实木框","folds":"3折"}'),
  
  -- 礼品套装类
  ('e1111111-1111-1111-1111-111111111111', '蓝染茶具礼盒', 'indigo-tea-gift-set', '精致茶具套装，包含茶席、杯垫、茶巾。送礼佳品。', 298.00, 388.00, '礼品', 60, true, 23, '{"colors":["靛蓝禅意"],"includes":"茶席x1+杯垫x6+茶巾x2","material":"亚麻+纯棉","package":"礼盒包装"}'),
  
  ('e2222222-2222-2222-2222-222222222222', '蓝染文具礼盒', 'indigo-stationery-gift', '文具爱好者的理想礼物，包含笔记本、书签、笔袋。', 168.00, 218.00, '礼品', 80, true, 23, '{"colors":["混合蓝色系"],"includes":"笔记本x1+书签x5+笔袋x1","package":"精美礼盒"}'),
  
  ('e3333333-3333-3333-3333-333333333333', '蓝染家居礼盒', 'indigo-home-gift-set', '温馨家居套装，为新居添置美好。包含抱枕套、桌旗、茶席。', 388.00, 488.00, '礼品', 40, true, 20, '{"colors":["靛蓝雅致"],"includes":"抱枕套x2+桌旗x1+茶席x1","material":"纯棉+棉麻","package":"礼盒包装"}'),
  
  -- 配件类
  ('f1111111-1111-1111-1111-111111111111', '蓝染发带', 'indigo-headband', '清新文艺的发带，多种佩戴方式。为造型增添亮点。', 28.00, 38.00, '配饰', 200, false, 26, '{"colors":["靛蓝","浅蓝"],"size":"长约50cm宽约5cm","material":"纯棉","elastic":"弹性款"}'),
  
  ('f2222222-2222-2222-2222-222222222222', '蓝染口罩套', 'indigo-mask-cover', '时尚环保的口罩套，可清洗重复使用。', 18.00, 28.00, '配饰', 300, false, 36, '{"colors":["靛蓝","深蓝"],"size":"成人通用","material":"纯棉双层","washable":"可机洗"}')
ON CONFLICT (id) DO NOTHING;

-- 插入产品图片（使用占位图）
INSERT INTO public.product_media (product_id, type, url, thumbnail, position, cover)
VALUES
  -- 螺旋扎染T恤
  ('a1111111-1111-1111-1111-111111111111', 'image', '/images/products/spiral-tshirt-1.jpg', NULL, 0, true),
  ('a1111111-1111-1111-1111-111111111111', 'image', '/images/products/spiral-tshirt-2.jpg', NULL, 1, false),
  ('a1111111-1111-1111-1111-111111111111', 'image', '/images/products/spiral-tshirt-3.jpg', NULL, 2, false),
  
  -- 手风琴染条纹衬衫
  ('a2222222-2222-2222-2222-222222222222', 'image', '/images/products/accordion-shirt-1.jpg', NULL, 0, true),
  ('a2222222-2222-2222-2222-222222222222', 'image', '/images/products/accordion-shirt-2.jpg', NULL, 1, false),
  
  -- 蜡染真丝丝巾
  ('a3333333-3333-3333-3333-333333333333', 'image', '/images/products/silk-scarf-1.jpg', NULL, 0, true),
  ('a3333333-3333-3333-3333-333333333333', 'image', '/images/products/silk-scarf-2.jpg', NULL, 1, false),
  
  -- 扎染帆布包
  ('a4444444-4444-4444-4444-444444444444', 'image', '/images/products/canvas-bag-1.jpg', NULL, 0, true),
  ('a4444444-4444-4444-4444-444444444444', 'image', '/images/products/canvas-bag-2.jpg', NULL, 1, false),
  
  -- 蓝染渔夫帽
  ('a5555555-5555-5555-5555-555555555555', 'image', '/images/products/bucket-hat-1.jpg', NULL, 0, true),
  
  -- 蓝染抱枕套
  ('b1111111-1111-1111-1111-111111111111', 'image', '/images/products/pillow-cover-1.jpg', NULL, 0, true),
  ('b1111111-1111-1111-1111-111111111111', 'image', '/images/products/pillow-cover-2.jpg', NULL, 1, false),
  
  -- 扎染艺术壁挂
  ('b2222222-2222-2222-2222-222222222222', 'image', '/images/products/wall-tapestry-1.jpg', NULL, 0, true),
  ('b2222222-2222-2222-2222-222222222222', 'image', '/images/products/wall-tapestry-2.jpg', NULL, 1, false),
  
  -- 蓝染桌旗
  ('b3333333-3333-3333-3333-333333333333', 'image', '/images/products/table-runner-1.jpg', NULL, 0, true),
  
  -- 扎染床品四件套
  ('b4444444-4444-4444-4444-444444444444', 'image', '/images/products/bedding-set-1.jpg', NULL, 0, true),
  ('b4444444-4444-4444-4444-444444444444', 'image', '/images/products/bedding-set-2.jpg', NULL, 1, false),
  ('b4444444-4444-4444-4444-444444444444', 'image', '/images/products/bedding-set-3.jpg', NULL, 2, false),
  
  -- 蓝染茶席
  ('b5555555-5555-5555-5555-555555555555', 'image', '/images/products/tea-mat-1.jpg', NULL, 0, true),
  
  -- 蓝染笔记本
  ('c1111111-1111-1111-1111-111111111111', 'image', '/images/products/notebook-1.jpg', NULL, 0, true),
  ('c1111111-1111-1111-1111-111111111111', 'image', '/images/products/notebook-2.jpg', NULL, 1, false),
  
  -- 蓝染书签套装
  ('c2222222-2222-2222-2222-222222222222', 'image', '/images/products/bookmark-set-1.jpg', NULL, 0, true),
  
  -- 蓝染笔袋
  ('c3333333-3333-3333-3333-333333333333', 'image', '/images/products/pencil-case-1.jpg', NULL, 0, true),
  
  -- 蓝染装饰画
  ('d1111111-1111-1111-1111-111111111111', 'image', '/images/products/framed-art-1.jpg', NULL, 0, true),
  ('d1111111-1111-1111-1111-111111111111', 'image', '/images/products/framed-art-2.jpg', NULL, 1, false),
  
  -- 蓝染屏风
  ('d2222222-2222-2222-2222-222222222222', 'image', '/images/products/room-divider-1.jpg', NULL, 0, true),
  
  -- 礼品套装
  ('e1111111-1111-1111-1111-111111111111', 'image', '/images/products/tea-gift-1.jpg', NULL, 0, true),
  ('e2222222-2222-2222-2222-222222222222', 'image', '/images/products/stationery-gift-1.jpg', NULL, 0, true),
  ('e3333333-3333-3333-3333-333333333333', 'image', '/images/products/home-gift-1.jpg', NULL, 0, true),
  
  -- 配件
  ('f1111111-1111-1111-1111-111111111111', 'image', '/images/products/headband-1.jpg', NULL, 0, true),
  ('f2222222-2222-2222-2222-222222222222', 'image', '/images/products/mask-cover-1.jpg', NULL, 0, true)
ON CONFLICT DO NOTHING;
