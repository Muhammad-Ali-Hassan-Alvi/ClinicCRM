import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/contexts/LocaleContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import { TrendingUp, Users, Target, Award, UserPlus } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const LeadSummaryPanel = ({ leads, onDataClick, settings }) => {
  const { t } = useLocale();

  const analytics = useMemo(() => {
    const statusBreakdown = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});

    const sourceBreakdown = leads.reduce((acc, lead) => {
      const source = lead.leadSource || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    const departmentBreakdown = leads.reduce((acc, lead) => {
      const dept = lead.department || 'General';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    const agentPerformance = leads.reduce((acc, lead) => {
      const agent = lead.assignedAgent || 'Unassigned';
      acc[agent] = (acc[agent] || 0) + 1;
      return acc;
    }, {});

    const statusData = Object.entries(statusBreakdown).map(([name, value]) => ({
      name: t(`${name.replace(/[\s-]/g, '')}`),
      value,
      originalStatus: name
    }));

    const sourceData = Object.entries(sourceBreakdown).map(([name, value]) => ({
      name: t(`${name.replace(/[\s-]/g, '')}`),
      value,
      originalSource: name
    }));

    const topAgents = Object.entries(agentPerformance)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const conversionRate = leads.length > 0 ? 
      (leads.filter(l => ['Converted', 'Booked'].includes(l.status)).length / leads.length) * 100 : 0;

    return {
      statusData,
      sourceData,
      topAgents,
      conversionRate,
      departmentBreakdown: Object.entries(departmentBreakdown).map(([name, value]) => ({ name, value }))
    };
  }, [leads, t]);

  const handleStatusClick = (data) => {
    if (data && data.originalStatus) {
      onDataClick('leads', { status: data.originalStatus });
    }
  };

  const handleSourceClick = (data) => {
    if (data && data.originalSource) {
      onDataClick('leads', { leadSource: data.originalSource });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-effect border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Lead Status Breakdown
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
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No lead data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-effect border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Lead Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.sourceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.sourceData} layout="horizontal">
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip />
                <Bar 
                  dataKey="value" 
                  fill="#3B82F6" 
                  onClick={handleSourceClick}
                  className="cursor-pointer"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No source data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-effect border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Top Performing Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topAgents.length > 0 ? (
              analytics.topAgents.map((agent, index) => (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white/50 rounded-lg cursor-pointer hover:bg-white/70 transition-colors"
                  onClick={() => onDataClick('leads', { assignedAgent: agent.name })}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                    </div>
                    <span className="font-medium">{agent.name}</span>
                  </div>
                  <Badge variant="secondary">{agent.count} leads</Badge>
                </motion.div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No agent data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            Key Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {analytics.conversionRate.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-xs text-gray-500 mt-1">
                Leads converted to customers
              </p>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-700 mb-3">Department Distribution</h4>
              <div className="space-y-2">
                {analytics.departmentBreakdown.map((dept, index) => (
                  <div key={dept.name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t(`${dept.name.replace(/[\s-]/g, '')}`)}</span>
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

export default LeadSummaryPanel;