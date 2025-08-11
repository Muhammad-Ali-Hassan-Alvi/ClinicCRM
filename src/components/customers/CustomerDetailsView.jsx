import React from 'react';
import { User, Phone, MapPin, Calendar, GitBranch, Building, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getCustomerStatusColor } from '@/lib/constants';

const DetailItem = ({ icon, label, value, children }) => (
  <div className="flex items-start text-sm mb-4">
    <div className="text-gray-500 w-6 h-6 mr-3 flex-shrink-0">{icon}</div>
    <div className="flex-1">
      <p className="font-medium text-gray-800 mb-1">{label}</p>
      {value ? <p className="text-gray-600">{value}</p> : children}
    </div>
  </div>
);

const CustomerDetailsView = ({ customer, branchName, t, settings }) => {
  if (!customer) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{t('common.noData')}</p>
      </div>
    );
  }

  const formatNotes = (notes) => {
    if (!notes) return t('common.notApplicable');
    
    if (Array.isArray(notes)) {
      return notes.map(note => note.text || note).join(', ');
    }
    
    return notes;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      <div className="space-y-4">
        <DetailItem 
          icon={<User />} 
          label={t('tables.customerName')} 
          value={customer.contactFullName || t('common.notApplicable')} 
        />
        
        <DetailItem 
          icon={<Phone />} 
          label={t('tables.phone')} 
          value={customer.contactPhoneNumber || t('common.notApplicable')} 
        />
        
        <DetailItem 
          icon={<MapPin />} 
          label={t('details.sourcePrefix')} 
          value={customer.leadSource ? t(`${customer.leadSource?.replace(/[\s-]/g, '')}`) : t('common.notApplicable')} 
        />
        
        <DetailItem 
          icon={<GitBranch />} 
          label={t('details.branchPrefix')} 
          value={branchName || t('common.notApplicable')} 
        />
      </div>
      
      <div className="space-y-4">
        <DetailItem 
          icon={<Building />} 
          label={t('tables.department')} 
          value={customer.department ? t(`${customer.department?.replace(/[\s-]/g, '')}`) : t('common.notApplicable')} 
        />
        
        <DetailItem 
          icon={<Calendar />} 
          label={t('tables.appointmentDate')} 
          value={customer.appointmentDate ? new Date(customer.appointmentDate).toLocaleString() : t('common.notApplicable')} 
        />
        
        <DetailItem 
          icon={<Clock />} 
          label={t('tables.status')}
        >
          <Badge className={getCustomerStatusColor(customer.status)}>
            {customer.status ? t(`${customer.status.replace(/[\s-]/g, '')}`) : t('common.notApplicable')}
          </Badge>
        </DetailItem>
        
        <DetailItem 
          icon={<User />} 
          label={t('details.createdPrefix')} 
          value={customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : t('common.notApplicable')} 
        />
      </div>
      
      {/* Notes Section */}
      <div className="md:col-span-2 mt-4">
        <DetailItem 
          icon={<User />} 
          label={t('details.internalNotes')} 
          value={formatNotes(customer.notes)} 
        />
      </div>
    </div>
  );
};

export default CustomerDetailsView;