import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, LogIn, Key, Building, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from '@/contexts/LocaleContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const LoginPage = () => {
  const { login } = useAuth();
  const { t } = useLocale();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      const { data, error } = await supabase.from('branches').select('*');
      if (error) {
        console.error("Failed to fetch branches", error);
        toast({ title: "Error", description: "Could not load branches.", variant: "destructive"});
      } else {
        setBranches(data || []);
        if (data && data.length > 0) {
          setBranchId(data[0].id);
        }
      }
    };
    fetchBranches();
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!branchId) {
      toast({
        title: "Branch not selected",
        description: "Please select a branch to continue.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    await login(email, password, branchId);
    setIsLoading(false);
  };

  const handleCreateAdmin = async () => {
    setIsCreatingAdmin(true);
    toast({
      title: "Setting up Admin Account",
      description: "Please wait...",
    });

    const { data, error } = await supabase.functions.invoke('create-admin-user');

    if (error) {
      toast({
        title: "Admin Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      if (data.message) {
         toast({
          title: "Admin Account Ready",
          description: data.message + " You can now log in.",
        });
      } else if (data.user) {
        toast({
          title: "Admin Account Created!",
          description: "You can now log in. Email: admin@lamel.clinic, Password: password123",
        });
      }
    }
    setIsCreatingAdmin(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-6 bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl"
      >
        <div className="text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Activity className="w-10 h-10 text-purple-600" />
            <h1 className="text-3xl font-bold gradient-text">{t('sidebar.clinicCrm')}</h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{t('login.title')}</h2>
          <p className="text-gray-600">{t('login.description')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">{t('login.email')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lamel.clinic"
                required
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('login.password')}</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch">{t('login.branch')}</Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <Select
                value={branchId}
                onValueChange={setBranchId}
              >
                <SelectTrigger className="pl-10" id="branch">
                  <SelectValue placeholder={t('login.selectBranch')} />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full !mt-8" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                {t('login.loginButton')}
              </>
            )}
          </Button>
        </form>
        <div className="text-center mt-4 border-t pt-4">
          <p className="text-sm text-gray-600 mb-2">First time running the app or can't log in?</p>
          <Button
              variant="outline"
              size="sm"
              onClick={handleCreateAdmin}
              disabled={isCreatingAdmin}
              className="w-full"
          >
              {isCreatingAdmin ? (
                  <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Admin...
                  </>
              ) : 'Setup/Reset Admin Account'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;