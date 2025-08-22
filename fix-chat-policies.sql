-- Fix infinite recursion in chat_members RLS policy
-- Run this in Supabase SQL Editor

-- First, let's see what policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('chats', 'chat_members', 'messages');

-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view chats they are members of" ON chats;
DROP POLICY IF EXISTS "Users can create chats" ON chats;
DROP POLICY IF EXISTS "Users can update chats they are members of" ON chats;
DROP POLICY IF EXISTS "Users can delete chats they are members of" ON chats;

DROP POLICY IF EXISTS "Users can view chat members" ON chat_members;
DROP POLICY IF EXISTS "Users can add themselves to chats" ON chat_members;
DROP POLICY IF EXISTS "Users can remove themselves from chats" ON chat_members;

-- Create simple, non-recursive policies for chats
CREATE POLICY "Users can view all chats" ON chats
  FOR SELECT USING (true);

CREATE POLICY "Users can create chats" ON chats
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update chats" ON chats
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete chats" ON chats
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create simple, non-recursive policies for chat_members
CREATE POLICY "Users can view all chat members" ON chat_members
  FOR SELECT USING (true);

CREATE POLICY "Users can add chat members" ON chat_members
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update chat members" ON chat_members
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can remove chat members" ON chat_members
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create simple policies for messages
CREATE POLICY "Users can view all messages" ON messages
  FOR SELECT USING (true);

CREATE POLICY "Users can create messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update messages" ON messages
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete messages" ON messages
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Verify the policies were created
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
