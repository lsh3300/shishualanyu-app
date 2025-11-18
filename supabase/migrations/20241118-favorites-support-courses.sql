-- Migration: Extend favorites table to support courses
-- Run via Supabase CLI or Supabase SQL editor

BEGIN;

-- 1. Ensure columns exist
ALTER TABLE favorites
  ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'product' CHECK (item_type IN ('product', 'course'));

CREATE INDEX IF NOT EXISTS idx_favorites_item_type ON favorites(item_type);

ALTER TABLE favorites
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_favorites_course_id ON favorites(course_id);

-- 2. Allow NULL product_id for course favorites
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'favorites'
      AND column_name = 'product_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_product_id_key;
    ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_product_id_fkey;
    ALTER TABLE favorites ALTER COLUMN product_id DROP NOT NULL;
    ALTER TABLE favorites
      ADD CONSTRAINT favorites_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Check constraint to ensure product/course exclusivity
ALTER TABLE favorites
  ADD CONSTRAINT IF NOT EXISTS favorites_product_or_course_check
  CHECK (
    (product_id IS NOT NULL AND course_id IS NULL AND item_type = 'product')
    OR
    (product_id IS NULL AND course_id IS NOT NULL AND item_type = 'course')
  );

-- 4. Partial unique indexes for user favorites
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_product_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_user_product_unique
  ON favorites(user_id, product_id)
  WHERE product_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_user_course_unique
  ON favorites(user_id, course_id)
  WHERE course_id IS NOT NULL;

-- 5. Supplemental index for combined queries
CREATE INDEX IF NOT EXISTS idx_favorites_user_itemtype
  ON favorites(user_id, item_type);

COMMIT;

