import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { wsClient } from '@/lib/websocket';
import { API_BASE_URL } from '@/config/api';
import debounce from 'lodash/debounce';

const ChatContext = createContext();

// Optional: Create notification sound
const messageSound = typeof Audio !== 'undefined' ? new Audio('/sounds/notification.mp3') : null;

export function ChatProvider({ children }) {
  // State declarations
  const [conversations, setConversations] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messageTimeouts, setMessageTimeouts] = useState({});
  const [messageIdMapping, setMessageIdMapping] = useState({});
  const [openTabs, setOpenTabs] = useState(new Set());
  const [tabMessages, setTabMessages] = useState({});
  const [messageStatus, setMessageStatus] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [typingStatus, setTypingStatus] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});

  // Store the last currentConversation in a ref for reconnection
  const lastCurrentConversationRef = useRef(null);

  // Debounced typing indicator
  const debouncedTypingIndicator = useCallback(
    debounce((conversationId, isTyping) => {
      if (!isConnected) return;
      wsClient.send({
        type: 'typing_status',
        conversation_id: conversationId,
        is_typing: isTyping
      });
    }, 500),
    [isConnected]
  );

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (messageSound) {
      messageSound.play().catch(error => {
        console.log('Error playing notification sound:', error);
      });
    }
  }, []);

  // WebSocket connection
  const connect = useCallback(() => {
    if (isConnected || isConnecting) {
      console.log('Already connected or connecting, skipping connect');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found');
      setError('Authentication required');
      return;
    }

    console.log('Initiating WebSocket connection...');
    setIsConnecting(true);
    wsClient.connect(token);
  }, [isConnected, isConnecting]);

  // Load message history for a conversation
  const loadMessageHistory = useCallback(async (conversationId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/messaging/conversations/${conversationId}/messages/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const data = await response.json();
      const messages = data.results || [];

      // Update messages in tabMessages
      setTabMessages(prev => ({
        ...prev,
        [conversationId]: messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender_id: msg.sender,
          receiver_id: msg.receiver,
          sender_username: msg.sender_username,
          receiver_username: msg.receiver_username,
          conversation_id: msg.conversation,
          timestamp: msg.timestamp,
          is_read: msg.is_read,
          status: 'sent'
        }))
      }));

      // Mark messages as read
      const unreadMessages = messages
        .filter(msg => !msg.is_read)
        .map(msg => msg.id);

      if (unreadMessages.length > 0) {
        wsClient.send({
          type: 'mark_read',
          conversation_id: conversationId,
          message_ids: unreadMessages
        });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    }
  }, []);

  // Helper function to join a conversation
  const joinConversation = useCallback(async (conversationId) => {
    if (!isConnected) {
      connect();
      // Wait for connection
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 5000);

        const checkConnection = setInterval(() => {
          if (isConnected) {
            clearInterval(checkConnection);
            clearTimeout(timeout);
            resolve();
          }
        }, 100);

        // Clean up on unmount
        return () => {
          clearInterval(checkConnection);
          clearTimeout(timeout);
        };
      });
    }

    // Join the conversation room
    wsClient.send({
      type: 'join_conversation',
      conversation_id: conversationId
    });
  }, [isConnected, connect]);

  // Chat tab management
  const openChat = useCallback(async (conversationId) => {
    setOpenTabs(prev => new Set([...prev, conversationId]));

    try {
      // Load message history
      await loadMessageHistory(conversationId);

      // Join the conversation
      await joinConversation(conversationId);

      // Set as current conversation
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setCurrentConversation(conversation);
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      setError('Failed to open chat: ' + error.message);
    }
  }, [loadMessageHistory, joinConversation, conversations]);

  const closeChat = useCallback((conversationId) => {
    setOpenTabs(prev => {
      const next = new Set(prev);
      next.delete(conversationId);
      return next;
    });

    // Leave conversation room
    if (isConnected) {
      wsClient.send({
        type: 'leave_conversation',
        conversation_id: conversationId
      });
    }
  }, [isConnected]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      setError(null); // Clear any previous errors

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/messaging/conversations/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load conversations: ${response.statusText}`);
      }

      const data = await response.json();

      // Initialize conversations from the results array
      const loadedConversations = data.results || [];
      console.log('Loaded conversations:', loadedConversations);

      // Process conversations to ensure proper structure
      const processedConversations = loadedConversations.map(conv => {
        const userId = localStorage.getItem('userId');

        // Extract other user info from the conversation data
        const otherUser = {
          id: conv.seller,
          name: conv.other_user?.username || `User ${conv.seller}`,
          avatar: conv.other_user?.avatar || null,
          full_name: conv.other_user?.full_name || ''
        };

        return {
          id: conv.id,
          seller_id: conv.seller,
          buyer_id: conv.buyer,
          car_id: conv.car,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          last_message: conv.latest_message,
          unread_count: conv.unread_count,
          other_user: otherUser,
          car_details: conv.car_details
        };
      });

      setConversations(processedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError(error.message || 'Failed to load conversations');
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // Load conversations on mount and token change
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      loadConversations();
    } else {
      setConversations([]);
    }
  }, [loadConversations]);

  // Start a new conversation
  const startConversation = useCallback(async (sellerId, carId, sellerDetails) => {
    try {
      // Connect if not already connected
      if (!isConnected) {
        connect();
        // Wait for connection
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Connection timeout'));
          }, 5000);

          const checkConnection = setInterval(() => {
            if (isConnected) {
              clearInterval(checkConnection);
              clearTimeout(timeout);
              resolve();
            }
          }, 100);

          // Clean up on unmount
          return () => {
            clearInterval(checkConnection);
            clearTimeout(timeout);
          };
        });
      }

      // Create a temporary conversation object with seller details
      const tempConversation = {
        seller_id: sellerId,
        car_id: carId,
        other_user: {
          id: sellerId,
          name: sellerDetails.username,
          avatar: sellerDetails.avatar || null,
          full_name: [sellerDetails.first_name, sellerDetails.last_name].filter(Boolean).join(' ')
        }
      };

      // Store the temporary conversation
      setCurrentConversation(tempConversation);

      console.log('Starting conversation with:', { sellerId, carId, sellerDetails });
      wsClient.startConversation(sellerId, carId);
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError('Failed to start conversation: ' + error.message);
      throw error;
    }
  }, [isConnected, connect]);

  // Handle incoming messages
  const handleMessage = useCallback((data) => {
    console.log('Received message:', data);

    switch (data.type) {
      case 'connection_established': {
        const { user_id, username } = data;
        console.log('Connection established for user:', username);

        setIsConnected(true);
        setIsConnecting(false);
        setError(null);

        // Only join conversations that are in openTabs
        openTabs.forEach(conversationId => {
          wsClient.send({
            type: 'join_conversation',
            conversation_id: conversationId
          });
        });

        // Restore current conversation if it existed
        if (lastCurrentConversationRef.current) {
          setCurrentConversation(lastCurrentConversationRef.current);
        }
        break;
      }

      case 'conversation_joined': {
        const { conversation_id } = data;
        console.log('Successfully joined conversation:', conversation_id);

        // If this conversation isn't in our list yet, fetch conversations
        setConversations(prev => {
          if (!prev.some(conv => conv.id === conversation_id)) {
            loadConversations();
          }
          return prev;
        });

        // Load the message history for this conversation
        loadMessageHistory(conversation_id);
        break;
      }

      case 'chat_message': {
        const { conversation_id, message } = data;
        if (!conversation_id || !message) {
          console.error('Invalid message data received:', data);
          return;
        }

        const currentUserId = Number(localStorage.getItem('userId'));
        const isOwnMessage = message.sender_id === currentUserId;

        // Format message with server data
        const formattedMessage = {
          id: message.id,
          content: message.content,
          sender_id: message.sender_id,
          receiver_id: message.receiver_id,
          sender_username: message.sender_username,
          receiver_username: message.receiver_username,
          conversation_id: conversation_id,
          timestamp: message.timestamp,
          status: 'sent',
          is_read: message.is_read || false
        };

        // Update messages for the conversation
        setTabMessages(prev => {
          const conversationMessages = prev[conversation_id] || [];

          // Try to find and replace temporary message
          const tempMessage = conversationMessages.find(msg =>
            msg.is_temporary &&
            msg.content === formattedMessage.content &&
            Math.abs(new Date(msg.timestamp) - new Date(formattedMessage.timestamp)) < 60000
          );

          if (tempMessage) {
            // Replace temporary message with real one
            return {
              ...prev,
              [conversation_id]: conversationMessages.map(msg =>
                msg.id === tempMessage.id ? formattedMessage : msg
              )
            };
          }

          // If no temporary message found, add as new message
          return {
            ...prev,
            [conversation_id]: [...conversationMessages, formattedMessage]
          };
        });

        // Update conversation list with latest message
        setConversations(prev => {
          const updatedConversations = prev.map(conv =>
            conv.id === conversation_id
              ? {
                ...conv,
                last_message: formattedMessage,
                updated_at: new Date().toISOString(),
                unread_count: isOwnMessage ? conv.unread_count : (conv.unread_count || 0) + 1
              }
              : conv
          );

          if (!prev.some(conv => conv.id === conversation_id)) {
            loadConversations();
          }

          return updatedConversations;
        });

        // Play notification sound for incoming messages
        if (!isOwnMessage) {
          playNotificationSound();
        }

        break;
      }

      case 'messages_read': {
        const { conversation_id, message_ids } = data;

        // Update message read status
        setTabMessages(prev => {
          const conversationMessages = prev[conversation_id] || [];
          return {
            ...prev,
            [conversation_id]: conversationMessages.map(msg =>
              message_ids.includes(msg.id)
                ? { ...msg, is_read: true }
                : msg
            )
          };
        });

        // Reset unread count for the conversation
        setConversations(prev =>
          prev.map(conv =>
            conv.id === conversation_id
              ? { ...conv, unread_count: 0 }
              : conv
          )
        );

        setUnreadCounts(prev => ({
          ...prev,
          [conversation_id]: 0
        }));
        break;
      }

      case 'typing_status': {
        const { conversation_id, user_id, is_typing } = data;
        setTypingStatus(prev => ({
          ...prev,
          [conversation_id]: {
            ...prev[conversation_id],
            [user_id]: is_typing
          }
        }));
        break;
      }

      case 'error':
        console.error('WebSocket error:', data.message);
        setError(data.message || 'An error occurred');
        break;

      case 'new_message_notification': {
        const { message } = data;
        const conversation_id = message.conversation_id || message.conversation;
        const currentUserId = Number(localStorage.getItem('userId'));
        const isOwnMessage = message.sender_id === currentUserId;

        // Format message
        const formattedMessage = {
          id: message.id,
          content: message.content,
          sender_id: message.sender_id,
          receiver_id: message.receiver_id,
          sender_username: message.sender_username || message.sender_name,
          receiver_username: message.receiver_username,
          conversation_id: conversation_id,
          timestamp: message.timestamp,
          status: 'sent',
          is_read: message.is_read || false
        };

        setTabMessages(prev => {
          const conversationMessages = prev[conversation_id] || [];
          // Prevent duplicates
          if (conversationMessages.some(msg => msg.id === formattedMessage.id)) {
            return prev;
          }
          return {
            ...prev,
            [conversation_id]: [...conversationMessages, formattedMessage]
          };
        });

        // If the conversation is not open, increment unread count
        setConversations(prev => prev.map(conv =>
          conv.id === conversation_id
            ? {
              ...conv,
              unread_count: isOwnMessage ? conv.unread_count : (conv.unread_count || 0) + 1,
              last_message: formattedMessage
            }
            : conv
        ));

        // Play notification sound for incoming messages
        if (!isOwnMessage) {
          playNotificationSound();
        }
        break;
      }

      default:
        console.warn('Unknown message type received:', data.type);
    }
  }, [loadConversations, loadMessageHistory, playNotificationSound]);

  // Store current conversation in ref when it changes
  useEffect(() => {
    lastCurrentConversationRef.current = currentConversation;
  }, [currentConversation]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping) => {
    if (!currentConversation || !isConnected) return;
    debouncedTypingIndicator(currentConversation.id, isTyping);
  }, [currentConversation, isConnected, debouncedTypingIndicator]);

  // Send a message
  const sendMessage = useCallback((message) => {
    if (!isConnected) {
      console.error('Cannot send message: WebSocket not connected');
      return;
    }

    if (!currentConversation) {
      console.error('Cannot send message: No active conversation');
      return;
    }

    const currentUserId = Number(localStorage.getItem('userId'));
    const isSeller = currentUserId === currentConversation.seller_id;
    const receiverId = isSeller ? currentConversation.buyer_id : currentConversation.seller_id;
    const conversationId = currentConversation.id;

    console.log('Sending message:', {
      conversationId,
      message,
      receiverId
    });

    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: message,
      sender_id: currentUserId,
      receiver_id: receiverId,
      sender_username: 'You',
      receiver_username: currentConversation.other_user?.name || 'Recipient',
      conversation_id: conversationId,
      timestamp: new Date().toISOString(),
      status: 'sending',
      is_temporary: true
    };

    setTabMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), tempMessage]
    }));

    try {
      wsClient.send({
        type: 'chat_message',
        conversation_id: conversationId,
        message: message,
        receiver_id: receiverId
      });

      const timeoutId = setTimeout(() => {
        setMessageStatus(prev => ({
          ...prev,
          [tempMessage.id]: 'failed'
        }));
      }, 10000);

      setMessageTimeouts(prev => ({
        ...prev,
        [tempMessage.id]: timeoutId
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      setTabMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId].filter(msg => !msg.is_temporary)
      }));
    }
  }, [currentConversation, isConnected]);


  // Setup WebSocket listeners
  useEffect(() => {
    const handleConnect = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);

      // Force join all open tabs immediately
      openTabs.forEach(conversationId => {
        wsClient.send({
          type: 'join_conversation',
          conversation_id: conversationId
        });
      });

      // Restore current conversation if it existed
      if (lastCurrentConversationRef.current) {
        setCurrentConversation(lastCurrentConversationRef.current);
      }
    };


    const handleDisconnect = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setIsConnecting(false);
    };

    const handleError = (error) => {
      console.error('WebSocket error:', error);
      setIsConnecting(false);
      setError('Connection error: ' + error.message);
    };

    wsClient.on('connected', handleConnect);
    wsClient.on('disconnected', handleDisconnect);
    wsClient.on('error', handleError);
    wsClient.on('message', handleMessage);

    return () => {
      wsClient.off('connected', handleConnect);
      wsClient.off('disconnected', handleDisconnect);
      wsClient.off('error', handleError);
      wsClient.off('message', handleMessage);
    };
  }, [handleMessage]);

  // Auto-reconnect on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected && !isConnecting) {
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connect, isConnected, isConnecting]);

  const value = {
    // Connection state
    isConnected,
    isConnecting,
    error,
    connect,

    // Conversations
    conversations,
    isLoadingConversations,
    currentConversation,
    loadConversations,

    // Chat tabs
    openTabs,
    tabMessages,
    messageStatus,
    typingStatus,
    unreadCounts,

    // Actions
    openChat,
    closeChat,
    sendMessage,
    sendTypingIndicator,
    startConversation
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 