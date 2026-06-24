CREATE OR REPLACE FUNCTION public.ensure_user_shop()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO user_shops (user_id, shop_name)
    VALUES (NEW.user_id, (NEW.user_id::text || '的蓝染坊'))
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION
    WHEN undefined_table THEN
      NULL;
    WHEN others THEN
      NULL;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.on_auth_user_created_safe()
RETURNS TRIGGER AS $$
DECLARE
  has_profiles boolean;
  has_user_id_col boolean;
  has_player_profile boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
  ) INTO has_profiles;

  IF has_profiles THEN
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'user_id'
    ) INTO has_user_id_col;

    BEGIN
      IF has_user_id_col THEN
        INSERT INTO public.profiles (id, user_id, full_name, avatar_url)
        VALUES (
          NEW.id,
          NEW.id,
          NEW.raw_user_meta_data->>'full_name',
          NEW.raw_user_meta_data->>'avatar_url'
        )
        ON CONFLICT (id) DO NOTHING;
      ELSE
        INSERT INTO public.profiles (id, full_name, avatar_url)
        VALUES (
          NEW.id,
          NEW.raw_user_meta_data->>'full_name',
          NEW.raw_user_meta_data->>'avatar_url'
        )
        ON CONFLICT (id) DO NOTHING;
      END IF;
    EXCEPTION
      WHEN others THEN
        NULL;
    END;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'player_profile'
  ) INTO has_player_profile;

  IF has_player_profile THEN
    BEGIN
      INSERT INTO public.player_profile (user_id, dye_house_name)
      VALUES (NEW.id, '无名染坊')
      ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION
      WHEN others THEN
        NULL;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.on_auth_user_created_safe();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'player_profile'
  ) THEN
    DROP TRIGGER IF EXISTS trigger_create_shop_on_profile ON public.player_profile;
    CREATE TRIGGER trigger_create_shop_on_profile
      AFTER INSERT ON public.player_profile
      FOR EACH ROW
      EXECUTE FUNCTION public.ensure_user_shop();
  END IF;
END $$;
