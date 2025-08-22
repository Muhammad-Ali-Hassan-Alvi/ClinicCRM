@echo off
echo 🚀 Setting up Chat System Database...

REM Check if Supabase CLI is installed
supabase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Supabase CLI is not installed. Please install it first:
    echo    npm install -g supabase
    pause
    exit /b 1
)

REM Check if we're in a Supabase project
if not exist "supabase\config.toml" (
    echo ❌ Not in a Supabase project. Please run this script from your project root.
    pause
    exit /b 1
)

echo 📦 Running database migration...
supabase db push

if %errorlevel% equ 0 (
    echo ✅ Database migration completed successfully!
) else (
    echo ❌ Database migration failed. Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo 🔧 Next steps:
echo 1. Go to your Supabase dashboard
echo 2. Navigate to Database ^> Replication
echo 3. Enable realtime for the 'messages' table
echo 4. Enable realtime for the 'chat_members' table
echo.
echo 🧪 To test the chat system:
echo 1. Start your development server: npm run dev
echo 2. Navigate to the Team Chat section
echo 3. Create a new chat and start messaging!
echo.
echo 🎉 Chat system setup complete!
pause
