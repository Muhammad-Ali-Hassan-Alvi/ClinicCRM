import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useData } from '@/contexts/DataContext';
import { motion } from 'framer-motion';

const PerformanceChart = () => {
  const { leads, customers } = useData();

  const chartData = useMemo(() => {
    const dataMap = new Map();
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dataMap.set(dateString, { name: dateString, Leads: 0, Customers: 0 });
    }

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    leads.forEach(lead => {
      const leadDate = new Date(lead.createdAt);
      if (leadDate >= thirtyDaysAgo) {
        const dateString = leadDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (dataMap.has(dateString)) {
          dataMap.get(dateString).Leads++;
        }
      }
    });

    customers.forEach(customer => {
      const customerDate = new Date(customer.createdAt);
      if (customerDate >= thirtyDaysAgo) {
        const dateString = customerDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (dataMap.has(dateString)) {
          dataMap.get(dateString).Customers++;
        }
      }
    });

    return Array.from(dataMap.values());
  }, [leads, customers]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-effect rounded-2xl p-6"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4">30-Day Performance</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#888" />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#888" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(200, 200, 200, 0.5)',
                borderRadius: '1rem',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Bar dataKey="Leads" fill="#8884d8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Customers" fill="#82ca9d" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default PerformanceChart;