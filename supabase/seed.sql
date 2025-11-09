-- 世说蓝语应用示例数据
-- 此脚本应在supabase/schemas.sql和supabase/policies.sql执行后运行

-- 插入示例产品数据
INSERT INTO products (name, description, price, category, image_url, in_stock) VALUES
('蓝染帆布袋', '采用传统蓝染工艺制作的帆布袋，环保耐用，适合日常使用', 89.00, 'accessories', '/images/styles/indigo-dyed-canvas-bag.jpg', true),
('蓝染亚麻茶席', '天然亚麻材质，蓝染工艺制作，适合茶道爱好者使用', 128.00, 'home', '/images/styles/indigo-dyed-linen-tea-mat.jpg', true),
('现代蓝染艺术画', '融合传统与现代的蓝染艺术作品，适合家居装饰', 299.00, 'art', '/images/styles/modern-indigo-dyeing-art.jpg', true),
('扎染体验套装', '包含扎染所需全部材料和工具，适合初学者体验', 158.00, 'materials', '/images/styles/tie-dye-tutorial-hands-on.jpg', true),
('蜡染工艺布料', '采用传统蜡染工艺制作的布料，可自行裁剪制作各种物品', 198.00, 'materials', '/images/styles/wax-resist-dyeing-fabric.jpg', true);

-- 插入示例课程数据
INSERT INTO courses (title, description, instructor, duration, price, image_url, category) VALUES
('传统蓝染入门', '学习传统蓝染的基本原理和操作方法，适合初学者', '张师傅', 120, 199.00, '/images/styles/indigo-dyeing-workshop.jpg', 'tie-dye'),
('现代扎染艺术', '探索现代扎染技术与传统工艺的结合，创作个性化作品', '李老师', 180, 299.00, '/images/styles/modern-tie-dye-art.jpg', 'tie-dye'),
('蜡染工艺进阶', '深入学习蜡染的高级技巧和复杂图案设计', '王老师', 240, 399.00, '/images/styles/wax-resist-dyeing-advanced.jpg', 'wax-resist'),
('蓝染家居用品制作', '学习如何制作蓝染家居用品，如窗帘、桌布等', '陈师傅', 150, 249.00, '/images/styles/indigo-dyeing-home-decor.jpg', 'home');

-- 创建示例通知
INSERT INTO notifications (user_id, title, content, type, is_read) VALUES
('00000000-0000-0000-0000-000000000000', '欢迎加入世说蓝语', '欢迎您加入我们的蓝染工艺社区，探索传统与现代的完美结合', 'success', false),
('00000000-0000-0000-0000-000000000000', '新课程上线', '《现代扎染艺术》课程现已上线，快来探索扎染的无限可能', 'info', false),
('00000000-0000-0000-0000-000000000000', '限时优惠', '本周所有蓝染材料享受8折优惠，不要错过', 'warning', false);