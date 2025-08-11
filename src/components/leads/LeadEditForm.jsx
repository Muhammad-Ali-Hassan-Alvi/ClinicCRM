import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save } from 'lucide-react';
import { sourceOptions, agentOptions } from '@/lib/constants';

const LeadEditForm = ({ editedLead, onInputChange, onSave, onCancel, isSaving, settings, t }) => {
  if (!editedLead) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">{t('tables.status')} *</Label>
          <Select 
            value={editedLead.status} 
            onValueChange={(value) => onInputChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {settings.leadStatuses.map(s => (
                <SelectItem key={s} value={s}>
                  {t(`${s.replace(/[\s-]/g, '')}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="leadSource">{t('leadsManagement.addDialog.leadSource')}</Label>
          <Select 
            value={editedLead.leadSource} 
            onValueChange={(value) => onInputChange('leadSource', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {sourceOptions.map(s => (
                <SelectItem key={s} value={s}>
                  {t(`${s.replace(/[\s-]/g, '')}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="serviceOfInterest">{t('leadsManagement.addDialog.serviceOfInterest')}</Label>
          <Select 
            value={editedLead.serviceOfInterest} 
            onValueChange={(value) => onInputChange('serviceOfInterest', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {settings.departments.map(dept => (
                <SelectItem key={dept} value={dept}>
                  {t(`${dept.replace(/[\s-]/g, '')}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="assignedAgent">{t('leadsManagement.addDialog.assignedAgent')} *</Label>
          <Select 
            value={editedLead.assignedAgent} 
            onValueChange={(value) => onInputChange('assignedAgent', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {agentOptions.map(a => (
                <SelectItem key={a} value={a}>
                  {t(`${a.replace(/[\s-]/g, '')}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">{t('leadsManagement.addDialog.date')} *</Label>
          <Input 
            id="date" 
            type="date" 
            value={editedLead.date} 
            onChange={(e) => onInputChange('date', e.target.value)} 
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
          <X className="w-4 h-4 mr-2" />
          {t('actions.cancel')}
        </Button>
        <Button onClick={onSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : t('actions.saveChanges')}
        </Button>
      </div>
    </div>
  );
};

export default LeadEditForm;