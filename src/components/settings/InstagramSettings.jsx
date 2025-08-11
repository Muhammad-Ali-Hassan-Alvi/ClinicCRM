import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Plus, Trash2, Users, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const InstagramSettings = ({ isOpen, onOpenChange }) => {
  const { settings, updateSettings, currentUser } = useData();
  const { toast } = useToast();

  const [newAccount, setNewAccount] = useState({
    username: '',
    password: '',
    assignedUsers: [],
    branchId: currentUser?.branchIds?.[0] || settings.branches[0]?.id || ''
  });

  const instagramAccounts = settings.instagramAccounts || [];
  const availableUsers = settings.users || [];

  const handleAddAccount = () => {
    if (!newAccount.username || !newAccount.password) {
      toast({
        title: "Required Fields Missing",
        description: "Please enter both username and password.",
        variant: "destructive"
      });
      return;
    }

    const accountExists = instagramAccounts.some(acc => acc.username === newAccount.username);
    if (accountExists) {
      toast({
        title: "Account Already Exists",
        description: "This Instagram username is already registered.",
        variant: "destructive"
      });
      return;
    }

    const newInstagramAccount = {
      id: Date.now().toString(),
      ...newAccount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    updateSettings({ instagramAccounts: [...instagramAccounts, newInstagramAccount] });
    
    setNewAccount({ username: '', password: '', assignedUsers: [], branchId: currentUser?.branchIds?.[0] || settings.branches[0]?.id || '' });
    
    toast({
      title: "Instagram Account Added",
      description: "Click 'Connect' to activate the account.",
    });
  };

  const handleConnect = (accountId) => {
    // Simulate connection process
    let updatedAccounts = instagramAccounts.map(acc => acc.id === accountId ? { ...acc, status: 'connecting' } : acc);
    updateSettings({ instagramAccounts: updatedAccounts });

    setTimeout(() => {
      updatedAccounts = instagramAccounts.map(acc => acc.id === accountId ? { ...acc, status: 'connected', connectedAt: new Date().toISOString() } : acc);
      updateSettings({ instagramAccounts: updatedAccounts });
      toast({
        title: "Instagram Connected!",
        description: `Successfully connected @${updatedAccounts.find(a => a.id === accountId)?.username}`,
      });
    }, 3000);
  };

  const handleDisconnect = (accountId) => {
    const updatedAccounts = instagramAccounts.map(acc => acc.id === accountId ? { ...acc, status: 'disconnected' } : acc);
    updateSettings({ instagramAccounts: updatedAccounts });
    toast({
      title: "Instagram Disconnected",
      variant: "destructive"
    });
  };

  const handleDeleteAccount = (accountId) => {
    const updatedAccounts = instagramAccounts.filter(acc => acc.id !== accountId);
    updateSettings({ instagramAccounts: updatedAccounts });
    toast({
      title: "Instagram Account Removed",
      variant: "destructive"
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-gray-100 text-gray-800', icon: <Clock className="w-3 h-3" />, text: 'Pending' },
      connecting: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-3 h-3" />, text: 'Connecting...' },
      connected: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" />, text: 'Connected' },
      disconnected: { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-3 h-3" />, text: 'Disconnected' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={`${config.color} flex items-center gap-1`}>{config.icon}{config.text}</Badge>;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold gradient-text">Instagram Integration</h2>
            <p className="text-gray-600 mt-1">Connect and manage Instagram business accounts</p>
          </div>
          <div className="p-6 flex-grow overflow-y-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5" />Add New Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Instagram Username *</Label>
                    <Input id="username" value={newAccount.username} onChange={(e) => setNewAccount(p => ({...p, username: e.target.value}))} placeholder="@username" />
                  </div>
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input id="password" type="password" value={newAccount.password} onChange={(e) => setNewAccount(p => ({...p, password: e.target.value}))} placeholder="••••••••" />
                  </div>
                </div>
                <Button onClick={handleAddAccount} className="w-full"><Plus className="w-4 h-4 mr-2" />Add Account</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Instagram className="w-5 h-5" />Connected Accounts ({instagramAccounts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {instagramAccounts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No Instagram accounts added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {instagramAccounts.map(account => (
                      <div key={account.id} className="border rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold">@{account.username}</h3>
                            {getStatusBadge(account.status)}
                          </div>
                          <p className="text-sm text-gray-600">Branch: {settings.branches.find(b => b.id === account.branchId)?.name || 'N/A'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {account.status !== 'connected' && (
                            <Button size="sm" onClick={() => handleConnect(account.id)} className="bg-green-600 hover:bg-green-700">Connect</Button>
                          )}
                          {account.status === 'connected' && (
                            <Button size="sm" variant="outline" onClick={() => handleDisconnect(account.id)}>Disconnect</Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteAccount(account.id)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default InstagramSettings;