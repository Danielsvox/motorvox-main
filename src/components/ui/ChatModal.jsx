import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from '@/contexts/ChatContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ReloadIcon, CheckIcon, CheckCircledIcon } from "@radix-ui/react-icons";

export function ChatModal({
  isOpen,
  onClose,
  sellerId,
  carId,
  carTitle,
  sellerDetails
}) {
  const [message, setMessage] = useState('');
  const {
    tabMessages,
    messageStatus,
    isConnected,
    isConnecting,
    error,
    needsReconnect,
    startConversation,
    sendMessage,
    currentConversation,
    connect
  } = useChat();

  const messages = currentConversation ? (tabMessages[currentConversation.id] || []) : [];

  useEffect(() => {
    if (isOpen && sellerId && carId) {
      console.log('Chat Modal State:', {
        isConnected,
        isConnecting,
        currentConversation,
        sellerId,
        carId,
        sellerDetails
      });

      // First ensure we're connected
      if (!isConnected && !isConnecting) {
        console.log('Connecting to chat server...');
        connect();
      }
      // Then start the conversation if needed
      else if (isConnected && !currentConversation) {
        console.log('Starting conversation in modal with:', {
          sellerId,
          carId,
          sellerDetails
        });
        startConversation(sellerId, carId, sellerDetails);
      }
    }
  }, [isOpen, sellerId, carId, sellerDetails, currentConversation, isConnected, isConnecting, connect, startConversation]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

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
      case 'failed':
        return <span className="text-xs text-destructive">Failed</span>;
      default:
        return null;
    }
  };

  const renderConnectionStatus = () => {
    if (isConnecting) {
      return (
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <ReloadIcon className="h-4 w-4 animate-spin" />
          <span>Connecting to chat server...</span>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            {needsReconnect && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="ml-2"
              >
                Try Again
              </Button>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    if (!isConnected) {
      return (
        <div className="text-center text-muted-foreground">
          Disconnected from chat server
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="ml-2"
          >
            Reconnect
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Chat about {carTitle}</span>
            {isConnected && (
              <span className="text-xs text-green-500">Connected</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[400px]">
          <ScrollArea className="flex-1 p-4 border rounded-md">
            {renderConnectionStatus()}

            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.sender_id === localStorage.getItem('userId')
                    ? 'items-end'
                    : 'items-start'
                    }`}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      {msg.sender_id === localStorage.getItem('userId') ? 'You' : msg.sender_username}
                    </span>
                    <div
                      className={`p-2 rounded-lg ${msg.sender_id === localStorage.getItem('userId')
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                        } max-w-[80%]`}
                    >
                      {msg.content}
                    </div>
                  </div>
                  {msg.sender_id === localStorage.getItem('userId') && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      {getMessageStatusIcon(msg.id)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <form onSubmit={handleSend} className="flex gap-2 mt-4">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                !isConnected
                  ? 'Disconnected from chat'
                  : !currentConversation
                    ? 'Starting conversation...'
                    : 'Type your message...'
              }
              disabled={!isConnected || !currentConversation}
            />
            <Button
              type="submit"
              disabled={!isConnected || !currentConversation || !message.trim()}
            >
              Send
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 