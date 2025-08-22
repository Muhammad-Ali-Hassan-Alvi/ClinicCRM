-- Update existing admin user profile with proper role
-- Replace 'your-admin-email@example.com' with your actual admin email

UPDATE profiles 
SET 
  role = 'Admin',
  branch_ids = '{}'
WHERE id IN (
  SELECT id 
  FROM auth.users 
  WHERE email = 'your-admin-email@example.com'
);

-- Verify the update
SELECT 
  p.id,
  p.name,
  p.role,
  p.branch_ids,
  u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'your-admin-email@example.com';
