import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, title, value, color }) => {
  const colors = {
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-green-500 to-teal-500',
    red: 'from-red-500 to-orange-500',
    cyan: 'from-cyan-500 to-sky-500',
  };
  
  return (
    <motion.div 
        whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
        className="bg-white rounded-2xl p-6 shadow-lg overflow-hidden relative"
    >
      <div className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${colors[color] || colors.blue} rounded-full opacity-20`}></div>
      <div className="relative z-10">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 font-medium">{title}</p>
            <Icon className={`w-7 h-7 text-white p-1 rounded-full bg-gradient-to-br ${colors[color] || colors.blue}`}/>
          </div>
          <p className="text-4xl font-bold text-gray-800 mt-2">{value}</p>
      </div>
    </motion.div>
  );
};

export default StatCard;