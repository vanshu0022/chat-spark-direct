
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useChat, Message as MessageType } from "../contexts/ChatContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow, format } from "date-fns";
import { ArrowLeft, Send, Image, Smile } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Message from "../components/Message";
import EmojiPicker from "../components/EmojiPicker";

const Chat = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { currentUser } = useAuth();
  const { chats, messages, chatUsers, sendMessage, markAsRead, setCurrentChat } = useChat();
  const [messageText, setMessageText] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Find the current chat
  const chat = chats.find(c => c.id === chatId);
  
  // Get the other participant in the chat
  const otherParticipantId = chat?.participants.find(id => id !== currentUser?.id);
  const otherParticipant = otherParticipantId ? chatUsers[otherParticipantId] : null;

  // Get chat messages
  const chatMessages = chatId ? messages[chatId] || [] : [];

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Set current chat when component mounts
  useEffect(() => {
    if (chat) {
      setCurrentChat(chat);
      markAsRead(chat.id);
    }
  }, [chat, markAsRead, setCurrentChat]);

  // Mark messages as read on mount and when new messages arrive
  useEffect(() => {
    if (chatId) {
      markAsRead(chatId);
    }
  }, [chatId, chatMessages.length, markAsRead]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!messageText.trim() || !chatId) return;
    
    sendMessage(chatId, messageText.trim());
    setMessageText("");
    setIsEmojiPickerOpen(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageText(prev => prev + emoji);
  };

  // Group messages by date
  const groupedMessages: { [date: string]: MessageType[] } = {};
  chatMessages.forEach(message => {
    const date = format(message.timestamp, 'yyyy-MM-dd');
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  // If chat not found, redirect to inbox
  if (!chat || !otherParticipant) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium mb-4">Chat not found</p>
          <Button onClick={() => navigate('/inbox')}>Go back to inbox</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white">
      {/* Header */}
      <header className="border-b p-4 flex items-center bg-white">
        <Button variant="ghost" size="icon" onClick={() => navigate('/inbox')} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherParticipant.avatar} alt={otherParticipant.name} />
          <AvatarFallback>{otherParticipant.name[0]}</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <h2 className="font-medium">{otherParticipant.name}</h2>
          <div className="text-xs text-gray-500">
            {otherParticipant.online ? (
              <span className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                Online
              </span>
            ) : otherParticipant.lastActive ? (
              `Last active ${formatDistanceToNow(otherParticipant.lastActive, { addSuffix: true })}`
            ) : (
              "Offline"
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-hide">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute border-t border-gray-200 w-full"></div>
              <span className="relative bg-white px-2 text-sm text-gray-500">
                {format(new Date(date), 'MMMM d, yyyy') === format(new Date(), 'MMMM d, yyyy') 
                  ? 'Today' 
                  : format(new Date(date), 'MMMM d, yyyy')}
              </span>
            </div>

            {dateMessages.map(message => (
              <Message
                key={message.id}
                message={message}
                isOwnMessage={message.senderId === currentUser?.id}
                sender={chatUsers[message.senderId]}
              />
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="border-t p-4 bg-white relative">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
            className="shrink-0"
          >
            <Smile className="h-5 w-5 text-gray-500" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => toast({
              title: "Feature not available",
              description: "Image upload will be added in a future update",
            })}
            className="shrink-0"
          >
            <Image className="h-5 w-5 text-gray-500" />
          </Button>
          
          <div className="relative flex-1">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="pr-12"
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              disabled={!messageText.trim()}
              className="absolute right-0 top-0 h-full text-primary"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>

          {isEmojiPickerOpen && (
            <EmojiPicker 
              onEmojiSelect={handleEmojiSelect}
              onClose={() => setIsEmojiPickerOpen(false)}
            />
          )}
        </form>
      </div>
    </div>
  );
};

export default Chat;
