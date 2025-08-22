# Deploy Supabase Edge Functions

## Prerequisites
- Supabase CLI installed: `npm install -g supabase`
- Logged into Supabase: `supabase login`

## Deploy Functions

1. **Deploy all functions:**
   ```bash
   supabase functions deploy
   ```

2. **Deploy specific function:**
   ```bash
   supabase functions deploy create-admin-user
   ```

3. **Check function status:**
   ```bash
   supabase functions list
   ```

## Verify Function Deployment

1. **Check function logs:**
   ```bash
   supabase functions logs create-admin-user
   ```

2. **Test function locally:**
   ```bash
   supabase functions serve create-admin-user
   ```

## Troubleshooting

### Function Not Found
If you get a 404 error:
1. Make sure the function is deployed: `supabase functions deploy create-admin-user`
2. Check the function name matches exactly
3. Verify you're using the correct Supabase project

### CORS Issues
If you get CORS errors:
1. Check the `cors.ts` file in the function directory
2. Make sure the function is deployed with the latest CORS settings

### Authentication Issues
If you get auth errors:
1. Make sure your Supabase client is properly configured
2. Check that you're using the correct API keys

## Function URL
After deployment, your function will be available at:
```
https://[YOUR-PROJECT-REF].supabase.co/functions/v1/create-admin-user
```

## Testing the Function

You can test the function using curl:
```bash
curl -X POST https://[YOUR-PROJECT-REF].supabase.co/functions/v1/create-admin-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [YOUR-ANON-KEY]" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```
