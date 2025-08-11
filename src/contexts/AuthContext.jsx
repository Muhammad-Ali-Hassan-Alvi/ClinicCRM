import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const toCamel = (s) => {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
};

const keysToCamel = (o) => {
  if (o && typeof o === 'object' && !Array.isArray(o)) {
    const n = {};
    Object.keys(o).forEach((k) => {
      n[toCamel(k)] = keysToCamel(o[k]);
    });
    return n;
  } else if (Array.isArray(o)) {
    return o.map((i) => keysToCamel(i));
  }
  return o;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeBranch, setActiveBranchState] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          try {
            const { data: userProfile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileError || !userProfile) {
              console.error("Profile fetch error:", profileError);
              toast({
                title: "Authentication Error",
                description: "Could not retrieve user profile. Please try again.",
                variant: "destructive",
              });
              await supabase.auth.signOut();
              setLoading(false);
              return;
            }

            const camelProfile = keysToCamel(userProfile);
            setUser(session.user);
            setProfile(camelProfile);
            setIsAuthenticated(true);

            const storedBranch = localStorage.getItem('clinic-activeBranch');
            if (camelProfile.role === 'Admin') {
              setActiveBranchState(storedBranch || 'all');
            } else if (camelProfile.branchIds && camelProfile.branchIds.length > 0) {
              if (storedBranch && camelProfile.branchIds.includes(storedBranch)) {
                setActiveBranchState(storedBranch);
              } else {
                const defaultBranch = camelProfile.branchIds[0];
                setActiveBranchState(defaultBranch);
                localStorage.setItem('clinic-activeBranch', defaultBranch);
              }
            } else if (camelProfile.role !== 'Admin') {
              toast({ 
                title: "Access Denied", 
                description: "You are not assigned to any branches.", 
                variant: "destructive" 
              });
              await supabase.auth.signOut();
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error("Auth state change error:", error);
            toast({
              title: "Authentication Error",
              description: "An error occurred during authentication.",
              variant: "destructive",
            });
            await supabase.auth.signOut();
          }
        } else {
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
          setActiveBranchState(null);
          localStorage.removeItem('clinic-activeBranch');
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [toast]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };
  
  const login = async (email, password, branchId) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) {
        let errorMessage = "Login failed. Please check your credentials.";
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "Please confirm your email address before logging in.";
        } else if (error.message.includes('Too many requests')) {
          errorMessage = "Too many login attempts. Please wait a moment and try again.";
        }
        
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }

      if (data.user) {
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError || !userProfile) {
          await supabase.auth.signOut();
          toast({
            title: "Login Failed",
            description: "User profile could not be found. Please contact support.",
            variant: "destructive",
          });
          return false;
        }
        
        const camelProfile = keysToCamel(userProfile);

        if (camelProfile.role !== 'Admin' && (!camelProfile.branchIds || !camelProfile.branchIds.includes(branchId))) {
          await supabase.auth.signOut();
          toast({
            title: "Access Denied",
            description: "You do not have access to this branch.",
            variant: "destructive",
          });
          return false;
        }
        
        const newActiveBranch = camelProfile.role === 'Admin' ? (branchId || 'all') : branchId;
        setActiveBranchState(newActiveBranch);
        localStorage.setItem('clinic-activeBranch', newActiveBranch);

        toast({ 
          title: "Login Successful!", 
          description: `Welcome back, ${camelProfile.name}.` 
        });
        navigate('/dashboard');
        return true;
      }
      return false;
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const changePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast({
          title: "Password Change Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      toast({
        title: "Success!",
        description: "Your password has been changed successfully.",
      });
      return true;
    } catch (error) {
      toast({
        title: "Password Change Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    }
  };

  const setActiveBranch = (branchId) => {
    setActiveBranchState(branchId);
    localStorage.setItem('clinic-activeBranch', branchId);
    window.location.reload();
  };

  const value = { 
    user: profile, 
    isAuthenticated, 
    activeBranch, 
    login, 
    logout, 
    changePassword, 
    setActiveBranch, 
    loading 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};