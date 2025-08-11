import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Globe, Building, Calendar, UserCheck, Ticket, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getCustomerStatusColor, customerStatusOptions } from '@/lib/constants';

const CustomerCard = ({ customer, index, onUpdateStatus, onCreateTicket, onCardClick }) => {
  return (
    <motion.div
      key={customer.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="contact-card flex flex-col cursor-pointer"
      onClick={() => onCardClick(customer)}
    >
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{customer.contactFullName}</h3>
            <p className="text-sm text-gray-500">Booked on {new Date(customer.createdAt).toLocaleDateString()}</p>
          </div>
          <Badge className={`${getCustomerStatusColor(customer.status)} border`}>
            {customer.status}
          </Badge>
        </div>

        <div className="space-y-3">
          {customer.contactPhoneNumber && <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-blue-500" /><span>{customer.contactPhoneNumber}</span></div>}
          <div className="flex items-center gap-2 text-sm"><Globe className="w-4 h-4 text-purple-500" /><span>Source: {customer.leadSource}</span></div>
          <div className="flex items-center gap-2 text-sm"><Building className="w-4 h-4 text-indigo-500" /><span>Dept: {customer.department}</span></div>
          <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-green-500" /><span>Apt: {new Date(customer.appointmentDate).toLocaleString([], {dateStyle: 'short', timeStyle: 'short'})}</span></div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-gray-500" />
          <Select value={customer.status} onValueChange={(value) => onUpdateStatus(customer.id, value)}>
            {customerStatusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </Select>
        </div>
        {onCreateTicket &&
            <Button variant="outline" size="sm" className="w-full" onClick={() => onCreateTicket(customer)}>
                <Ticket className="w-4 h-4 mr-2"/>
                Create Ticket
            </Button>
        }
      </div>
    </motion.div>
  );
};

export default CustomerCard;