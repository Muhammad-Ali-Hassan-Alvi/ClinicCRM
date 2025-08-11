import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useData } from '@/contexts/DataContext';
import { Users, Target, HeartHandshake, Ticket, MessageCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const iconMap = {
  contact: <Users className="w-5 h-5 text-blue-500" />,
  lead: <Target className="w-5 h-5 text-purple-500" />,
  customer: <HeartHandshake className="w-5 h-5 text-green-500" />,
  ticket: <Ticket className="w-5 h-5 text-orange-500" />,
  message: <MessageCircle className="w-5 h-5 text-cyan-500" />,
};

const RecentActivity = () => {
  const { contacts, leads, customers, tickets, conversations } = useData();

  const activityFeed = useMemo(() => {
    const allActivities = [];

    contacts.forEach(c => allActivities.push({ type: 'contact', data: c, date: new Date(c.createdAt) }));
    leads.forEach(l => allActivities.push({ type: 'lead', data: l, date: new Date(l.createdAt) }));
    customers.forEach(c => allActivities.push({ type: 'customer', data: c, date: new Date(c.createdAt) }));
    tickets.forEach(t => allActivities.push({ type: 'ticket', data: t, date: new Date(t.createdAt) }));
    
    conversations.forEach(convo => {
        convo.messages.forEach(msg => {
            if (msg.sender === 'contact') {
                allActivities.push({ type: 'message', data: { ...msg, contactName: convo.contactName }, date: new Date(msg.timestamp) });
            }
        });
    });

    return allActivities.sort((a, b) => b.date - a.date).slice(0, 20);
  }, [contacts, leads, customers, tickets, conversations]);

  const renderActivityText = (item) => {
    switch (item.type) {
      case 'contact':
        return <>New contact added: <span className="font-semibold">{item.data.fullName}</span></>;
      case 'lead':
        return <>New lead created for <span className="font-semibold">{item.data.contactFullName}</span></>;
      case 'customer':
        return <><span className="font-semibold">{item.data.contactFullName}</span> became a customer.</>;
      case 'ticket':
        return <>New ticket opened for <span className="font-semibold">{item.data.customerName}</span></>;
      case 'message':
        return <>New message from <span className="font-semibold">{item.data.contactName}</span></>;
      default:
        return '';
    }
  };
  
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-effect rounded-2xl p-6 h-[460px] flex flex-col"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
      <ScrollArea className="flex-1 -mr-4 pr-4">
        <div className="space-y-4">
          {activityFeed.map((item, index) => (
            <div key={`${item.type}-${item.data.id}-${index}`} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1">
                {iconMap[item.type]}
              </div>
              <div>
                <p className="text-sm text-gray-700">{renderActivityText(item)}</p>
                <p className="text-xs text-gray-500">{timeAgo(item.date)}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default RecentActivity;