import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium text-gray-800">{value}</p>
  </div>
);

const AppointmentDisplay = ({ appointment, onEdit, getStatusColor, t }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-grow">
        <DetailItem 
          label={t('tables.appointmentDate')} 
          value={new Date(appointment.appointment_date).toLocaleString()}
        />
        <DetailItem 
          label={t('tables.department')} 
          value={t(`${appointment.department.replace(/[\s-]/g, '')}`)}
        />
        <div>
          <p className="text-xs text-gray-500">{t('tables.status')}</p>
          <Badge className={`${getStatusColor(appointment.status)}`}>
            {t(`${appointment.status.replace(/[\s-]/g, '')}`)}
          </Badge>
        </div>
        <DetailItem 
          label={t('tables.notes')} 
          value={appointment.notes || 'N/A'}
        />
      </div>
      <div className="mt-4 md:mt-0 md:ml-4 flex-shrink-0">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          {t('actions.edit')}
        </Button>
      </div>
    </div>
  );
};

export default AppointmentDisplay;