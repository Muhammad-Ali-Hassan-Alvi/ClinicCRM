import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UserPlus, Target, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardQuickActions = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-effect rounded-2xl p-6"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button asChild className="h-24 flex-col gap-2 text-base bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <Link to="/contacts">
            <UserPlus className="w-6 h-6" />
            <span>New Contact</span>
          </Link>
        </Button>
        <Button asChild className="h-24 flex-col gap-2 text-base bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <Link to="/leads">
            <Target className="w-6 h-6" />
            <span>New Lead</span>
          </Link>
        </Button>
        <Button asChild className="h-24 flex-col gap-2 text-base bg-gradient-to-br from-cyan-500 to-sky-500 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <Link to="/whatsapp">
            <MessageCircle className="w-6 h-6" />
            <span>WhatsApp</span>
          </Link>
        </Button>
      </div>
    </motion.div>
  );
};

export default DashboardQuickActions;