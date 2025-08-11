import React from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { MessagesSquare } from 'lucide-react';
import UserMenu from '@/components/UserMenu';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white/60 backdrop-blur-lg border-b border-gray-200/80 sticky top-0 z-30">
      <div className="flex items-center justify-end h-16 px-6 gap-2">
        <LanguageSwitcher />
        <Button variant="ghost" size="icon" onClick={() => navigate('/team-chat')}>
          <MessagesSquare className="h-5 w-5 text-gray-600" />
        </Button>
        <NotificationCenter />
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;