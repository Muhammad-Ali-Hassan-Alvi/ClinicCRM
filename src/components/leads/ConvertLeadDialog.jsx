import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowRight, CheckCircle } from 'lucide-react';

const ConvertLeadDialog = ({ isOpen, onOpenChange, onConvert, lead }) => {
  const { settings } = useData();
  const { toast } = useToast();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [isConverting, setIsConverting] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState({
    department: '',
    visitDate: '',
    status: 'Scheduled',
    notes: ''
  });

  useEffect(() => {
    if (lead && isOpen) {
      setAppointmentDetails({
        department: lead.serviceOfInterest || settings.departments?.[0] || '',
        visitDate: '',
        status: 'Scheduled',
        notes: `Converted from lead. Original source: ${lead.leadSource || 'Unknown'}`
      });
    }
  }, [lead, isOpen, settings.departments]);

  const handleInputChange = (field, value) => {
    setAppointmentDetails(prev => ({ ...prev, [field]: value }));
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleConvert = async () => {
    if (!appointmentDetails.department || !appointmentDetails.visitDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields for the appointment.",
        variant: "destructive"
      });
      return;
    }

    setIsConverting(true);
    try {
      const result = await onConvert(appointmentDetails);
      console.log('Conversion result:', result);
      if (result && result.success) {
        toast({
          title: "Lead Converted Successfully! 🎉",
          description: `${lead.contactFullName} has been converted to a customer with an appointment scheduled.`
        });
        
        onOpenChange(false);
        
        
        // Navigate to customer management with the new customer
        if (result.customerId) {
          navigate('/customers', { 
            state: { 
              openCustomerId: result.customerId,
              openAppointmentTab: true 
            } 
          });
        }
      }
      
      // else {
      //   toast({
      //     title: "Conversion Failed",
      //     description: "Failed to convert lead to customer. Please try again.",
      //     variant: "destructive"
      //   });
      // }
    } catch (error) {
      console.error('Lead conversion error:', error);
      toast({
        title: "Conversion Failed",
        description: "An error occurred during conversion. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-green-600" />
            Convert Lead to Customer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lead Information Summary */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <User className="w-5 h-5" />
              Lead Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-blue-700">Name:</span>
                <span className="ml-2 text-blue-900">{lead.contactFullName}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Phone:</span>
                <span className="ml-2 text-blue-900">{lead.contactPhoneNumber}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Source:</span>
                <span className="ml-2 text-blue-900">{lead.leadSource}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Service Interest:</span>
                <span className="ml-2 text-blue-900">{lead.serviceOfInterest}</span>
              </div>
            </div>
          </div>

          {/* Appointment Details Form */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule Appointment
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select 
                    value={appointmentDetails.department} 
                    onValueChange={(value) => handleInputChange('department', value)}
                  >
                    <SelectTrigger className="mt-1">
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
                </div>

                <div>
                  <Label htmlFor="status">Appointment Status</Label>
                  <Select 
                    value={appointmentDetails.status} 
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Confirmed">Confirmed</SelectItem>
                      <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="visitDate">Appointment Date & Time *</Label>
                <Input
                  id="visitDate"
                  type="datetime-local"
                  value={appointmentDetails.visitDate}
                  onChange={(e) => handleInputChange('visitDate', e.target.value)}
                  min={getMinDateTime()}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Appointment Notes</Label>
                <Textarea
                  id="notes"
                  value={appointmentDetails.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes for the appointment..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Conversion Summary */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              What happens next?
            </h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Lead will be converted to a customer record</li>
              <li>• Appointment will be scheduled for the specified date and time</li>
              <li>• Customer will appear in the Customer Management section</li>
              <li>• Lead will be removed from the Leads section</li>
              <li>• Appointment history will be tracked</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isConverting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConvert}
              disabled={isConverting || !appointmentDetails.department || !appointmentDetails.visitDate}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white"
            >
              {isConverting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Converting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Convert to Customer
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertLeadDialog;