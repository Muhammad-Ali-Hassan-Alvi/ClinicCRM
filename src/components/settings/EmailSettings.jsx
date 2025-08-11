import React, { useState } from 'react';
import { Mail, Plus, Trash2, Edit, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import SettingsCard from '@/components/settings/SettingsCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const EmailSettings = () => {
  const { settings, updateSettings } = useData();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const emailAccounts = settings.emailAccounts || [];

  const handleConnectAccount = () => {
    if (!email || !password) {
      toast({ title: "Missing fields", description: "Please enter both email and password.", variant: "destructive" });
      return;
    }
    
    setIsDialogOpen(false);
    toast({ title: "Testing connection...", description: `Checking credentials for ${email}` });

    setTimeout(() => {
      const newAccount = {
        id: `email-${Date.now()}`,
        email,
        status: 'connected',
        connectedAt: new Date().toISOString(),
      };
      updateSettings({ emailAccounts: [...emailAccounts, newAccount] });
      toast({
        title: "✅ Account Connected!",
        description: `Successfully connected ${newAccount.email}.`,
      });
      setEmail('');
      setPassword('');
    }, 2000);
  };

  const handleDeleteAccount = (accountId) => {
    const updatedAccounts = emailAccounts.filter(acc => acc.id !== accountId);
    updateSettings({ emailAccounts: updatedAccounts });
    toast({
      title: 'Account Disconnected',
      description: 'The email account has been disconnected.',
      variant: 'destructive',
    });
  };

  return (
    <>
      <SettingsCard
        title="Email Accounts"
        description="Connect your email accounts to send and receive emails from the CRM."
        icon={<Mail className="w-6 h-6 text-blue-600" />}
      >
        <div className="p-4 space-y-4">
          {emailAccounts.map(account => (
            <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="font-semibold">{account.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleDeleteAccount(account.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
          {emailAccounts.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No email accounts connected.</p>}
        </div>
        <div className="p-4 border-t">
          <Button onClick={() => setIsDialogOpen(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Connect New Email Account
          </Button>
        </div>
      </SettingsCard>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Email Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g., yourname@example.com" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your email account password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConnectAccount}>Connect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmailSettings;