-- Seed canonical course records to match front-end mock IDs
BEGIN;

INSERT INTO courses (id, title, description, instructor, duration, price, image_url, category)
VALUES
  ('00000000-0000-0000-0000-000000000001', '传统扎染基础入门课程', $$本课程将带您深入了解传统扎染工艺的精髓，从基础理论到实际操作，让您掌握这门古老而美丽的艺术。$$, '李师傅', 150, 0, '/tie-dye-tutorial-hands-on.jpg', '扎染'),
  ('00000000-0000-0000-0000-000000000002', '扎染进阶技法与创作', $$深入学习扎染的高级技法，包括复杂图案设计、多色染色技术等，提升您的扎染创作水平。$$, '王老师', 195, 168, '/traditional-indigo-dyeing-workshop.jpg', '扎染'),
  ('00000000-0000-0000-0000-000000000003', '现代扎染艺术创作', $$探索扎染在现代设计中的应用，学习如何将传统工艺与现代审美相结合，创作具有个人风格的扎染作品。$$, '张艺术家', 165, 198, '/modern-indigo-dyeing-art.jpg', '扎染'),
  ('00000000-0000-0000-0000-000000000004', '扎染工艺与商业应用', $$了解扎染工艺的商业价值，学习如何将扎染产品推向市场，打造个人扎染品牌。$$, '陈企业家', 105, 128, '/modern-indigo-dyed-fashion-products.jpg', '扎染'),
  ('00000000-0000-0000-0000-000000000005', '蜡染工艺基础入门', $$学习苗族传统蜡染工艺，从蜡刀使用到图案设计，全面掌握这项非物质文化遗产技艺。$$, '王老师', 195, 199, '/wax-resist-dyeing-technique.jpg', '蜡染'),
  ('00000000-0000-0000-0000-000000000006', '传统苗族蜡染技法', $$深入学习苗族传统蜡染技法，学习绘制传统图案，掌握这门古老艺术的精髓。$$, '陈老师', 240, 258, '/traditional-wax-resist-cushion.jpg', '蜡染'),
  ('00000000-0000-0000-0000-000000000007', '蜡染纹样设计与应用', $$学习蜡染纹样设计原理，掌握传统纹样的现代应用，创作具有个人风格的蜡染作品。$$, '张设计师', 165, 178, '/modern-indigo-dyeing-art.jpg', '蜡染'),
  ('00000000-0000-0000-0000-000000000008', '蜡染与扎染结合创作', $$学习如何将蜡染与扎染两种工艺相结合，创作更加丰富多样的蓝染艺术作品。$$, '李师傅', 210, 238, '/modern-indigo-dyed-fashion-products.jpg', '综合')
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  instructor = EXCLUDED.instructor,
  duration = EXCLUDED.duration,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  category = EXCLUDED.category;

COMMIT;

