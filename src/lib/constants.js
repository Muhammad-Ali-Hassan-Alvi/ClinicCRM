export const sourceOptions = [
  'Walk-in',
  'Phone Call',
  'WhatsApp',
  'Instagram',
  'Facebook',
  'Google Ads',
  'Referral',
  'Website',
  'Email',
  'Other'
];

export const agentOptions = [
  'Dr. Smith',
  'Dr. Johnson',
  'Nurse Betty',
  'Admin Staff',
  'Unassigned'
];

export const customerStatusOptions = [
  'Booked',
  'Confirmed',
  'Rescheduled',
  'Showed',
  'No-Show',
  'Cancelled'
];

export const ticketStatusOptions = [
  'Open',
  'In Progress',
  'Pending',
  'Resolved',
  'Closed',
  'Cancelled'
];

export const ticketPriorityOptions = [
  'Low',
  'Medium',
  'High',
  'Urgent'
];

export const getLeadStatusColor = (status) => {
  const colors = {
    'Fresh': 'bg-green-100 text-green-800',
    'Hot': 'bg-red-100 text-red-800',
    'Cold': 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Lost': 'bg-gray-100 text-gray-800',
    'Booked': 'bg-purple-100 text-purple-800',
    'Converted': 'bg-emerald-100 text-emerald-800',
    'Re-follow': 'bg-orange-100 text-orange-800',
    'No-Show': 'bg-red-200 text-red-900'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getCustomerStatusColor = (status) => {
  const colors = {
    'Booked': 'bg-blue-100 text-blue-800',
    'Confirmed': 'bg-green-100 text-green-800',
    'Rescheduled': 'bg-yellow-100 text-yellow-800',
    'Showed': 'bg-emerald-100 text-emerald-800',
    'No-Show': 'bg-red-100 text-red-800',
    'Cancelled': 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getTicketStatusColor = (status) => {
  const colors = {
    'Open': 'bg-red-100 text-red-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Pending': 'bg-orange-100 text-orange-800',
    'Resolved': 'bg-green-100 text-green-800',
    'Closed': 'bg-gray-100 text-gray-800',
    'Cancelled': 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getTicketPriorityColor = (priority) => {
  const colors = {
    'Low': 'bg-blue-100 text-blue-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-orange-100 text-orange-800',
    'Urgent': 'bg-red-100 text-red-800'
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
};

export const appointmentStatusOptions = [
  'Scheduled',
  'Confirmed',
  'In Progress',
  'Completed',
  'Cancelled',
  'No-Show',
  'Rescheduled'
];

export const reminderTypes = [
  'Follow-up Call',
  'Appointment Reminder',
  'Birthday Greeting',
  'Treatment Follow-up',
  'Payment Reminder',
  'General Reminder'
];

export const followupTypes = [
  'Initial Contact',
  'Follow-up Call',
  'Email Follow-up',
  'WhatsApp Follow-up',
  'In-person Visit',
  'Treatment Consultation'
];

export const priorityLevels = [
  'Low',
  'Medium',
  'High',
  'Urgent'
];