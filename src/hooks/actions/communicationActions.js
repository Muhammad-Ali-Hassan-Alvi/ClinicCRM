export const createCommunicationActions = (setState, logAction) => {
    
    const addMessageToConversation = (contactId, message) => {
        
    };

    const markConversationAsRead = (contactId) => {
        setState(prev => ({
            ...prev,
            conversations: prev.conversations.map(convo =>
                convo.contactId === contactId ? { ...convo, unreadCount: 0 } : convo
            ),
        }));
    };

    const addInstagramMessageToConversation = (conversationId, message, isNewConversation = false, newConversationData = null) => {
        
    };

    const markInstagramConversationAsRead = (conversationId) => {
        setState(prev => ({
            ...prev,
            instagramConversations: prev.instagramConversations.map(convo =>
                (convo.instagramUsername === conversationId || convo.contactId === conversationId)
                    ? { ...convo, unreadCount: 0 }
                    : convo
            ),
        }));
    };

    return {
        addMessageToConversation,
        markConversationAsRead,
        addInstagramMessageToConversation,
        markInstagramConversationAsRead,
    };
};