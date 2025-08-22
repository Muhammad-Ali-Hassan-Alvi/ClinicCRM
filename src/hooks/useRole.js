import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

export const useRole = () => {
  const { user } = useAuth(); // Profile data from AuthContext
  const { currentUser } = useData(); // User data from DataContext
  
  // Debug logging
  console.log('useRole - AuthContext user:', user);
  console.log('useRole - DataContext currentUser:', currentUser);
  
  // Get role from either source, prioritizing AuthContext
  const role = user?.role || currentUser?.role;
  
  console.log('useRole - Final role:', role);
  
  const isAdmin = role === 'Admin';
  const isDoctor = role === 'Doctor';
  const isNurse = role === 'Nurse';
  const isReceptionist = role === 'Receptionist';
  
  return {
    role,
    isAdmin,
    isDoctor,
    isNurse,
    isReceptionist,
    hasRole: (requiredRole) => role === requiredRole,
    hasAnyRole: (roles) => roles.includes(role),
    user, // Include raw user data for debugging
    currentUser, // Include raw currentUser data for debugging
  };
};
