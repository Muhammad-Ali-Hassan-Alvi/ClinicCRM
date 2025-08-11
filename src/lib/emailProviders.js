export const emailProviders = {
  gmail: {
    name: 'Gmail',
    domains: ['gmail.com', 'googlemail.com'],
    settings: {
      imap: {
        host: 'imap.gmail.com',
        port: 993,
        secure: true
      },
      smtp: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true
      }
    }
  },
  outlook: {
    name: 'Outlook/Hotmail',
    domains: ['outlook.com', 'hotmail.com', 'live.com', 'msn.com'],
    settings: {
      imap: {
        host: 'outlook.office365.com',
        port: 993,
        secure: true
      },
      smtp: {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        requireTLS: true
      }
    }
  },
  yahoo: {
    name: 'Yahoo Mail',
    domains: ['yahoo.com', 'yahoo.co.uk', 'yahoo.ca', 'yahoo.com.au'],
    settings: {
      imap: {
        host: 'imap.mail.yahoo.com',
        port: 993,
        secure: true
      },
      smtp: {
        host: 'smtp.mail.yahoo.com',
        port: 587,
        secure: false,
        requireTLS: true
      }
    }
  },
  zoho: {
    name: 'Zoho Mail',
    domains: ['zoho.com', 'zohomail.com'],
    settings: {
      imap: {
        host: 'imap.zoho.com',
        port: 993,
        secure: true
      },
      smtp: {
        host: 'smtp.zoho.com',
        port: 587,
        secure: false,
        requireTLS: true
      }
    }
  },
  icloud: {
    name: 'iCloud Mail',
    domains: ['icloud.com', 'me.com', 'mac.com'],
    settings: {
      imap: {
        host: 'imap.mail.me.com',
        port: 993,
        secure: true
      },
      smtp: {
        host: 'smtp.mail.me.com',
        port: 587,
        secure: false,
        requireTLS: true
      }
    }
  },
  generic: {
    name: 'Generic Email',
    domains: [],
    settings: {
      imap: {
        host: 'mail.{domain}',
        port: 993,
        secure: true
      },
      smtp: {
        host: 'mail.{domain}',
        port: 587,
        secure: false,
        requireTLS: true
      }
    }
  }
};

export const detectEmailProvider = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();

  for (const [key, provider] of Object.entries(emailProviders)) {
    if (provider.domains.includes(domain)) {
      return provider;
    }
  }

  const genericProvider = { ...emailProviders.generic };
  genericProvider.settings.imap.host = genericProvider.settings.imap.host.replace('{domain}', domain);
  genericProvider.settings.smtp.host = genericProvider.settings.smtp.host.replace('{domain}', domain);
  genericProvider.name = `${domain} Mail`;

  return genericProvider;
};

export const testEmailConnection = async (email, password, provider) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const hasPassword = password && password.length >= 4;

    if (!isValidEmail) {
      return { success: false, error: 'Invalid email format' };
    }

    if (!hasPassword) {
      return { success: false, error: 'Password is required' };
    }

    const successRate = Math.random();
    if (successRate > 0.1) {
      return {
        success: true,
        provider: provider.name,
        settings: provider.settings
      };
    } else {
      return {
        success: false,
        error: 'Authentication failed. Please check your credentials.'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Connection timeout. Please try again.'
    };
  }
};

// export const sendEmail = async (emailAccount, emailData) => {
//   try {
//     await new Promise(resolve => setTimeout(resolve, 1500));

//     const { to, subject, body, attachments = [] } = emailData;

//     if (!to || !subject || !body) {
//       throw new Error('Missing required email fields');
//     }

//     const successRate = Math.random();
//     if (successRate > 0.05) {
//       return {
//         success: true,
//         messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//         timestamp: new Date().toISOString()
//       };
//     } else {
//       throw new Error('Failed to send email. Please try again.');
//     }
//   } catch (error) {
//     return {
//       success: false,
//       error: error.message
//     };
//   }
// };

export async function sendEmail(account, emailData) {
  console.log(account,emailData);
  try {
    const response = await fetch("https://auvpuouphxdkrajmnruo.supabase.co/functions/v1/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: emailData.to,
        from : "awaismahaar500@gmail.com",
        subject: emailData.subject,
        message: emailData.body,
      }),
    });
   
    const data = await response.json();

    if (!response.ok) {
      console.error("Resend error:", data);
      return { success: false, error: data?.message || "Failed to send email" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Network error:", error);
    return { success: false, error: error.message };
  }
}

export const fetchEmails = async (emailAccount, options = {}) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { limit = 50, since = null } = options;

    const mockEmails = [
      {
        id: `email_${Date.now()}_1`,
        from: 'patient@example.com',
        to: emailAccount.email,
        subject: 'Appointment Inquiry',
        body: 'Hello, I would like to schedule an appointment for next week. Please let me know your availability.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false,
        attachments: []
      },
      {
        id: `email_${Date.now()}_2`,
        from: 'info@labresults.com',
        to: emailAccount.email,
        subject: 'Lab Results Available',
        body: 'Your recent lab results are now available. Please log in to your patient portal to view them.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: true,
        attachments: []
      }
    ];

    return {
      success: true,
      emails: mockEmails.slice(0, limit)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};