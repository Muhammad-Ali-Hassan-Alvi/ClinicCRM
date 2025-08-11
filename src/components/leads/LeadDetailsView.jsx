import React from 'react';
import { User, Calendar, Zap, Building2, Phone, Activity, GitBranch } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getLeadStatusColor } from '@/lib/constants';

const LeadDetailsView = ({ editedLead, settings, t }) => {
  if (!editedLead) return null;

  const branchName = editedLead.branchId && settings.branches 
    ? settings.branches.find(b => b.id === editedLead.branchId)?.name || 'N/A'
    : 'N/A';

  const DetailItem = ({ icon: Icon, value, label }) => (
    <div className="flex items-center gap-3 text-lg">
      <Icon className="w-5 h-5 text-gray-500" />
      <span className="text-gray-800">{value || 'N/A'}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-lg">
        <Activity className="w-5 h-5 text-gray-500" />
        <Badge className={`${getLeadStatusColor(editedLead.status)} text-base px-3 py-1`}>
          {t(`${editedLead.status.replace(/[\s-]/g, '')}`)}
        </Badge>
      </div>
      <DetailItem icon={Phone} value={editedLead.contactPhoneNumber} />
      <DetailItem 
        icon={Zap} 
        value={editedLead.leadSource ? t(`${editedLead.leadSource.replace(/[\s-]/g, '')}`) : 'N/A'} 
      />
      <DetailItem 
        icon={Building2} 
        value={editedLead.serviceOfInterest ? t(`${editedLead.serviceOfInterest.replace(/[\s-]/g, '')}`) : 'N/A'} 
      />
      <DetailItem 
        icon={User} 
        value={t(`${editedLead.assignedAgent.replace(/[\s-]/g, '')}`)} 
      />
      <DetailItem 
        icon={Calendar} 
        value={editedLead.date ? new Date(editedLead.date).toLocaleDateString() : 'N/A'} 
      />
      <DetailItem icon={GitBranch} value={branchName} />
    </div>
  );
};

export default LeadDetailsView;