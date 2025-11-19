-- 产品与媒体表结构（在 Supabase SQL Editor 中执行）
-- 1. products 表
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  image_url TEXT,
  category TEXT,
  inventory INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  is_new BOOLEAN DEFAULT false,
  discount INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 更新时间戳触发器
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. product_media 表
CREATE TABLE IF NOT EXISTS public.product_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  thumbnail TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  position INTEGER DEFAULT 0,
  cover BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_media_product_position
  ON public.product_media(product_id, position);

-- 3. 行级安全与策略（只允许已认证用户读取，写操作通过服务角色）
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products"
  ON public.products
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public read product media" ON public.product_media;
CREATE POLICY "Public read product media"
  ON public.product_media
  FOR SELECT
  USING (true);

-- 写操作策略可按需添加，目前仅允许 service_role (API route) 操作
DROP POLICY IF EXISTS "Service insert products" ON public.products;
CREATE POLICY "Service insert products"
  ON public.products
  FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service update products" ON public.products;
CREATE POLICY "Service update products"
  ON public.products
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service insert product media" ON public.product_media;
CREATE POLICY "Service insert product media"
  ON public.product_media
  FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service update product media" ON public.product_media;
CREATE POLICY "Service update product media"
  ON public.product_media
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service delete product media" ON public.product_media;
CREATE POLICY "Service delete product media"
  ON public.product_media
  FOR DELETE
  TO service_role
  USING (true);

-- 4. 示例插入（可按需调整）
INSERT INTO public.products (id, name, slug, description, price, original_price, category, inventory, is_new, discount, metadata)
VALUES
  ('11111111-1111-1111-1111-111111111111', '扎染T恤', 'tie-dye-tshirt', '传统扎染工艺制作的纯棉T恤，舒适透气，图案独特', 128.00, 168.00, '服饰', 120, true, 24, '{"colors":["靛蓝","墨蓝"],"sizes":["S","M","L","XL"]}'),
  ('22222222-2222-2222-2222-222222222222', '蜡染丝巾', 'wax-resist-scarf', '手工蜡染真丝丝巾，精美图案，优雅大方', 198.00, 258.00, '配饰', 80, true, 23, '{"colors":["湖蓝","暮紫"]}');

INSERT INTO public.product_media (product_id, type, url, thumbnail, position, cover)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'image', 'https://your-bucket-url/product-media/tshirt/cover.jpg', NULL, 0, true),
  ('11111111-1111-1111-1111-111111111111', 'image', 'https://your-bucket-url/product-media/tshirt/detail-1.jpg', NULL, 1, false),
  ('22222222-2222-2222-2222-222222222222', 'image', 'https://your-bucket-url/product-media/scarf/cover.jpg', NULL, 0, true);

