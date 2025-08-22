#!/bin/bash

echo "🚀 Setting up Chat System Database..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project. Please run this script from your project root."
    exit 1
fi

echo "📦 Running database migration..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Database migration completed successfully!"
else
    echo "❌ Database migration failed. Please check the error messages above."
    exit 1
fi

echo ""
echo "🔧 Next steps:"
echo "1. Go to your Supabase dashboard"
echo "2. Navigate to Database > Replication"
echo "3. Enable realtime for the 'messages' table"
echo "4. Enable realtime for the 'chat_members' table"
echo ""
echo "🧪 To test the chat system:"
echo "1. Start your development server: npm run dev"
echo "2. Navigate to the Team Chat section"
echo "3. Create a new chat and start messaging!"
echo ""
echo "🎉 Chat system setup complete!"
