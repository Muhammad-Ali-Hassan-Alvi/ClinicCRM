import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const AppointmentForm = ({ 
  appointment = null, 
  onSave, 
  onCancel, 
  settings, 
  appointmentStatuses, 
  t, 
  loading = false,
  isCreating = false 
}) => {
  const [formData, setFormData] = useState({
    department: '',
    appointment_date: '',
    status: 'Scheduled',
    notes: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (appointment) {
      setFormData({
        department: appointment.department || '',
        appointment_date: appointment.appointment_date 
          ? new Date(appointment.appointment_date).toISOString().slice(0, 16)
          : '',
        status: appointment.status || 'Scheduled',
        notes: appointment.notes || ''
      });
    } else if (isCreating) {
      // Set defaults for new appointments
      setFormData({
        department: settings.departments?.[0] || '',
        appointment_date: '',
        status: 'Scheduled',
        notes: ''
      });
    }
    setValidationErrors({});
  }, [appointment, isCreating, settings.departments]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.department) {
      errors.department = 'Department is required';
    }
    
    if (!formData.appointment_date) {
      errors.appointment_date = 'Appointment date and time is required';
    } else {
      const appointmentDate = new Date(formData.appointment_date);
      const now = new Date();
      // Allow past dates for existing appointments, but warn for new ones
      if (isCreating && appointmentDate < now) {
        errors.appointment_date = 'Appointment date cannot be in the past';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const appointmentData = {
      ...formData,
      appointment_date: new Date(formData.appointment_date).toISOString(),
    };

    if (appointment) {
      appointmentData.id = appointment.id;
    }

    onSave(appointmentData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-50 rounded-lg p-6 border border-blue-200 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-blue-800">
          {isCreating ? 'Schedule New Appointment' : 'Edit Appointment'}
        </h3>
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={loading} size="sm">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={loading} size="sm">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Department */}
          <div>
            <Label htmlFor="department" className="flex items-center gap-2">
              Department <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={formData.department} 
              onValueChange={(value) => handleInputChange('department', value)}
            >
              <SelectTrigger className={`mt-1 ${validationErrors.department ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {settings.departments?.map(dept => (
                  <SelectItem key={dept} value={dept}>
                    {t(`${dept.replace(/[\s-]/g, '')}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.department && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {validationErrors.department}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {appointmentStatuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {t(`${status.replace(/[\s-]/g, '')}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Appointment Date & Time */}
        <div>
          <Label htmlFor="appointment_date" className="flex items-center gap-2">
            Appointment Date & Time <span className="text-red-500">*</span>
          </Label>
          <Input
            id="appointment_date"
            type="datetime-local"
            value={formData.appointment_date}
            onChange={(e) => handleInputChange('appointment_date', e.target.value)}
            className={`mt-1 ${validationErrors.appointment_date ? 'border-red-500' : ''}`}
          />
          {validationErrors.appointment_date && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {validationErrors.appointment_date}
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Additional notes about the appointment..."
            className="mt-1"
            rows={3}
          />
        </div>

        {/* Status Warning */}
        {formData.status === 'No-Show' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">No-Show Status</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Marking this appointment as "No-Show" will update the customer status accordingly.
            </p>
          </div>
        )}
      </form>
    </motion.div>
  );
};

export default AppointmentForm;