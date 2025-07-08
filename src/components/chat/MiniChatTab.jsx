import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ReloadIcon, CheckIcon, CheckCircledIcon } from '@radix-ui/react-icons';

export function MiniChatTab({ conversationId, onClose, style }) {
  const [message, setMessage] = useState('');
  const scrollRef = useRef(null);
  const {
    tabMessages,
    messageStatus,
    isConnected,
    sendMessage,
    conversations
  } = useChat();

  const conversation = conversations.find(c => c.id === conversationId);
  const messages = tabMessages[conversationId] || [];
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !isConnected) return;

    sendMessage(message.trim());
    setMessage('');
  };

  const getMessageStatusIcon = (messageId) => {
    const status = messageStatus[messageId];
    switch (status) {
      case 'sending':
        return <ReloadIcon className="h-3 w-3 animate-spin text-muted-foreground" />;
      case 'sent':
        return <CheckIcon className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCircledIcon className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCircledIcon className="h-3 w-3 text-primary" />;
      default:
        return null;
    }
  };

  if (!conversation) return null;

  return (
    <div
      className="fixed bottom-0 w-80 bg-background border rounded-t-lg shadow-lg flex flex-col"
      style={{
        ...style,
        height: '400px'
      }}
    >
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
            {conversation.other_user.name[0]}
          </div>
          <span className="font-medium">{conversation.other_user.name}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-2 overflow-y-auto">
        <div className="space-y-2">
          {[...messages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).map((msg, i) => {
            const isCurrentUser = msg.sender_id === Number(currentUserId);
            const prevMsg = i > 0 ? messages[i - 1] : null;
            const showUsername = !prevMsg || prevMsg.sender_id !== msg.sender_id;

            return (
              <div
                key={i}
                className={`flex w-full flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
              >
                {showUsername && (
                  <span className="text-xs text-gray-500 mb-1 px-1">
                    {isCurrentUser ? 'You' : msg.sender_username}
                  </span>
                )}
                <div
                  className={`flex flex-col max-w-[75%] ${isCurrentUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`px-3 py-2 rounded-lg ${isCurrentUser
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-900'
                      }`}
                  >
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-1 px-1 mt-0.5">
                    <span className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {isCurrentUser && getMessageStatusIcon(msg.id)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t bg-white sticky bottom-0">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!isConnected || !message.trim()}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
} 