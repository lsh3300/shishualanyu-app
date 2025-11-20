-- 世说蓝语应用数据库表结构
-- 此脚本应在Supabase SQL编辑器中执行

-- 1. 用户配置文件表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 产品表
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  images TEXT[] DEFAULT '{}',
  videos JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 订单表
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 订单项表
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 课程表
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE,
  instructor TEXT NOT NULL,
  duration INTEGER NOT NULL, -- 分钟
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 确保旧表具备新增字段
ALTER TABLE courses ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category TEXT;

-- 确保 slug 字段有唯一约束（如果不存在）
DROP INDEX IF EXISTS courses_slug_key;
CREATE UNIQUE INDEX courses_slug_key ON courses(slug) WHERE slug IS NOT NULL;

-- 6. 课程注册表
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- 6. 购物车表
-- 存储用户的购物车商品
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  color TEXT, -- 可选：商品颜色
  size TEXT, -- 可选：商品尺寸
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为购物车表添加更新时间戳触发器
DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at 
  BEFORE UPDATE ON cart_items 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
CREATE POLICY "Users can view own cart items" 
  ON cart_items FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
CREATE POLICY "Users can insert own cart items" 
  ON cart_items FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
CREATE POLICY "Users can update own cart items" 
  ON cart_items FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;
CREATE POLICY "Users can delete own cart items" 
  ON cart_items FOR DELETE 
  USING (auth.uid() = user_id);

-- 为购物车商品、颜色、尺寸创建唯一索引
DROP INDEX IF EXISTS cart_items_user_product_variant_key;
CREATE UNIQUE INDEX cart_items_user_product_variant_key
ON cart_items (user_id, product_id, COALESCE(color, ''), COALESCE(size, ''));

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_product ON cart_items(user_id, product_id);

-- 创建收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 11. 文化文章表（用于搜索与文化详情页面）
CREATE TABLE IF NOT EXISTS culture_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  read_time INTEGER DEFAULT 5,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'published',
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE culture_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read culture articles" ON culture_articles;
CREATE POLICY "Public read culture articles"
  ON culture_articles
  FOR SELECT
  USING (status = 'published');

-- 8. 用户地址表
CREATE TABLE IF NOT EXISTS addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 消息表
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users NOT NULL,
  receiver_id UUID REFERENCES auth.users,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. 通知表
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加更新时间戳触发器
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_enrollments_updated_at ON enrollments;
CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_culture_articles_updated_at ON culture_articles;
CREATE TRIGGER update_culture_articles_updated_at BEFORE UPDATE ON culture_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建用户注册后的配置文件
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 在用户注册后自动创建配置文件
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 示例文化文章插入（确保至少有可供搜索的数据）
INSERT INTO culture_articles (slug, title, excerpt, content, cover_image, read_time, tags, author, status)
VALUES
  ('indigo-history', '蓝染的历史渊源', '从丝绸之路到现代时尚，蓝染工艺承载着深厚的文化底蕴。', $$蓝染起源于古代的蓼蓝植物染色技术...

蓝染在中国民间广泛流传，不同地域形成了独特的纹样与技法，体现了人们对自然的崇敬与生活的智慧。
$$, '/ancient-indigo-dyeing-history-silk-road.jpg', 6, ARRAY['文化','历史','蓝染'], '世说蓝语文化研究组', 'published'),
  ('indigo-modern-life', '蓝染在现代生活中的应用', '传统工艺在现代设计与生活方式中的再诠释。', $$随着可持续生活方式的兴起，蓝染凭借天然染料、手工质感与独特纹样再次受到欢迎。

设计师们将蓝染与现代家居、服装、艺术装置结合，呈现出新的审美体验。$$, '/modern-indigo-dyeing-art.jpg', 5, ARRAY['设计','生活美学'], '世说蓝语文化研究组', 'published')
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  cover_image = EXCLUDED.cover_image,
  read_time = EXCLUDED.read_time,
  tags = EXCLUDED.tags,
  author = EXCLUDED.author,
  status = EXCLUDED.status;

-- 统一搜索函数，聚合商品 / 课程 / 文章
CREATE OR REPLACE FUNCTION public.search_content(
  query text DEFAULT NULL,
  filter_types text[] DEFAULT ARRAY[]::text[],
  limit_count integer DEFAULT 20,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  entity_type text,
  entity_id uuid,
  slug text,
  title text,
  summary text,
  cover_image text,
  price numeric,
  tags text[],
  updated_at timestamptz,
  score real
) AS $$
WITH normalized_types AS (
  SELECT ARRAY(
    SELECT DISTINCT LOWER(TRIM(t))
    FROM unnest(filter_types) AS t
    WHERE COALESCE(TRIM(t), '') <> ''
  ) AS types
),
ts_query AS (
  SELECT CASE
    WHEN query IS NULL OR btrim(query) = '' THEN NULL
    ELSE plainto_tsquery('simple', query)
  END AS value
),
base AS (
  SELECT
    'product'::text AS entity_type,
    p.id AS entity_id,
    COALESCE(p.slug, p.id::text) AS slug,
    p.name AS title,
    p.description AS summary,
    COALESCE(pm.url, p.image_url, '/placeholder.svg') AS cover_image,
    p.price::numeric AS price,
    ARRAY_REMOVE(ARRAY[p.category], NULL) AS tags,
    p.updated_at,
    setweight(to_tsvector('simple', COALESCE(p.name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(p.description, '')), 'B') AS document
  FROM products p
  LEFT JOIN LATERAL (
    SELECT url
    FROM product_media
    WHERE product_id = p.id
      AND type = 'image'
    ORDER BY cover DESC NULLS LAST, position ASC NULLS LAST
    LIMIT 1
  ) pm ON TRUE

  UNION ALL

  SELECT
    'course'::text AS entity_type,
    c.id AS entity_id,
    COALESCE(c.slug, c.id::text) AS slug,
    c.title AS title,
    c.description AS summary,
    COALESCE(c.image_url, '/placeholder.svg') AS cover_image,
    c.price::numeric AS price,
    CASE 
      WHEN c.tags IS NOT NULL AND array_length(c.tags, 1) > 0 THEN c.tags
      WHEN c.category IS NOT NULL THEN ARRAY[c.category]
      ELSE ARRAY[]::text[]
    END AS tags,
    c.updated_at,
    setweight(to_tsvector('simple', COALESCE(c.title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(c.description, '')), 'B') AS document
  FROM courses c

  UNION ALL

  SELECT
    'article'::text AS entity_type,
    a.id AS entity_id,
    COALESCE(a.slug, a.id::text) AS slug,
    a.title AS title,
    COALESCE(a.excerpt, LEFT(a.content, 200)) AS summary,
    COALESCE(a.cover_image, '/placeholder.svg') AS cover_image,
    NULL::numeric AS price,
    a.tags AS tags,
    a.updated_at,
    setweight(to_tsvector('simple', COALESCE(a.title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(a.excerpt, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(a.content, '')), 'C') AS document
  FROM culture_articles a
  WHERE a.status = 'published'
)
SELECT
  b.entity_type,
  b.entity_id,
  b.slug,
  b.title,
  b.summary,
  b.cover_image,
  b.price,
  COALESCE(b.tags, ARRAY[]::text[]) AS tags,
  b.updated_at,
  CASE
    WHEN ts.value IS NULL THEN 0
    ELSE ts_rank_cd(b.document, ts.value)
  END AS score
FROM base b
CROSS JOIN ts_query ts
LEFT JOIN normalized_types nt ON TRUE
WHERE (ts.value IS NULL OR b.document @@ ts.value)
  AND (
    nt.types IS NULL
    OR array_length(nt.types, 1) IS NULL
    OR b.entity_type = ANY(nt.types)
  )
ORDER BY
  CASE WHEN ts.value IS NULL THEN 1 ELSE 0 END,
  score DESC NULLS LAST,
  b.updated_at DESC
LIMIT GREATEST(limit_count, 1)
OFFSET GREATEST(offset_count, 0);
$$ LANGUAGE sql STABLE;