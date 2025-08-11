export const validateContactData = (data) => {
  const errors = [];
  
  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long');
  }
  
  if (!data.phoneNumber || !/^\+?[\d\s\-\(\)]{8,}$/.test(data.phoneNumber)) {
    errors.push('Please provide a valid phone number');
  }
  
  if (data.secondaryPhoneNumber && !/^\+?[\d\s\-\(\)]{8,}$/.test(data.secondaryPhoneNumber)) {
    errors.push('Secondary phone number format is invalid');
  }
  
  if (data.birthday && new Date(data.birthday) > new Date()) {
    errors.push('Birthday cannot be in the future');
  }
  
  if (data.instagramUrl && !data.instagramUrl.includes('instagram.com')) {
    errors.push('Instagram URL must be a valid Instagram profile link');
  }
  
  return errors;
};

export const validateLeadData = (data) => {
  const errors = [];
  
  if (!data.contactId) {
    errors.push('Please select a contact for this lead');
  }
  
  if (!data.leadSource) {
    errors.push('Lead source is required');
  }
  
  if (!data.serviceOfInterest) {
    errors.push('Service of interest is required');
  }
  
  if (!data.date || new Date(data.date) < new Date().setHours(0, 0, 0, 0)) {
    errors.push('Lead date cannot be in the past');
  }
  
  return errors;
};

export const validateTicketData = (data) => {
  const errors = [];
  
  if (!data.customerId) {
    errors.push('Please select a customer for this ticket');
  }
  
  if (!data.subject || data.subject.trim().length < 3) {
    errors.push('Subject must be at least 3 characters long');
  }
  
  if (!data.description || data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }
  
  if (!data.department) {
    errors.push('Department is required');
  }
  
  return errors;
};

export const sanitizeData = (data) => {
  const sanitized = {};
  
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      sanitized[key] = data[key].trim();
    } else {
      sanitized[key] = data[key];
    }
  });
  
  return sanitized;
};