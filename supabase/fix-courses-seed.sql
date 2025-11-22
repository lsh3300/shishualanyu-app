-- 修复课程数据 - 确保所有课程ID存在
-- 在 Supabase SQL Editor 中执行此脚本

BEGIN;

-- 首先，添加缺失的字段（如果需要）
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_name TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT '入门';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS students INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 0.0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';

-- 如果 instructor_name 为空，从 instructor 复制数据
UPDATE courses SET instructor_name = instructor WHERE instructor_name IS NULL;

-- 如果 thumbnail 为空，从 image_url 复制数据
UPDATE courses SET thumbnail = image_url WHERE thumbnail IS NULL;

-- 插入或更新标准课程数据
-- 使用 ON CONFLICT 确保幂等性
INSERT INTO courses (
  id, 
  title, 
  description, 
  instructor, 
  instructor_name,
  duration, 
  price, 
  image_url,
  thumbnail, 
  category, 
  difficulty,
  is_free,
  students,
  rating,
  status,
  tags
) VALUES
-- 1. 传统扎染基础入门课程
('00000000-0000-0000-0000-000000000001', 
 '传统扎染基础入门课程', 
 '本课程将带您深入了解传统扎染工艺的精髓，从基础理论到实际操作，让您掌握这门古老而美丽的艺术。', 
 '李师傅',
 '李师傅',
 150, 
 0, 
 '/tie-dye-tutorial-hands-on.jpg',
 '/tie-dye-tutorial-hands-on.jpg',
 '扎染', 
 '入门',
 true,
 1250,
 4.8,
 'published',
 ARRAY['扎染', '入门', '传统工艺']
),

-- 2. 扎染进阶技法与创作
('00000000-0000-0000-0000-000000000002', 
 '扎染进阶技法与创作', 
 '深入学习扎染的高级技法，包括复杂图案设计、多色染色技术等，提升您的扎染创作水平。', 
 '王老师',
 '王老师',
 195, 
 168, 
 '/traditional-indigo-dyeing-workshop.jpg',
 '/traditional-indigo-dyeing-workshop.jpg',
 '扎染', 
 '进阶',
 false,
 856,
 4.7,
 'published',
 ARRAY['扎染', '进阶', '图案设计']
),

-- 3. 现代扎染艺术创作
('00000000-0000-0000-0000-000000000003', 
 '现代扎染艺术创作', 
 '探索扎染在现代设计中的应用，学习如何将传统工艺与现代审美相结合，创作具有个人风格的扎染作品。', 
 '张艺术家',
 '张艺术家',
 165, 
 198, 
 '/modern-indigo-dyeing-art.jpg',
 '/modern-indigo-dyeing-art.jpg',
 '扎染', 
 '进阶',
 false,
 623,
 4.9,
 'published',
 ARRAY['扎染', '现代设计', '艺术创作']
),

-- 4. 扎染工艺与商业应用
('00000000-0000-0000-0000-000000000004', 
 '扎染工艺与商业应用', 
 '了解扎染工艺的商业价值，学习如何将扎染产品推向市场，打造个人扎染品牌。', 
 '陈企业家',
 '陈企业家',
 105, 
 128, 
 '/modern-indigo-dyed-fashion-products.jpg',
 '/modern-indigo-dyed-fashion-products.jpg',
 '扎染', 
 '高级',
 false,
 345,
 4.6,
 'published',
 ARRAY['扎染', '商业', '品牌']
),

-- 5. 蜡染工艺基础入门
('00000000-0000-0000-0000-000000000005', 
 '蜡染工艺基础入门', 
 '学习苗族传统蜡染工艺，从蜡刀使用到图案设计，全面掌握这项非物质文化遗产技艺。', 
 '王老师',
 '王老师',
 195, 
 199, 
 '/wax-resist-dyeing-technique.jpg',
 '/wax-resist-dyeing-technique.jpg',
 '蜡染', 
 '入门',
 false,
 1089,
 4.8,
 'published',
 ARRAY['蜡染', '入门', '非遗']
),

-- 6. 传统苗族蜡染技法
('00000000-0000-0000-0000-000000000006', 
 '传统苗族蜡染技法', 
 '深入学习苗族传统蜡染技法，学习绘制传统图案，掌握这门古老艺术的精髓。', 
 '陈老师',
 '陈老师',
 240, 
 258, 
 '/traditional-wax-resist-cushion.jpg',
 '/traditional-wax-resist-cushion.jpg',
 '蜡染', 
 '进阶',
 false,
 734,
 4.9,
 'published',
 ARRAY['蜡染', '苗族', '传统技法']
),

-- 7. 蜡染纹样设计与应用
('00000000-0000-0000-0000-000000000007', 
 '蜡染纹样设计与应用', 
 '学习蜡染纹样设计原理，掌握传统纹样的现代应用，创作具有个人风格的蜡染作品。', 
 '张设计师',
 '张设计师',
 165, 
 178, 
 '/modern-indigo-dyeing-art.jpg',
 '/modern-indigo-dyeing-art.jpg',
 '蜡染', 
 '进阶',
 false,
 567,
 4.7,
 'published',
 ARRAY['蜡染', '纹样设计', '创作']
),

-- 8. 蜡染与扎染结合创作
('00000000-0000-0000-0000-000000000008', 
 '蜡染与扎染结合创作', 
 '学习如何将蜡染与扎染两种工艺相结合，创作更加丰富多样的蓝染艺术作品。', 
 '李师傅',
 '李师傅',
 210, 
 238, 
 '/modern-indigo-dyed-fashion-products.jpg',
 '/modern-indigo-dyed-fashion-products.jpg',
 '综合', 
 '高级',
 false,
 456,
 4.9,
 'published',
 ARRAY['蜡染', '扎染', '综合技法']
)

ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  instructor = EXCLUDED.instructor,
  instructor_name = EXCLUDED.instructor_name,
  duration = EXCLUDED.duration,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  thumbnail = EXCLUDED.thumbnail,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  is_free = EXCLUDED.is_free,
  students = EXCLUDED.students,
  rating = EXCLUDED.rating,
  status = EXCLUDED.status,
  tags = EXCLUDED.tags,
  updated_at = NOW();

COMMIT;

-- 验证数据
SELECT 
  id, 
  title, 
  instructor_name, 
  category, 
  difficulty, 
  is_free,
  students,
  status
FROM courses
ORDER BY id;
