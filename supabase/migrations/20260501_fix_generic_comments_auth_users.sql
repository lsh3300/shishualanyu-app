-- 1. Ensure profiles can map back to auth.users consistently.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_id UUID;

UPDATE public.profiles
SET user_id = id
WHERE user_id IS NULL
  AND id IS NOT NULL;

INSERT INTO public.profiles (id, user_id, full_name, avatar_url)
SELECT u.id, u.id, NULL, NULL
FROM auth.users u
LEFT JOIN public.profiles p
  ON p.id = u.id OR p.user_id = u.id
WHERE p.id IS NULL
  AND p.user_id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 2. Remap legacy interaction rows from profiles.id to auth.users.id when needed.
UPDATE public.likes l
SET user_id = p.user_id
FROM public.profiles p
WHERE l.user_id = p.id
  AND p.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = l.user_id
  );

UPDATE public.comments c
SET user_id = p.user_id
FROM public.profiles p
WHERE c.user_id = p.id
  AND p.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = c.user_id
  );

UPDATE public.comment_likes cl
SET user_id = p.user_id
FROM public.profiles p
WHERE cl.user_id = p.id
  AND p.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = cl.user_id
  );

-- 3. Replace legacy foreign keys that pointed at profiles(id).
DO $$
DECLARE
  fk_record RECORD;
BEGIN
  FOR fk_record IN
    SELECT tc.table_name, tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
      AND tc.table_schema = ccu.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'user_id'
      AND tc.table_name IN ('likes', 'comments', 'comment_likes')
      AND ccu.table_name = 'profiles'
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I',
      fk_record.table_name,
      fk_record.constraint_name
    );
  END LOOP;
END $$;

ALTER TABLE public.likes
  DROP CONSTRAINT IF EXISTS likes_user_id_fkey;

ALTER TABLE public.likes
  ADD CONSTRAINT likes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.comments
  DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

ALTER TABLE public.comments
  ADD CONSTRAINT comments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.comment_likes
  DROP CONSTRAINT IF EXISTS comment_likes_user_id_fkey;

ALTER TABLE public.comment_likes
  ADD CONSTRAINT comment_likes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
