# Chat System Database Setup

## Prerequisites
- Supabase project set up
- Supabase CLI installed and configured

## Database Migration

### Option 1: Using Supabase CLI (Recommended)

1. **Run the migration** to create the chat tables:
   ```bash
   supabase db push
   ```

   Or if you prefer to run the migration manually:
   ```bash
   supabase migration up
   ```

### Option 2: Using Setup Scripts

**For Windows:**
```cmd
setup-chat-system.bat
```

**For Mac/Linux:**
```bash
chmod +x setup-chat-system.sh
./setup-chat-system.sh
```

### Option 3: Manual SQL Execution (If CLI fails)

If you encounter the "column chat_id does not exist" error:

1. **Go to your Supabase dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the contents of `setup-chat-tables.sql`**
4. **Click "Run" to execute the script**

## Verify the Setup

After running the migration, verify the tables were created by checking your Supabase dashboard:
- `profiles` table
- `chats` table  
- `messages` table
- `chat_members` table

## Enable Realtime

1. **Enable Realtime** for the chat tables in your Supabase dashboard:
   - Go to Database > Replication
   - Enable realtime for `messages` table
   - Enable realtime for `chat_members` table

## Row Level Security (RLS)

The migration automatically sets up RLS policies that:
- Allow users to view chats they are members of
- Allow users to send messages in chats they are members of
- Allow chat creators to manage their chats
- Allow users to update their own profiles

## Troubleshooting

### Error: "column chat_id does not exist"

This error occurs when the database tables haven't been created yet. Solutions:

1. **Run the migration using Supabase CLI:**
   ```bash
   supabase db push
   ```

2. **If CLI fails, use the SQL script:**
   - Copy the contents of `setup-chat-tables.sql`
   - Paste it in your Supabase SQL Editor
   - Execute the script

3. **Check for existing tables:**
   - Go to your Supabase dashboard > Database > Tables
   - If you see existing `profiles`, `chats`, `messages`, or `chat_members` tables
   - Drop them first or use the SQL script which handles this automatically

### Other Common Issues

1. **RLS Policy Errors:**
   - Check that all RLS policies were created successfully
   - Verify policies in Database > Authentication > Policies

2. **Realtime Not Working:**
   - Ensure realtime is enabled for `messages` and `chat_members` tables
   - Check Database > Replication settings

3. **Authentication Issues:**
   - Verify your Supabase client configuration in `src/lib/supabase.js`
   - Check that users are being created in the `auth.users` table

## Testing the Setup

1. **Create a test user** through your app's authentication
2. **Navigate to the team chat** section
3. **Create a new chat** and add members
4. **Send messages** to test real-time functionality

## Features Implemented

✅ **Database Schema**: Complete with profiles, chats, messages, and chat_members tables
✅ **Row Level Security**: Proper access control policies
✅ **Realtime Subscriptions**: Live message updates
✅ **Chat Management**: Create, delete, add/remove members
✅ **Message System**: Send and receive messages in real-time
✅ **User Interface**: Modern, responsive chat interface
✅ **Search Functionality**: Search through chats
✅ **Member Management**: Add/remove users from chats
✅ **Profile System**: User profiles with avatars and names

## Support

If you continue to experience issues:

1. **Check the browser console** for JavaScript errors
2. **Verify Supabase client configuration** in `src/lib/supabase.js`
3. **Ensure all dependencies are installed**: `npm install`
4. **Check that the ChatProvider is properly integrated** in `src/App.jsx`
