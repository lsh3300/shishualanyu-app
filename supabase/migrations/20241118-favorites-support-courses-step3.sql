-- 步骤3：修改product_id约束（允许NULL）
ALTER TABLE favorites ALTER COLUMN product_id DROP NOT NULL;