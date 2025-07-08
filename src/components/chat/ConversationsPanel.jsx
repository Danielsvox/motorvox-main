import React, { useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ConversationsPanel({ onClose }) {
  const { 
    conversations, 
    isLoadingConversations,
    error, 
    loadConversations,
    openChat
  } = useChat();

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Less than 24 hours
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // Less than 7 days
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    // Otherwise
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderContent = () => {
    if (error) {
      return (
        <Alert variant="destructive" className="m-4">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={loadConversations}
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    if (isLoadingConversations) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Loading conversations...
        </div>
      );
    }

    if (!Array.isArray(conversations) || conversations.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No conversations yet
        </div>
      );
    }

    return (
      <div className="divide-y">
        {conversations.map(conversation => (
          <button
            key={conversation.id}
            className="w-full p-4 hover:bg-accent text-left flex items-start gap-3 focus:outline-none focus:bg-accent"
            onClick={() => openChat(conversation.id)}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              {conversation.other_user?.name?.[0] || '?'}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-medium truncate">
                  {conversation.other_user?.name || 'Unknown User'}
                </p>
                {conversation.last_message?.timestamp && (
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatTimestamp(conversation.last_message.timestamp)}
                  </span>
                )}
              </div>
              
              {conversation.last_message?.content && (
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.last_message.sender_id === localStorage.getItem('userId')
                    ? `You: ${conversation.last_message.content}`
                    : conversation.last_message.content}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed right-0 bottom-0 w-80 bg-background border rounded-tl-lg shadow-lg">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Messages</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadConversations}
            disabled={isLoadingConversations}
          >
            <ReloadIcon className={`h-4 w-4 ${isLoadingConversations ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        {renderContent()}
      </ScrollArea>
    </div>
  );
} 