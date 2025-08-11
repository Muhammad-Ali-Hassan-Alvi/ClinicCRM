import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, KeyRound, Building } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import ChangePasswordDialog from '@/components/ChangePasswordDialog';
import { useLocale } from '@/contexts/LocaleContext';

const UserMenu = () => {
  const { user, logout, activeBranch, setActiveBranch } = useAuth();
  const { settings } = useData();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const { t } = useLocale();

  if (!user) return null;

  const getBranchName = (branchId) => {
    if (branchId === 'all') return t('settings.branches.all');
    return settings.branches.find(b => b.id === branchId)?.name || 'Unknown Branch';
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold">
                {user.avatar}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.role}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span>{getBranchName(activeBranch)}</span>
            </div>
          </DropdownMenuLabel>
          {user.role === 'Admin' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{t('userMenu.switchBranch')}</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => setActiveBranch('all')}>
                {t('settings.branches.all')}
              </DropdownMenuItem>
              {settings.branches.map(branch => (
                <DropdownMenuItem key={branch.id} onSelect={() => setActiveBranch(branch.id)}>
                  {branch.name}
                </DropdownMenuItem>
              ))}
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setIsPasswordDialogOpen(true)}>
            <KeyRound className="mr-2 h-4 w-4" />
            <span>{t('userMenu.changePassword')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t('userMenu.logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ChangePasswordDialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen} />
    </>
  );
};

export default UserMenu;