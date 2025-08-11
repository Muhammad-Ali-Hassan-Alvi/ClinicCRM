import { useToast } from '@/components/ui/use-toast';
import { useLocale } from '@/contexts/LocaleContext';
import { createContactActions } from './actions/contactActions';
import { createLeadCustomerActions } from './actions/leadCustomerActions';
import { createTicketActions } from './actions/ticketActions';
import { createSettingsActions } from './actions/settingsActions';
import { createMiscActions } from './actions/miscActions';
import { createReminderActions } from './actions/reminderActions';
import { createTeamChatActions } from './actions/teamChatActions';

const useDataActions = (dataState) => {
  const { toast: showToast } = useToast();
  const { t } = useLocale();
  const toast = (options) => {
    const title = options.titleKey ? t(options.titleKey) : options.title;
    const description = options.descriptionKey ? t(options.descriptionKey, options.descriptionValues) : options.description;
    showToast({ 
      ...options, 
      title,
      description
    });
  };
  
  const { refreshData } = dataState;

  const performDbAction = async (action, successToast, errorTitleKey) => {
    try {
      const result = await action();
      if (result && result.error) {
        let userFriendlyMessage = 'Database operation failed. Please try again.';
        
        if (result.error.message) {
          const errorMessage = result.error.message.toLowerCase();
          if (errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint')) {
            userFriendlyMessage = 'This record already exists in the database';
          } else if (errorMessage.includes('foreign key') || errorMessage.includes('violates foreign key')) {
            userFriendlyMessage = 'This action cannot be completed due to related data';
          } else if (errorMessage.includes('not null') || errorMessage.includes('null value')) {
            userFriendlyMessage = 'Please fill in all required fields';
          } else if (errorMessage.includes('permission denied') || errorMessage.includes('insufficient privilege')) {
            userFriendlyMessage = 'You do not have permission to perform this action';
          } else if (errorMessage.includes('connection') || errorMessage.includes('network')) {
            userFriendlyMessage = 'Network connection error. Please check your internet connection.';
          }
        }
          
        toast({ 
          title: t(errorTitleKey) || "Operation Failed", 
          description: userFriendlyMessage, 
          variant: 'destructive' 
        });
        return false;
      }
      if (successToast) {
        toast(successToast);
      }
      await refreshData();
      return result || true;
    } catch (error) {
      let userFriendlyMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.message) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('failed to fetch') || errorMessage.includes('network error')) {
          userFriendlyMessage = 'Network connection error. Please check your internet connection.';
        } else if (errorMessage.includes('jwt') || errorMessage.includes('token')) {
          userFriendlyMessage = 'Session expired. Please log in again.';
        } else if (errorMessage.includes('timeout')) {
          userFriendlyMessage = 'Request timed out. Please try again.';
        }
      }
        
      toast({ 
        title: t(errorTitleKey) || "Operation Failed", 
        description: userFriendlyMessage, 
        variant: 'destructive' 
      });
      return false;
    }
  };

  const sharedArgs = { performDbAction, toast, t, refreshData, dataState };

  const contactActions = createContactActions(sharedArgs);
  const leadCustomerActions = createLeadCustomerActions(sharedArgs);
  const ticketActions = createTicketActions(sharedArgs);
  const settingsActions = createSettingsActions(sharedArgs);
  const miscActions = createMiscActions(sharedArgs);
  const reminderActions = createReminderActions(sharedArgs);
  const teamChatActions = createTeamChatActions(sharedArgs);
  
  return {
    ...contactActions,
    ...leadCustomerActions,
    ...ticketActions,
    ...settingsActions,
    ...miscActions,
    ...reminderActions,
    ...teamChatActions,
  };
};

export default useDataActions;