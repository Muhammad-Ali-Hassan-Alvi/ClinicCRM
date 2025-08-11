export const initialState = {
  contacts: [
    {
      id: '1',
      fullName: 'Ahmed Saleh',
      phoneNumber: '+971501234567',
      secondaryPhoneNumber: '+971521234567',
      address: 'Dubai Marina, Dubai',
      source: 'Instagram',
      birthday: '1990-05-15',
      branchId: 'branch-1',
      instagramUrl: 'https://instagram.com/ahmed_saleh',
      notes: [
        { id: 'note-1', text: 'Interested in laser hair removal treatment', createdAt: '2024-01-15T10:00:00Z' }
      ],
      attachments: [],
      comments: [],
      history: [],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      fullName: 'Sarah Johnson',
      phoneNumber: '+971507654321',
      secondaryPhoneNumber: '',
      address: 'Business Bay, Dubai',
      source: 'WhatsApp',
      birthday: '1985-08-22',
      branchId: 'branch-1',
      instagramUrl: '',
      notes: [
        { id: 'note-2', text: 'Regular customer, prefers morning appointments', createdAt: '2024-01-10T09:00:00Z' }
      ],
      attachments: [],
      comments: [],
      history: [],
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-10T09:00:00Z'
    }
  ],
  
  leads: [
    {
      id: '1',
      contactId: '1',
      contactFullName: 'Ahmed Saleh',
      leadSource: 'Instagram',
      serviceOfInterest: 'Laser Hair Removal',
      date: '2024-01-15',
      assignedAgent: 'Dr. Smith',
      status: 'Hot',
      department: 'Dermatology',
      branchId: 'branch-1',
      notesData: [
        { id: 'lead-note-1', text: 'Very interested, wants to book soon', createdAt: '2024-01-15T11:00:00Z' }
      ],
      attachments: [],
      comments: [],
      statusHistory: [],
      createdAt: '2024-01-15T11:00:00Z',
      updatedAt: '2024-01-15T11:00:00Z'
    }
  ],
  
  customers: [
    {
      id: '2',
      contactId: '2',
      contactFullName: 'Sarah Johnson',
      contactPhoneNumber: '+971507654321',
      leadSource: 'WhatsApp',
      department: 'Dermatology',
      status: 'Booked',
      appointmentDate: '2024-01-25T14:00:00Z',
      branchId: 'branch-1',
      notes: [
        { id: 'customer-note-1', text: 'Follow-up appointment for skin treatment', createdAt: '2024-01-20T10:00:00Z' }
      ],
      attachments: [],
      comments: [],
      statusHistory: [],
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z'
    }
  ],
  
  tickets: [],
  
  conversations: [
    {
      contactId: '1',
      contactName: 'Ahmed Saleh',
      contactAvatar: 'AS',
      lastMessage: 'Hi, I\'m interested in laser hair removal. Can you tell me more about the procedure?',
      lastMessageTimestamp: '2024-01-15T15:30:00Z',
      unreadCount: 1,
      whatsappNumberId: 'wa-1',
      branchId: 'branch-1',
      messages: [
        {
          id: 'msg-1',
          text: 'Hi, I\'m interested in laser hair removal. Can you tell me more about the procedure?',
          timestamp: '2024-01-15T15:30:00Z',
          sender: 'contact',
          type: 'message'
        }
      ]
    },
    {
      contactId: '+971509876543',
      contactName: '+971509876543',
      contactAvatar: '#',
      lastMessage: 'Hello, do you have appointments available this week?',
      lastMessageTimestamp: '2024-01-15T16:00:00Z',
      unreadCount: 1,
      whatsappNumberId: 'wa-1',
      branchId: 'branch-1',
      isUnknown: true,
      messages: [
        {
          id: 'msg-2',
          text: 'Hello, do you have appointments available this week?',
          timestamp: '2024-01-15T16:00:00Z',
          sender: 'contact',
          type: 'message'
        }
      ]
    }
  ],
  
  instagramConversations: [],
  emails: [],
  auditLog: [],
  teamChats: [
    {
      id: 'general',
      name: 'General',
      type: 'channel',
      participants: ['user-1', 'user-2', 'user-3'],
      messages: [
        {
          id: 'team-msg-1',
          text: 'Good morning team! Ready for another great day at the clinic.',
          timestamp: '2024-01-15T08:00:00Z',
          sender: 'Dr. Smith',
          senderId: 'user-1'
        }
      ]
    }
  ],
  
  settings: {
    branches: [
      { id: 'branch-1', name: 'Main Clinic - Dubai Marina', address: 'Dubai Marina, Dubai, UAE' },
      { id: 'branch-2', name: 'Branch Clinic - Business Bay', address: 'Business Bay, Dubai, UAE' }
    ],
    
    whatsappNumbers: [
      {
        id: 'wa-1',
        label: 'Main Reception',
        phoneNumber: '+971501234567',
        status: 'connected',
        assignedUsers: [],
        branchId: 'branch-1',
        connectedAt: '2024-01-10T09:00:00Z',
        createdAt: '2024-01-10T09:00:00Z'
      },
      {
        id: 'wa-2',
        label: 'Dr. Smith',
        phoneNumber: '+971507654321',
        status: 'connected',
        assignedUsers: ['user-1'],
        branchId: 'branch-1',
        connectedAt: '2024-01-12T10:00:00Z',
        createdAt: '2024-01-12T10:00:00Z'
      }
    ],
    
    users: [
      { id: 'user-1', name: 'Dr. Smith', role: 'Doctor', branchIds: ['branch-1'] },
      { id: 'user-2', name: 'Nurse Betty', role: 'Nurse', branchIds: ['branch-1'] },
      { id: 'user-3', name: 'Admin Staff', role: 'Admin', branchIds: ['branch-1', 'branch-2'] }
    ],
    
    departments: ['Dermatology', 'Pediatrics', 'Cardiology', 'General Check-up', 'Dental', 'Orthopedics'],
    leadStatuses: ['Fresh', 'Hot', 'Cold', 'In Progress', 'Lost', 'Booked', 'Converted', 'Re-follow', 'No-Show'],
    agents: ['Dr. Smith', 'Nurse Betty', 'Admin Staff', 'Unassigned'],
    
    aiKnowledgeBase: [
      {
        id: 'kb-1',
        title: 'Laser Hair Removal Guide',
        name: 'laser_hair_removal_guide.pdf',
        category: 'Procedures',
        description: 'Complete guide to laser hair removal procedures, pricing, and aftercare',
        type: 'application/pdf',
        size: 2048000,
        url: 'blob:knowledge-base-file-1',
        aiEnabled: true,
        uploadedBy: 'Admin',
        createdAt: '2024-01-10T10:00:00Z'
      },
      {
        id: 'kb-2',
        title: 'Treatment Price List 2024',
        name: 'price_list_2024.xlsx',
        category: 'Price List',
        description: 'Updated pricing for all treatments and procedures',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 1024000,
        url: 'blob:knowledge-base-file-2',
        aiEnabled: true,
        uploadedBy: 'Admin',
        createdAt: '2024-01-05T09:00:00Z'
      }
    ],
    
    fileCategories: ['Price List', 'Procedures', 'Promotions', 'FAQs', 'General Documents'],
    
    whatsappAutomation: {
      confirmation: {
        enabled: true,
        template: 'Hi {{name}}, your appointment for {{department}} is confirmed for {{date}} at {{time}}. See you soon!'
      },
      reminder: {
        enabled: true,
        template: 'Hi {{name}}, this is a reminder about your appointment tomorrow at {{time}} for {{department}}. Please confirm your attendance.'
      },
      feedback: {
        enabled: true,
        template: 'Hi {{name}}, thank you for visiting us today! We hope you had a great experience. Please let us know if you have any feedback.'
      }
    },
    
    reminders: {
      appointment: { enabled: true, method: 'SMS', template: 'Reminder: You have an appointment tomorrow at {{time}}.' },
      birthday: { enabled: true, method: 'SMS', template: 'Happy Birthday {{name}}! Wishing you a wonderful day.' }
    },
    
    calendarSync: { enabled: false, connectedCalendars: [] },
    backup: { schedule: 'manual', lastBackup: null, cloudSync: { enabled: false, provider: null } },
    exportSettings: { includeNotesDefault: true }
  }
};