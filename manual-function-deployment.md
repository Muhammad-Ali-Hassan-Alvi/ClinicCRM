# Manual Edge Function Deployment

Since the Supabase CLI installation is taking time, here's how to manually deploy the function:

## Option 1: Deploy via Supabase Dashboard

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Go to Edge Functions**
   - Click on "Edge Functions" in the left sidebar
   - Click "Create a new function"

3. **Create the function**
   - Function name: `create-admin-user`
   - Copy the contents of `supabase/functions/create-admin-user/index.js`
   - Paste it into the function editor
   - Click "Deploy"

## Option 2: Use the Supabase CLI (when available)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Deploy the function
supabase functions deploy create-admin-user
```

## Option 3: Quick Fix - Update Function via Dashboard

1. **Go to your Supabase Dashboard**
2. **Navigate to Edge Functions**
3. **Find the `create-admin-user` function**
4. **Click "Edit"**
5. **Replace the content with the updated code from `supabase/functions/create-admin-user/index.js`**
6. **Click "Deploy"**

## Test the Function

After deployment, test it with:

```bash
curl -X POST https://auvpuouphxdkrajmnruo.supabase.co/functions/v1/create-admin-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [YOUR-ANON-KEY]" \
  -d '{"email":"test@example.com","password":"testpass123","name":"Admin","role":"Admin"}'
```

## Current Issue

The error "Email, password, name, and role are required" suggests the function is expecting all four fields. The updated function now accepts:
- `email` (required)
- `password` (required)  
- `name` (optional, defaults to "Admin")
- `role` (optional, defaults to "Admin")

The login page has been updated to send all four fields.
