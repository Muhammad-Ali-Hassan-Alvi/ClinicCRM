import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  HeartHandshake, 
  LifeBuoy, 
  DatabaseZap,
  BarChart3, 
  MessageCircle,
  Instagram,
  Mail,
  MessageSquare,
  Settings,
  Shield,
  Activity
} from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

const SideNav = ({ isCollapsed }) => {
  const { t } = useLocale();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('sidebar.dashboard') },
    { to: '/contacts', icon: Users, label: t('sidebar.contacts') },
    { to: '/leads', icon: UserPlus, label: t('sidebar.leads') },
    { to: '/customers', icon: HeartHandshake, label: t('sidebar.customers') },
    { to: '/tickets', icon: LifeBuoy, label: t('sidebar.tickets') },
    { to: '/file-center', icon: DatabaseZap, label: t('sidebar.fileCenter') },
    { to: '/reports', icon: BarChart3, label: t('sidebar.reports') },
    { to: '/whatsapp', icon: MessageCircle, label: t('sidebar.whatsapp') },
    { to: '/instagram', icon: Instagram, label: t('sidebar.instagram') },
    { to: '/email', icon: Mail, label: t('sidebar.email') },
    { to: '/team-chat', icon: MessageSquare, label: t('sidebar.teamChat') },
    { to: '/settings', icon: Settings, label: t('sidebar.settings') },
    { to: '/audit-log', icon: Shield, label: t('sidebar.auditLog') },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white/50 backdrop-blur-xl flex flex-col shadow-lg border-r border-white/20">
      <div className="flex items-center justify-center h-20 shrink-0">
        <Activity className="h-8 w-8 text-purple-600" />
        <span className="ml-3 text-xl font-bold gradient-text">{t('sidebar.clinicCrm')}</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item, index) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-white/70 hover:text-gray-900 hover:shadow-md'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium truncate">{item.label}</span>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>
    </aside>
  );
};

export default SideNav;