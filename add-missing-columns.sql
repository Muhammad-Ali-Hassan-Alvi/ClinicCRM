-- Add missing columns to existing profiles table
-- Run this in Supabase SQL Editor

-- Add role column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'User';
        RAISE NOTICE 'Added role column to profiles table';
    ELSE
        RAISE NOTICE 'Role column already exists';
    END IF;
END $$;

-- Add branch_ids column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'branch_ids') THEN
        ALTER TABLE profiles ADD COLUMN branch_ids TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added branch_ids column to profiles table';
    ELSE
        RAISE NOTICE 'Branch_ids column already exists';
    END IF;
END $$;

-- Update the handle_new_user function to include the new columns
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url, role, branch_ids)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'User'),
    COALESCE(
      CASE 
        WHEN NEW.raw_user_meta_data->>'branch_ids' IS NOT NULL 
        THEN string_to_array(NEW.raw_user_meta_data->>'branch_ids', ',')
        ELSE '{}'::TEXT[]
      END,
      '{}'::TEXT[]
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing profile records to have a default role if they don't have one
UPDATE profiles 
SET role = 'User' 
WHERE role IS NULL;

-- Check the updated table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
