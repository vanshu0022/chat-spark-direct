
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "../contexts/ChatContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Search, LogOut } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

const Inbox = () => {
  const { currentUser, logout } = useAuth();
  const { chats, chatUsers, getUnreadCount } = useChat();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out"
    });
  };

  // Filter chats based on search term
  const filteredChats = chats.filter(chat => {
    // Find the other participant in the chat
    const otherParticipantId = chat.participants.find(id => id !== currentUser?.id);
    const otherParticipant = otherParticipantId ? chatUsers[otherParticipantId] : null;
    
    if (!otherParticipant) return false;
    
    // Filter by name
    return otherParticipant.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Function to get the other participant in a chat
  const getOtherParticipant = (chat: any) => {
    const otherParticipantId = chat.participants.find((id: string) => id !== currentUser?.id);
    return otherParticipantId ? chatUsers[otherParticipantId] : null;
  };

  // Sort chats by most recent message
  const sortedChats = [...filteredChats].sort((a, b) => {
    const timeA = a.lastMessage?.timestamp || 0;
    const timeB = b.lastMessage?.timestamp || 0;
    return timeB - timeA;
  });

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Messages</h1>
        </div>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
            <AvatarFallback>{currentUser?.name[0]}</AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Search */}
      <div className="p-4 border-b bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search messages"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {sortedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center text-gray-500">
            <MessageSquare className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No conversations yet</p>
            <p className="mt-1">Start chatting with someone!</p>
          </div>
        ) : (
          <ul className="divide-y">
            {sortedChats.map(chat => {
              const otherUser = getOtherParticipant(chat);
              if (!otherUser) return null;
              
              const unreadCount = getUnreadCount(chat.id);
              const isUnread = unreadCount > 0;
              
              return (
                <li key={chat.id}>
                  <Link to={`/chat/${chat.id}`} className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                        <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
                      </Avatar>
                      {otherUser.online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                      )}
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h2 className="font-medium text-gray-900 truncate">{otherUser.name}</h2>
                        {chat.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(chat.lastMessage.timestamp, { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        {chat.lastMessage && (
                          <p className={`text-sm truncate ${isUnread && chat.lastMessage.senderId !== currentUser?.id ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                            {chat.lastMessage.senderId === currentUser?.id && "You: "}
                            {chat.lastMessage.text}
                          </p>
                        )}
                        {isUnread && (
                          <span className="ml-2 bg-primary text-white text-xs font-semibold rounded-full h-5 min-w-[1.25rem] flex items-center justify-center px-1">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Inbox;
