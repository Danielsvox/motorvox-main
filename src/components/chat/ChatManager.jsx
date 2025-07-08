import React, { useState, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { ConversationsPanel } from './ConversationsPanel';
import { MiniChatTab } from './MiniChatTab';
import { ChatBubbleIcon } from '@radix-ui/react-icons';

export default function ChatManager() {
  const [showConversations, setShowConversations] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { openTabs, closeChat } = useChat();

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);

    // Listen for auth changes
    const handleStorage = () => {
      const newToken = localStorage.getItem('authToken');
      setIsAuthenticated(!!newToken);
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Message Icon */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 rounded-full h-12 w-12"
        onClick={() => setShowConversations(prev => !prev)}
      >
        <ChatBubbleIcon className="h-6 w-6" />
      </Button>

      {/* Conversations Panel */}
      {showConversations && (
        <ConversationsPanel
          onClose={() => setShowConversations(false)}
        />
      )}

      {/* Chat Tabs */}
      {Array.from(openTabs).map((conversationId, index) => (
        <MiniChatTab
          key={conversationId}
          conversationId={conversationId}
          onClose={() => closeChat(conversationId)}
          style={{
            right: `${(index + (showConversations ? 1 : 0)) * 320}px`
          }}
        />
      ))}
    </>
  );
} 