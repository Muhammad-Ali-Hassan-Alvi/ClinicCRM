-- Update existing admin user with proper role
-- Run this in Supabase SQL Editor

-- Update the existing user profile to be an admin
UPDATE profiles 
SET 
  role = 'Admin',
  branch_ids = '{}'
WHERE id IN (
  SELECT id 
  FROM auth.users 
  WHERE email = 'admin@lamel.clinic'  -- Replace with your actual admin email
);

-- Verify the update
SELECT 
  p.id,
  p.name,
  p.role,
  p.branch_ids,
  u.email,
  u.created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'admin@lamel.clinic';  -- Replace with your actual admin email

-- Also check all profiles to see the current state
SELECT 
  p.id,
  p.name,
  p.role,
  p.branch_ids,
  u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY u.created_at DESC;
