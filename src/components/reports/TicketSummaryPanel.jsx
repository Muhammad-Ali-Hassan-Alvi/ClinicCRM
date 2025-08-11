import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/contexts/LocaleContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, Clock, Award, TrendingUp, Users } from 'lucide-react';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

const TicketSummaryPanel = ({ tickets, onDataClick, settings }) => {
  const { t } = useLocale();

  const analytics = useMemo(() => {
    const statusBreakdown = tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {});

    const priorityBreakdown = tickets.reduce((acc, ticket) => {
      acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
      return acc;
    }, {});

    const departmentBreakdown = tickets.reduce((acc, ticket) => {
      const dept = ticket.department || 'General';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    const agentWorkload = tickets.reduce((acc, ticket) => {
      const agent = ticket.assignedTo || 'Unassigned';
      acc[agent] = (acc[agent] || 0) + 1;
      return acc;
    }, {});

    const customerTicketCount = tickets.reduce((acc, ticket) => {
      const customer = ticket.customerName;
      acc[customer] = (acc[customer] || 0) + 1;
      return acc;
    }, {});

    const statusData = Object.entries(statusBreakdown).map(([name, value]) => ({
      name: t(`${name.replace(/[\s-]/g, '')}`),
      value,
      originalStatus: name
    }));

    const priorityData = Object.entries(priorityBreakdown).map(([name, value]) => ({
      name: t(`${name}`),
      value,
      originalPriority: name
    }));

    const topAgents = Object.entries(agentWorkload)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const frequentCustomers = Object.entries(customerTicketCount)
      .filter(([,count]) => count > 1)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const resolutionRate = tickets.length > 0 ? 
      (tickets.filter(t => ['Resolved', 'Closed'].includes(t.status)).length / tickets.length) * 100 : 0;

    const avgResolutionTime = tickets.filter(t => ['Resolved', 'Closed'].includes(t.status))
      .reduce((acc, ticket) => {
        const created = new Date(ticket.createdAt);
        const updated = new Date(ticket.updatedAt || ticket.createdAt);
        const hours = (updated - created) / (1000 * 60 * 60);
        return acc + hours;
      }, 0) / Math.max(tickets.filter(t => ['Resolved', 'Closed'].includes(t.status)).length, 1);

    return {
      statusData,
      priorityData,
      topAgents,
      frequentCustomers,
      resolutionRate,
      avgResolutionTime,
      departmentBreakdown: Object.entries(departmentBreakdown).map(([name, value]) => ({ 
        name: t(`${name.replace(/[\s-]/g, '')}`), 
        value,
        originalDept: name 
      }))
    };
  }, [tickets, t]);

  const handleStatusClick = (data) => {
    if (data && data.originalStatus) {
      onDataClick('tickets', { status: data.originalStatus });
    }
  };

  const handlePriorityClick = (data) => {
    if (data && data.originalPriority) {
      onDataClick('tickets', { priority: data.originalPriority });
    }
  };

  const handleAgentClick = (agent) => {
    onDataClick('tickets', { assignedTo: agent.name });
  };

  const handleDepartmentClick = (dept) => {
    onDataClick('tickets', { department: dept.originalDept });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-effect border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Ticket Status Overview
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
              No ticket data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-effect border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-600" />
            Priority Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.priorityData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="value" 
                  fill="#EF4444" 
                  onClick={handlePriorityClick}
                  className="cursor-pointer"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No priority data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-effect border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Most Active Support Agents
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
                  onClick={() => handleAgentClick(agent)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                    </div>
                    <span className="font-medium">{agent.name}</span>
                  </div>
                  <Badge variant="secondary">{agent.count} tickets</Badge>
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
            <Clock className="w-5 h-5 text-indigo-600" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {analytics.resolutionRate.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Resolution Rate</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {analytics.avgResolutionTime.toFixed(1)}h
                </div>
                <p className="text-sm text-gray-600">Avg Resolution Time</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-700 mb-3">Department Breakdown</h4>
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

            {analytics.frequentCustomers.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-700 mb-3">Frequent Ticket Customers</h4>
                <div className="space-y-2">
                  {analytics.frequentCustomers.map((customer, index) => (
                    <div key={customer.name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 truncate">{customer.name}</span>
                      <Badge variant="destructive">{customer.count} tickets</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketSummaryPanel;