import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, CheckCircle, Activity, Loader2 } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

const BookingPage = () => {
  const { settings, requestAppointment } = useData();
  const { toast } = useToast();
  const { t } = useLocale();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    birthday: '',
    department: '',
    appointmentDateTime: '',
    notes: ''
  });

  useEffect(() => {
    if (settings?.departments && Array.isArray(settings.departments) && settings.departments.length > 0 && !formData.department) {
      setFormData(prev => ({ ...prev, department: settings.departments[0] }));
    }
  }, [settings?.departments, formData.department]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phoneNumber || !formData.department || !formData.appointmentDateTime) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    
    try {
      const result = await requestAppointment(formData);
      if (result && result.success) {
        setIsSubmitted(true);
      } else {
        toast({
          title: "Request Failed",
          description: "There was an error submitting your request. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Appointment request error:', error);
      toast({
        title: "Request Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ensure departments is an array before rendering
  const departmentOptions = Array.isArray(settings?.departments) ? settings.departments : [];

  return (
    <>
      <Helmet>
        <title>Book an Appointment - Clinic CRM</title>
        <meta name="description" content="Easily book your next appointment with our clinic." />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <Activity className="w-10 h-10 text-purple-600" />
              <h1 className="text-4xl font-bold gradient-text">Clinic CRM</h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Book Your Appointment</h2>
            <p className="text-gray-600 mt-2">Fill out the form below to request an appointment.</p>
          </div>

          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-effect p-10 text-center rounded-2xl"
              >
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-800">Request Sent!</h3>
                <p className="text-gray-600 mt-2">
                  Thank you, {formData.fullName}. We've received your appointment request. Our team will contact you shortly to confirm the details.
                </p>
                <Button onClick={() => window.location.reload()} className="mt-8">
                  Book Another Appointment
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit}
                className="glass-effect p-8 rounded-2xl space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input 
                      id="fullName" 
                      value={formData.fullName} 
                      onChange={(e) => handleInputChange('fullName', e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input 
                      id="phoneNumber" 
                      type="tel" 
                      value={formData.phoneNumber} 
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={(e) => handleInputChange('email', e.target.value)} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="birthday">Birthday</Label>
                    <Input 
                      id="birthday" 
                      type="date" 
                      value={formData.birthday} 
                      onChange={(e) => handleInputChange('birthday', e.target.value)} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="department">Preferred Department *</Label>
                    <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentOptions.length > 0 ? (
                          departmentOptions.map(dept => (
                            <SelectItem key={dept} value={dept}>
                              {typeof dept === 'string' ? dept : String(dept)}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="general" disabled>
                            No departments available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="appointmentDateTime">Preferred Date & Time *</Label>
                    <Input 
                      id="appointmentDateTime" 
                      type="datetime-local" 
                      value={formData.appointmentDateTime} 
                      onChange={(e) => handleInputChange('appointmentDateTime', e.target.value)} 
                      min={getMinDateTime()} 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea 
                    id="notes" 
                    value={formData.notes} 
                    onChange={(e) => handleInputChange('notes', e.target.value)} 
                    placeholder="Anything else we should know?" 
                  />
                </div>
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full text-lg py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Calendar className="w-5 h-5 mr-2" />
                        Request Appointment
                      </>
                    )}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default BookingPage;