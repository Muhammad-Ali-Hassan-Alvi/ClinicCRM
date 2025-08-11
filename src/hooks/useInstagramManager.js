import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';

export const useInstagramManager = () => {
  const { instagramConversations, settings, currentUser } = useData();
  const { contactId } = useParams();
  const navigate = useNavigate();

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState('all');

  const instagramAccounts = useMemo(() => settings.instagramAccounts || [], [settings.instagramAccounts]);

  const connectedAccounts = useMemo(() => instagramAccounts.filter(n => n.status === 'connected'), [instagramAccounts]);

  const accessibleAccounts = useMemo(() => {
    if (currentUser?.role === 'Admin') {
      return connectedAccounts;
    }
    return connectedAccounts.filter(account => {
      if (account.assignedUsers.length === 0) return true;
      return account.assignedUsers.includes(currentUser?.id);
    });
  }, [connectedAccounts, currentUser]);

  const filteredConversations = useMemo(() => {
    return instagramConversations.filter(conv => {
      if (selectedAccount === 'all') return true;
      return conv.instagramAccountId === selectedAccount;
    });
  }, [instagramConversations, selectedAccount]);
  
  const sortedConversations = useMemo(() => {
    return [...filteredConversations].sort((a, b) => new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp));
  }, [filteredConversations]);

  useEffect(() => {
    const conversationId = contactId;
    if (conversationId) {
      const conversation = sortedConversations.find(c => c.contactId === conversationId || c.instagramUsername === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
      } else if (sortedConversations.length > 0) {
        const firstConvoId = sortedConversations[0].contactId || sortedConversations[0].instagramUsername;
        navigate(`/instagram/${firstConvoId}`, { replace: true });
      } else {
        navigate('/instagram', { replace: true });
      }
    } else if (sortedConversations.length > 0) {
      const firstConvo = sortedConversations[0];
      const firstConvoId = firstConvo.contactId || firstConvo.instagramUsername;
      navigate(`/instagram/${firstConvoId}`, { replace: true });
    } else {
      setSelectedConversation(null);
    }
  }, [contactId, navigate, sortedConversations]);

  const handleSelectConversation = (conversation) => {
    const conversationId = conversation.contactId || conversation.instagramUsername;
    setSelectedConversation(conversation);
    navigate(`/instagram/${conversationId}`);
  };

  const getAccountLabel = (accountId) => {
    const account = connectedAccounts.find(a => a.id === accountId);
    return account ? account.username : 'Unknown Account';
  };

  return {
    accessibleAccounts,
    selectedAccount,
    setSelectedAccount,
    sortedConversations,
    selectedConversation,
    handleSelectConversation,
    getAccountLabel,
  };
};