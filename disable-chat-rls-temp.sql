-- Temporary fix: Disable RLS completely for chat tables
-- Run this in Supabase SQL Editor

-- First, let's see what policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('chats', 'chat_members', 'messages')
ORDER BY tablename, cmd;

-- Drop ALL policies for these tables (more comprehensive)
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

-- Disable RLS completely for these tables
ALTER TABLE chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('chats', 'chat_members', 'messages')
AND schemaname = 'public';

-- Test if the tables are accessible
SELECT COUNT(*) as chats_count FROM chats;
SELECT COUNT(*) as chat_members_count FROM chat_members;
SELECT COUNT(*) as messages_count FROM messages;

-- Show current data
SELECT * FROM chats LIMIT 5;
SELECT * FROM chat_members LIMIT 5;
