-- Simple fix for all chat issues
-- Run this in Supabase SQL Editor

-- Step 1: Drop ALL existing policies (comprehensive list)
-- For chats table
DROP POLICY IF EXISTS "Users can view chats they are members of" ON chats;
DROP POLICY IF EXISTS "Users can create chats" ON chats;
DROP POLICY IF EXISTS "Users can update chats they are members of" ON chats;
DROP POLICY IF EXISTS "Users can delete chats they are members of" ON chats;
DROP POLICY IF EXISTS "Users can view all chats" ON chats;
DROP POLICY IF EXISTS "Users can update chats" ON chats;
DROP POLICY IF EXISTS "Users can delete chats" ON chats;
DROP POLICY IF EXISTS "chats_select_policy" ON chats;
DROP POLICY IF EXISTS "chats_insert_policy" ON chats;
DROP POLICY IF EXISTS "chats_update_policy" ON chats;
DROP POLICY IF EXISTS "chats_delete_policy" ON chats;
DROP POLICY IF EXISTS "Enable read access for all users" ON chats;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON chats;
DROP POLICY IF EXISTS "Enable update for users based on email" ON chats;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON chats;
DROP POLICY IF EXISTS "Users can view their own chats" ON chats;
DROP POLICY IF EXISTS "Users can view chats they created" ON chats;

-- For chat_members table
DROP POLICY IF EXISTS "Users can view chat members" ON chat_members;
DROP POLICY IF EXISTS "Users can add themselves to chats" ON chat_members;
DROP POLICY IF EXISTS "Users can remove themselves from chats" ON chat_members;
DROP POLICY IF EXISTS "Users can view all chat members" ON chat_members;
DROP POLICY IF EXISTS "Users can add chat members" ON chat_members;
DROP POLICY IF EXISTS "Users can update chat members" ON chat_members;
DROP POLICY IF EXISTS "Users can remove chat members" ON chat_members;
DROP POLICY IF EXISTS "chat_members_select_policy" ON chat_members;
DROP POLICY IF EXISTS "chat_members_insert_policy" ON chat_members;
DROP POLICY IF EXISTS "chat_members_update_policy" ON chat_members;
DROP POLICY IF EXISTS "chat_members_delete_policy" ON chat_members;
DROP POLICY IF EXISTS "Enable read access for all users" ON chat_members;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON chat_members;
DROP POLICY IF EXISTS "Enable update for users based on email" ON chat_members;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON chat_members;
DROP POLICY IF EXISTS "Users can view their chat memberships" ON chat_members;
DROP POLICY IF EXISTS "Users can view members of their chats" ON chat_members;

-- For messages table
DROP POLICY IF EXISTS "Users can view all messages" ON messages;
DROP POLICY IF EXISTS "Users can create messages" ON messages;
DROP POLICY IF EXISTS "Users can update messages" ON messages;
DROP POLICY IF EXISTS "Users can delete messages" ON messages;
DROP POLICY IF EXISTS "messages_select_policy" ON messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON messages;
DROP POLICY IF EXISTS "messages_update_policy" ON messages;
DROP POLICY IF EXISTS "messages_delete_policy" ON messages;
DROP POLICY IF EXISTS "Enable read access for all users" ON messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON messages;
DROP POLICY IF EXISTS "Enable update for users based on email" ON messages;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their chats" ON messages;

-- Step 2: Disable RLS completely for all chat tables
ALTER TABLE chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Step 3: Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN 'ENABLED' 
    ELSE 'DISABLED' 
  END as rls_status
FROM pg_tables 
WHERE tablename IN ('chats', 'chat_members', 'messages')
AND schemaname = 'public';

-- Step 4: Test data access
SELECT 'chats' as table_name, COUNT(*) as record_count FROM chats
UNION ALL
SELECT 'chat_members' as table_name, COUNT(*) as record_count FROM chat_members
UNION ALL
SELECT 'messages' as table_name, COUNT(*) as record_count FROM messages;

-- Step 5: Show sample data
SELECT 'chats' as table_name, id, name, created_by FROM chats LIMIT 3;
SELECT 'chat_members' as table_name, chat_id, user_id, joined_at FROM chat_members LIMIT 3;
SELECT 'messages' as table_name, id, user_id, created_at FROM messages LIMIT 3;
