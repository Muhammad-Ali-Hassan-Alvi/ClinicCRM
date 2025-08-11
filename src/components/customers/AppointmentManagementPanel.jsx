import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';
import { supabase } from '@/lib/supabaseClient';
import AppointmentForm from './AppointmentForm';
import AppointmentDisplay from './AppointmentDisplay';
import { getCustomerStatusColor } from '@/lib/constants';

const AppointmentManagementPanel = ({ customer }) => {
  const { t } = useLocale();
  const { toast } = useToast();
  const { settings, refreshData, updateCustomer } = useData();
  const [appointments, setAppointments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  useEffect(() => {
    if (customer?.id) {
      fetchAppointments();
    }
  }, [customer?.id]);

  const fetchAppointments = async () => {
    if (!customer?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('customer_id', customer.id)
        .order('appointment_date', { ascending: false });

      if (error) {
        console.error('Error fetching appointments:', error);
        return;
      }

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (appointmentData) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.from('appointments').insert({
        customer_id: customer.id,
        contact_id: customer.contactId,
        contact_full_name: customer.contactFullName,
        contact_phone_number: customer.contactPhoneNumber,
        department: appointmentData.department,
        appointment_date: appointmentData.appointment_date,
        status: appointmentData.status,
        notes: appointmentData.notes,
        branch_id: customer.branchId,
      });

      if (error) {
        toast({ title: t('common.operationFailed'), description: error.message, variant: 'destructive' });
        return;
      }

      toast({
        title: t('Appointment Created'),
        description: t('New Appointment Scheduled') + ' ' + customer.contactFullName + '.'
      });

      setIsCreating(false);
      await fetchAppointments();
    } catch (error) {
      toast({ title: t('common.operationFailed'), description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointment = async (appointmentData) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('appointments')
        .update({
          department: appointmentData.department,
          appointment_date: appointmentData.appointment_date,
          status: appointmentData.status,
          notes: appointmentData.notes,
        })
        .eq('id', appointmentData.id);

      if (error) {
        toast({ title: t('common.operationFailed'), description: error.message, variant: 'destructive' });
        return;
      }

      let customerStatus = customer.status;
      if (appointmentData.status === 'No-Show') {
        customerStatus = 'No-Show';
      } else if (appointmentData.status === 'Completed') {
        customerStatus = 'Showed';
      } else if (appointmentData.status === 'Scheduled' || appointmentData.status === 'Confirmed') {
        customerStatus = 'Booked';
      }

      if (customer.status !== customerStatus) {
        await updateCustomer({ ...customer, status: customerStatus });
      }

      toast({
        title: t('Appointment Updated'),
        description: t('Status Changed') + ' ' + t(`${appointmentData.status.replace(/[\s-]/g, '')}`) + '.'
      });

      setIsEditing(false);
      setEditingAppointment(null);
      await fetchAppointments();
    } catch (error) {
      toast({ title: t('common.operationFailed'), description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const appointmentStatuses = ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No-Show', 'Rescheduled'];

  if (loading && appointments.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">{t('Loading Appointments')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {t('Management Panel')}
        </h3>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('New Appointment')}
        </Button>
      </div>

      {isCreating && (
        <AppointmentForm
          onSave={handleCreateAppointment}
          onCancel={() => setIsCreating(false)}
          settings={settings}
          appointmentStatuses={appointmentStatuses}
          t={t}
          loading={loading}
          isCreating={true}
        />
      )}

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">{t('appointments.noAppointments')}</h3>
            <p>{t('appointments.noAppointmentsDesc')}</p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {isEditing && editingAppointment?.id === appointment.id ? (
                <AppointmentForm
                  appointment={editingAppointment}
                  onSave={handleUpdateAppointment}
                  onCancel={() => {
                    setIsEditing(false);
                    setEditingAppointment(null);
                  }}
                  settings={settings}
                  appointmentStatuses={appointmentStatuses}
                  t={t}
                  loading={loading}
                  isCreating={false}
                />
              ) : (
                <AppointmentDisplay
                  appointment={appointment}
                  onEdit={() => {
                    setEditingAppointment({ ...appointment });
                    setIsEditing(true);
                  }}
                  getStatusColor={getCustomerStatusColor}
                  t={t}
                />
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default AppointmentManagementPanel;