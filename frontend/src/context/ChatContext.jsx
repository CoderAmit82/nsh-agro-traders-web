import React, { createContext, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { API_BASE } from '../config/api';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);

  // Fetch conversations list for Admin
  const fetchConversations = async () => {
    if (!token || user?.role !== 'admin') return;
    setLoadingConversations(true);
    try {
      const response = await fetch(`${API_BASE}/messages/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error('Error fetching admin conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Fetch chat history with specific user
  // If user is a farmer, this userId will be 'admin' to load messages with staff.
  const fetchHistory = async (targetUserId) => {
    if (!token) return;
    setLoadingHistory(true);
    try {
      const response = await fetch(`${API_BASE}/messages/history/${targetUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Error fetching message history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Send a new message
  const sendMessage = async (messageText, receiverId = null) => {
    if (!token) return { success: false, message: 'Not authenticated' };

    try {
      const bodyData = { messageText };
      if (receiverId) {
        bodyData.receiverId = receiverId;
      }

      const response = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });
      const data = await response.json();

      if (data.success) {
        // Add new message to local state
        setMessages(prev => [...prev, data.message]);

        // If admin, refresh conversation list so last message updates
        if (user?.role === 'admin') {
          fetchConversations();
        }
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Error sending message:', err);
      return { success: false, message: 'Server communication error' };
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        conversations,
        activeConversation,
        setActiveConversation,
        loadingHistory,
        loadingConversations,
        fetchConversations,
        fetchHistory,
        sendMessage
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
