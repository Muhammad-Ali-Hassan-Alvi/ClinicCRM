import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, User, Shield, KeyRound, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import SettingsCard from '@/components/settings/SettingsCard';

const UserManagement = () => {
  const { settings, addUser, updateUser } = useData();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Agent',
    branch_ids: []
  });

  const users = settings.users || [];
  const roles = settings.roles || [];

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        branch_ids: user.branch_ids || []
      });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'Agent', branch_ids: [] });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({ title: "Error", description: "Full name and email are required.", variant: "destructive" });
      return;
    }

    if (!editingUser && !formData.password) {
      toast({ title: "Error", description: "Password is required for new users.", variant: "destructive" });
      return;
    }

    if (formData.role !== 'Admin' && formData.branch_ids.length === 0) {
      toast({ title: "Error", description: "Non-admin users must be assigned to at least one branch.", variant: "destructive" });
      return;
    }

    if (editingUser) {
      await updateUser(editingUser.id, {
        name: formData.name,
        role: formData.role,
        branch_ids: formData.role === 'Admin' ? settings.branches.map(b => b.id) : formData.branch_ids,
      });
    } else {
      await addUser(formData);
    }
    setIsDialogOpen(false);
  };

  const handleBranchToggle = (branchId, checked) => {
    setFormData(prev => ({
      ...prev,
      branch_ids: checked 
        ? [...prev.branch_ids, branchId]
        : prev.branch_ids.filter(id => id !== branchId)
    }));
  };

  const getBranchNames = (branchIds) => {
    if (!branchIds || branchIds.length === 0) return 'No branches assigned';
    return branchIds.map(id => settings.branches.find(b => b.id === id)?.name || 'Unknown').join(', ');
  };

  const handleResetPassword = () => {
    toast({ title: "Coming Soon!", description: "Password reset functionality will be added shortly." });
  };
  
  const getAvatar = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'NA';
  }

  return (
    <SettingsCard
      title="User Management"
      description="Manage users, roles, and their branch assignments."
    >
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>

        <div className="space-y-3">
          {users.map(user => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border rounded-lg bg-white/50 hover:bg-white/70 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {getAvatar(user.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <Shield className={`h-4 w-4 ${user.role === 'Admin' ? 'text-red-500' : 'text-blue-500'}`} />
                      {user.role}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{getBranchNames(user.branch_ids)}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={handleResetPassword}>
                    <KeyRound className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(user)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="p-1 space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., Dr. Sarah Johnson" required />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="sarah@clinic.com" required disabled={!!editingUser}/>
            </div>
            {!editingUser && (
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} placeholder="Min. 6 characters" required />
              </div>
            )}
            <div>
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value, branch_ids: value === 'Admin' ? settings.branches.map(b => b.id) : prev.branch_ids }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {formData.role !== 'Admin' && (
              <div>
                <Label>Branch Access *</Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                  {settings.branches.map(branch => (
                    <div key={branch.id} className="flex items-center space-x-2">
                      <Checkbox id={`branch-${branch.id}`} checked={formData.branch_ids.includes(branch.id)} onCheckedChange={(checked) => handleBranchToggle(branch.id, checked)} />
                      <Label htmlFor={`branch-${branch.id}`} className="text-sm font-normal">{branch.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
             <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editingUser ? 'Update User' : 'Add User'}</Button>
             </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SettingsCard>
  );
};

export default UserManagement;