-- Check current database schema
-- Run this in Supabase SQL Editor to see the current state

-- Check if profiles table exists and its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check if branches table exists
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'branches' 
ORDER BY ordinal_position;

-- Check current profiles data
SELECT 
  id,
  name,
  role,
  branch_ids,
  created_at
FROM profiles 
LIMIT 5;

-- Check current branches data
SELECT 
  id,
  name,
  address,
  created_at
FROM branches 
LIMIT 5;
