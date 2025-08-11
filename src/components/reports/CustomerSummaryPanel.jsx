import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/contexts/LocaleContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Users, AlertTriangle, Clock } from 'lucide-react';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

const CustomerSummaryPanel = ({ customers, onDataClick, settings }) => {
  const { t } = useLocale();

  const analytics = useMemo(() => {
    const statusBreakdown = customers.reduce((acc, customer) => {
      acc[customer.status] = (acc[customer.status] || 0) + 1;
      return acc;
    }, {});

    const departmentBreakdown = customers.reduce((acc, customer) => {
      const dept = customer.department || 'General';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    const sourceBreakdown = customers.reduce((acc, customer) => {
      const source = customer.leadSource || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    const appointmentsByDay = customers.reduce((acc, customer) => {
      const date = new Date(customer.appointmentDate).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const dailyData = Object.entries(appointmentsByDay)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-7)
      .map(([date, count]) => ({ date, appointments: count }));

    const statusData = Object.entries(statusBreakdown).map(([name, value]) => ({
      name: t(`${name.replace(/[\s-]/g, '')}`),
      value,
      originalStatus: name
    }));

    const topSources = Object.entries(sourceBreakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ 
        name: t(`${name.replace(/[\s-]/g, '')}`), 
        count,
        originalSource: name 
      }));

    const showRate = customers.length > 0 ? 
      ((customers.length - (statusBreakdown['No-Show'] || 0)) / customers.length) * 100 : 0;

    const newVsReturning = {
      new: customers.filter(c => !c.leadCreatedAt).length,
      returning: customers.filter(c => c.leadCreatedAt).length
    };

    return {
      statusData,
      dailyData,
      topSources,
      showRate,
      newVsReturning,
      departmentBreakdown: Object.entries(departmentBreakdown).map(([name, value]) => ({ 
        name: t(`${name.replace(/[\s-]/g, '')}`), 
        value,
        originalDept: name 
      }))
    };
  }, [customers, t]);

  const handleStatusClick = (data) => {
    if (data && data.originalStatus) {
      onDataClick('customers', { status: data.originalStatus });
    }
  };

  const handleSourceClick = (source) => {
    onDataClick('customers', { leadSource: source.originalSource });
  };

  const handleDepartmentClick = (dept) => {
    onDataClick('customers', { department: dept.originalDept });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-effect border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Customer Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={40}
                  dataKey="value"
                  onClick={handleStatusClick}
                  className="cursor-pointer"
                >
                  {analytics.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No customer data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-effect border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Appointments by Day (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.dailyData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="appointments" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No appointment data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-effect border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Top Referral Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topSources.length > 0 ? (
              analytics.topSources.map((source, index) => (
                <motion.div
                  key={source.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white/50 rounded-lg cursor-pointer hover:bg-white/70 transition-colors"
                  onClick={() => handleSourceClick(source)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                    </div>
                    <span className="font-medium">{source.name}</span>
                  </div>
                  <Badge variant="secondary">{source.count} customers</Badge>
                </motion.div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No source data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Key Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {analytics.showRate.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Show Rate</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {analytics.newVsReturning.new}:{analytics.newVsReturning.returning}
                </div>
                <p className="text-sm text-gray-600">New:Returning</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-700 mb-3">Department Distribution</h4>
              <div className="space-y-2">
                {analytics.departmentBreakdown.map((dept, index) => (
                  <div 
                    key={dept.name} 
                    className="flex items-center justify-between cursor-pointer hover:bg-white/50 p-2 rounded"
                    onClick={() => handleDepartmentClick(dept)}
                  >
                    <span className="text-sm text-gray-600">{dept.name}</span>
                    <Badge variant="outline">{dept.value}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerSummaryPanel;