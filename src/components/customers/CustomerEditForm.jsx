import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { customerStatusOptions } from '@/lib/constants';

const CustomerEditForm = ({
  customer,
  onSave,
  onCancel,
  settings,
  t,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    status: '',
    department: '',
    appointmentDate: '',
    notes: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (customer) {
      console.log('Customer data loaded:', customer);
      setFormData({
        status: customer.status || 'Booked',
        department: customer.department || '',
        appointmentDate: customer.appointmentDate
          ? new Date(customer.appointmentDate).toISOString().slice(0, 16)
          : '',
        notes: Array.isArray(customer.notes)
          ? customer.notes.map(note => note.text).join('\n')
          : customer.notes || ''
      });
      setValidationErrors({});
    }
  }, [customer]);

  const validateForm = () => {
    const errors = {};

    if (!formData.status) {
      errors.status = t('validation.required');
    }

    if (!formData.department) {
      errors.department = t('validation.required');
    }

    if (!formData.appointmentDate) {
      errors.appointmentDate = t('validation.required');
    } else {
      const appointmentDate = new Date(formData.appointmentDate);
      const now = new Date();
      // Allow past dates for existing appointments
      if (appointmentDate < new Date(now.getTime() - 24 * 60 * 60 * 1000)) {
        errors.appointmentDate = 'Appointment date cannot be more than 24 hours in the past';
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

    // Convert notes back to array format if needed
    const notesArray = formData.notes
      ? formData.notes.split('\n').filter(note => note.trim()).map((text, index) => ({
        id: `${Date.now()}_${index}`,
        text: text.trim(),
        createdAt: new Date().toISOString()
      }))
      : [];

    const updatedCustomer = {
      ...customer,
      status: formData.status,
      department: formData.department,
      appointmentDate: new Date(formData.appointmentDate).toISOString(),
      notes: notesArray,
      updatedAt: new Date().toISOString()
    };
    // console.log('Updated customer:', updatedCustomer);

    onSave(updatedCustomer);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 rounded-lg p-6 border space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          {t('actions.edit')} {t('details.customerDetails')}
        </h3>
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? t('Saving') : t('actions.saveChanges')}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            <X className="w-4 h-4 mr-2" />
            {t('actions.cancel')}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <Label htmlFor="status" className="flex items-center gap-2">
              {t('tables.status')} <span className="text-red-500">*</span>
            </Label>
            <Select
              id="status"
              name="status"
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <SelectTrigger className={`mt-1 ${validationErrors.status ? 'border-red-500' : ''}`}>
                <SelectValue placeholder={t('tables.status')} />
              </SelectTrigger>
              <SelectContent>
                {customerStatusOptions
                  .filter(status => status === "Booked" || status === "No-Show")
                  .map(status => (
                    <SelectItem key={status} value={status}>
                      {t(`${status.replace(/[\s-]/g, '')}`)}
                    </SelectItem>
                  ))}

              </SelectContent>
            </Select>
            {validationErrors.status && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {validationErrors.status}
              </p>
            )}
          </div>

          {/* Department */}
          <div>
            <Label htmlFor="department" className="flex items-center gap-2">
              {t('tables.department')} <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.department}
              onValueChange={(value) => handleInputChange('department', value)}
            >
              <SelectTrigger className={`mt-1 ${validationErrors.department ? 'border-red-500' : ''}`}>
                <SelectValue placeholder={t('tables.department')} />
              </SelectTrigger>
              <SelectContent>
                {settings.departments.map(dept => (
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
        </div>

        {/* Appointment Date & Time */}
        <div>
          <Label htmlFor="appointmentDate" className="flex items-center gap-2">
            {t('tables.appointmentDate')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="appointmentDate"
            type="datetime-local"
            value={formData.appointmentDate}
            onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
            className={`mt-1 ${validationErrors.appointmentDate ? 'border-red-500' : ''}`}
          />
          {validationErrors.appointmentDate && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {validationErrors.appointmentDate}
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">{t('tables.notes')}</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder={t('details.internalNotes') + '...'}
            className="mt-1"
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate multiple notes with line breaks
          </p>
        </div>

        {/* No-Show Warning */}
        {formData.status === 'No-Show' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">No-Show Action</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Marking this customer as "No-Show" will move them back to the Leads section
              for follow-up and remove them from the Customer list.
            </p>
          </div>
        )}
      </form>
    </motion.div>
  );
};

export default CustomerEditForm;