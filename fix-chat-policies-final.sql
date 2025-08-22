-- Final fix for chat system infinite recursion
-- Run this in Supabase SQL Editor

-- First, disable RLS temporarily
ALTER TABLE chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Drop ALL possible existing policies for these tables
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

DROP POLICY IF EXISTS "Users can view all messages" ON messages;
DROP POLICY IF EXISTS "Users can create messages" ON messages;
DROP POLICY IF EXISTS "Users can update messages" ON messages;
DROP POLICY IF EXISTS "Users can delete messages" ON messages;
DROP POLICY IF EXISTS "messages_select_policy" ON messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON messages;
DROP POLICY IF EXISTS "messages_update_policy" ON messages;
DROP POLICY IF EXISTS "messages_delete_policy" ON messages;

-- Re-enable RLS
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create very simple, non-recursive policies
-- For chats table
CREATE POLICY "chats_select_policy" ON chats
  FOR SELECT USING (true);

CREATE POLICY "chats_insert_policy" ON chats
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "chats_update_policy" ON chats
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "chats_delete_policy" ON chats
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- For chat_members table
CREATE POLICY "chat_members_select_policy" ON chat_members
  FOR SELECT USING (true);

CREATE POLICY "chat_members_insert_policy" ON chat_members
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "chat_members_update_policy" ON chat_members
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "chat_members_delete_policy" ON chat_members
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- For messages table
CREATE POLICY "messages_select_policy" ON messages
  FOR SELECT USING (true);

CREATE POLICY "messages_insert_policy" ON messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "messages_update_policy" ON messages
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "messages_delete_policy" ON messages
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Verify the policies were created correctly
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

-- Test if the tables are accessible
SELECT COUNT(*) as chats_count FROM chats;
SELECT COUNT(*) as chat_members_count FROM chat_members;
SELECT COUNT(*) as messages_count FROM messages;
