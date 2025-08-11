export const general = {
  sidebar: {
    dashboard: 'Dashboard',
    reports: 'Reports',
    contacts: 'Contacts',
    leads: 'Leads',
    customers: 'Customers',
    tickets: 'Tickets',
    fileCenter: 'File Center',
    whatsapp: 'WhatsApp',
    instagram: 'Instagram Chat',
    email: 'Email',
    teamChat: 'Team Chat',
    settings: 'Settings',
    auditLog: 'Activity History',
    clinicCrm: 'Clinic CRM',
    allRightsReserved: 'All rights reserved.'
  },
  login: {
    title: 'Welcome Back!',
    description: 'Log in to your account to access the dashboard.',
    username: 'Username',
    password: 'Password',
    branch: 'Branch',
    loginButton: 'Login',
    selectBranch: 'Select a Branch',
  },
  userMenu: {
    profile: 'Profile',
    changePassword: 'Change Password',
    logout: 'Logout',
    switchBranch: 'Switch Branch',
  },
  changePassword: {
    title: 'Change Password',
    description: 'Update your password for better security.',
    oldPassword: 'Old Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    success: {
      title: 'Password Changed!',
      description: 'Your password has been updated successfully.',
    },
    errors: {
      mismatch: 'The new passwords do not match.',
      length: 'Password must be at least 4 characters long.',
      incorrect: 'The old password is incorrect.',
    },
  },
  actions: {
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    edit: 'Edit',
    send: 'Send',
    close: 'Close',
  },
  languageSwitcher: {
    changeLanguage: 'Change Language',
  },
  dashboard: {
    title: 'Dashboard',
    description: 'Overview of your clinic\'s system activity.',
    todaysAppointments: "Today's Appointments",
    birthdayReminders: 'Birthday Reminders',
    noAppointments: 'No appointments scheduled for today.',
    noBirthdays: 'No upcoming birthdays in the next 2 days.',
    birthdayToday: 'Birthday Today! 🎉',
    birthdayTomorrow: 'Birthday Tomorrow!',
    birthdayInDays: 'Birthday in {{days}} days!',
    updateStatus: 'Update Status'
  },
  record: {
    comments: 'Comments',
    addCommentPlaceholder: 'Add a comment... Use @ to mention a team member.',
    details: 'Details',
    notes: 'Notes',
    attachments: 'Attachments',
    instagram: 'Instagram'
  },
  export: {
    export: 'Export',
    exportToExcel: 'Export to Excel',
    exportToPdf: 'Export to PDF',
    includeNotes: 'Include Internal Notes',
    noDataToExport: 'No data to export',
  },
  toasts: {
    reminderSent: {
      title: 'Reminder Sent (Simulated)',
      appointmentDesc: 'Appointment reminder sent for {{name}}.',
      birthdayDesc: 'Birthday reminder sent for {{name}}.',
    },
    exportSuccess: {
      title: 'Export Successful',
      description: 'Your file has been downloaded.',
      whatsapp: 'WhatsApp history exported and saved to customer files.'
    },
    exportError: {
      title: 'Export Failed',
      description: 'No data available to export.',
      customerNotFound: 'Customer information not found.',
      pdfError: 'An error occurred while creating the PDF.'
    },
    statusUpdated: {
      title: 'Status Updated',
      description: 'Contact status changed to {{status}}'
    },
    contactUpdated: {
      title: 'Contact Updated',
      description: '{{name}}\'s details have been updated.'
    },
    leadStatusUpdated: {
      title: 'Lead Status Updated',
      description: 'Lead moved to {{status}}'
    },
    leadUpdated: {
      title: 'Lead Updated',
      description: 'Lead for {{name}} has been updated successfully.'
    },
    contactAdded: {
      title: 'Contact Added! 🎉',
      description: '{{name}} is now in your contacts.'
    },
    leadCreated: {
      title: 'Lead Created! 🚀',
      description: 'New lead created for {{name}}.'
    },
    leadConverted: {
      title: 'Lead Converted! ✨',
      description: '{{name}} is now a customer.'
    },
    noShowAction: {
      title: 'No-Show Action',
      description: '{{name}} moved to leads for re-follow up.'
    },
    ticketCreated: {
      title: 'Ticket Created! 🎫',
      description: 'New ticket created for {{name}}.'
    },
    ticketUpdated: {
      title: 'Ticket Updated',
      description: 'Ticket status changed to {{status}}.'
    },
    customerUpdated: {
      title: 'Customer Updated',
      description: '{{name}} has been updated successfully.'
    },
    unknownContact: {
      title: 'Unknown Contact',
      description: 'Please create a contact for this number first.'
    },
    settingsUpdated: {
      title: 'Settings Updated',
      description: 'Your changes have been saved successfully.'
    },
    appointmentRequested: {
      title: 'Appointment Requested! ✅',
      description: 'Thank you, {{name}}. We have received your request and will confirm shortly.',
    },
    calendarSync: {
      connecting: {
        title: 'Connecting to calendar...',
        description: 'Redirecting to authentication page (simulated).'
      },
      connected: {
        title: 'Calendar Linked! ✅',
        description: 'Successfully connected to {{provider}} calendar.'
      },
      synced: {
        title: 'Appointment Synced! 🗓️',
        description: '{{name}}\'s appointment has been synced with {{calendars}}.'
      }
    },
    backup: {
      started: {
        title: 'Backup In Progress',
        description: 'A backup of your data is being created. This may take a moment.',
      },
      success: {
        title: 'Backup Complete!',
        description: 'Downloading your ZIP backup file.',
      },
      error: {
        title: 'Backup Failed',
        description: 'Could not create backup. Please try again.',
      },
    },
    autoWhatsapp: {
      title: 'Automated WhatsApp Message',
      description: '{{type}} message sent to {{name}}.',
    },
    commentAdded: {
      title: 'Comment Added',
      description: 'Your comment has been posted.',
    },
    noteUpdated: {
      title: 'Note Updated',
      description: 'The note has been updated successfully.'
    },
    attachmentsUpdated: {
      title: 'Attachments Updated',
      description: 'The attachments have been updated successfully.'
    },
    requiredFields: {
      title: 'Required Fields Missing',
      description: 'Please fill in all required fields.'
    },
    fileUploaded: {
      title: 'File Uploaded',
      description: '{{fileName}} has been added to the knowledge base.'
    },
    fileUpdated: {
      title: 'File Updated',
      description: 'File details have been updated successfully.'
    },
    fileDeleted: {
      title: 'File Deleted',
      description: 'File has been removed from the knowledge base.'
    },
    aiStatusUpdated: {
      title: 'AI Status Updated',
      description: 'File has been {{status}} for AI use.'
    }
  }
};