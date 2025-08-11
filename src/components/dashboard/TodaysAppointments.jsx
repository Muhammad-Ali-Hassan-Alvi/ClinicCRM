import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, Bell, Check, X } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import AppointmentStatusUpdateDialog from '@/components/customers/AppointmentStatusUpdateDialog';

const TodaysAppointments = () => {
  const { customers, updateCustomer } = useData();
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const todaysAppointments = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    return customers
      .filter(c => {
        const apptDate = new Date(c.appointmentDate);
        return apptDate >= todayStart && apptDate <= todayEnd;
      })
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
  }, [customers]);

  const handleOpenUpdateDialog = (customer) => {
    setSelectedCustomer(customer);
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateStatus = (customerId, status) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      updateCustomer({ ...customer, status });
    }
    setIsUpdateDialogOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <>
      <motion.aside
        initial={{ x: 320 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="w-80 bg-white/70 backdrop-blur-lg border-l border-gray-200/80 flex flex-col shadow-2xl"
      >
        <div className="p-4 border-b border-gray-200/80">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <CalendarClock className="text-indigo-500" />
            Today's Appointments
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <AnimatePresence>
            {todaysAppointments.length > 0 ? (
              todaysAppointments.map((appt, index) => {
                const isPast = new Date(appt.appointmentDate) < new Date();
                const needsUpdate = isPast && appt.status === 'Booked';
                return (
                  <motion.div
                    key={appt.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg mb-2 transition-all ${needsUpdate ? 'bg-yellow-100/80 border border-yellow-300' : 'bg-white/80'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{appt.contactFullName}</p>
                        <p className="text-sm text-gray-600">{appt.department}</p>
                      </div>
                      <p className="text-sm font-bold text-indigo-600">
                        {new Date(appt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {needsUpdate && (
                      <div className="mt-2">
                        <Button size="sm" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white" onClick={() => handleOpenUpdateDialog(appt)}>
                          <Bell className="w-4 h-4 mr-2 animate-ping-slow" />
                          Update Status
                        </Button>
                      </div>
                    )}
                    {appt.status !== 'Booked' && (
                       <div className={`mt-2 text-sm font-semibold flex items-center gap-2 ${appt.status === 'Showed' ? 'text-green-600' : 'text-red-600'}`}>
                         {appt.status === 'Showed' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                         {appt.status}
                       </div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center p-10 text-gray-500">
                <p>No appointments scheduled for today.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
      <AppointmentStatusUpdateDialog
        isOpen={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        customer={selectedCustomer}
        onUpdateStatus={handleUpdateStatus}
      />
    </>
  );
};

export default TodaysAppointments;