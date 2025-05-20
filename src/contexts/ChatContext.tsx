
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Define types
export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  image?: string;
  timestamp: number;
  read: boolean;
};

export type Chat = {
  id: string;
  participants: string[];
  lastMessage?: {
    text: string;
    timestamp: number;
    senderId: string;
    read: boolean;
  };
};

export type ChatUser = {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  lastActive?: number;
};

type ChatContextType = {
  chats: Chat[];
  messages: Record<string, Message[]>;
  currentChat: Chat | null;
  chatUsers: Record<string, ChatUser>;
  setCurrentChat: (chat: Chat | null) => void;
  sendMessage: (chatId: string, text: string, image?: string) => void;
  markAsRead: (chatId: string) => void;
  getUnreadCount: (chatId: string) => number;
  getTypingStatus: (chatId: string) => { isTyping: boolean; userId: string | null };
};

const ChatContext = createContext<ChatContextType>({
  chats: [],
  messages: {},
  currentChat: null,
  chatUsers: {},
  setCurrentChat: () => {},
  sendMessage: () => {},
  markAsRead: () => {},
  getUnreadCount: () => 0,
  getTypingStatus: () => ({ isTyping: false, userId: null }),
});

// Mock chat users
const mockChatUsers: Record<string, ChatUser> = {
  '1': {
    id: '1',
    name: 'John Doe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    online: true
  },
  '2': {
    id: '2',
    name: 'Jane Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    online: true
  },
  '3': {
    id: '3',
    name: 'Alex Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    online: false,
    lastActive: Date.now() - 1000 * 60 * 30 // 30 minutes ago
  },
  '4': {
    id: '4',
    name: 'Sarah Williams',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    online: true
  }
};

// Mock chats data
const mockChats: Chat[] = [
  {
    id: 'chat1',
    participants: ['1', '3'],
    lastMessage: {
      text: 'Hey, how are you doing?',
      timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
      senderId: '3',
      read: false
    }
  },
  {
    id: 'chat2',
    participants: ['1', '4'],
    lastMessage: {
      text: "Let me know when you're free",
      timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
      senderId: '4',
      read: true
    }
  },
  {
    id: 'chat3',
    participants: ['1', '2'],
    lastMessage: {
      text: "Sure, I'll get back to you with those files",
      timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
      senderId: '1',
      read: true
    }
  }
];

// Mock messages
const generateMockMessages = (): Record<string, Message[]> => {
  return {
    'chat1': [
      {
        id: '1',
        chatId: 'chat1',
        senderId: '1',
        text: 'Hi Alex, do you have time to catch up?',
        timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
        read: true
      },
      {
        id: '2',
        chatId: 'chat1',
        senderId: '3',
        text: "Sure, I'm available this afternoon.",
        timestamp: Date.now() - 1000 * 60 * 20, // 20 minutes ago
        read: true
      },
      {
        id: '3',
        chatId: 'chat1',
        senderId: '1',
        text: "Great! Let's talk at 2pm then.",
        timestamp: Date.now() - 1000 * 60 * 10, // 10 minutes ago
        read: true
      },
      {
        id: '4',
        chatId: 'chat1',
        senderId: '3',
        text: 'Hey, how are you doing?',
        timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
        read: false
      }
    ],
    'chat2': [
      {
        id: '1',
        chatId: 'chat2',
        senderId: '4',
        text: 'Hi there! I wanted to discuss the project timeline.',
        timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
        read: true
      },
      {
        id: '2',
        chatId: 'chat2',
        senderId: '1',
        text: "Hello Sarah, I'm a bit busy right now.",
        timestamp: Date.now() - 1000 * 60 * 90, // 1.5 hours ago
        read: true
      },
      {
        id: '3',
        chatId: 'chat2',
        senderId: '4',
        text: 'No problem, whenever you have time.',
        timestamp: Date.now() - 1000 * 60 * 80, // 1.33 hours ago
        read: true
      },
      {
        id: '4',
        chatId: 'chat2',
        senderId: '4',
        text: "Let me know when you're free",
        timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
        read: true
      }
    ],
    'chat3': [
      {
        id: '1',
        chatId: 'chat3',
        senderId: '2',
        text: 'Could you send me those design files?',
        timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
        read: true
      },
      {
        id: '2',
        chatId: 'chat3',
        senderId: '1',
        text: "Yes, I'll prepare them right away.",
        timestamp: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
        read: true
      },
      {
        id: '3',
        chatId: 'chat3',
        senderId: '2',
        text: 'Thank you! I need them by tomorrow.',
        timestamp: Date.now() - 1000 * 60 * 60 * 3.5, // 3.5 hours ago
        read: true
      },
      {
        id: '4',
        chatId: 'chat3',
        senderId: '1',
        text: "Sure, I'll get back to you with those files",
        timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
        read: true
      }
    ]
  };
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [typingStatus, setTypingStatus] = useState<Record<string, { isTyping: boolean; userId: string | null }>>({});

  // Initialize chat data
  useEffect(() => {
    if (currentUser) {
      // Filter chats to only include those the current user is part of
      const userChats = mockChats.filter(chat => 
        chat.participants.includes(currentUser.id)
      );
      setChats(userChats);
      setMessages(generateMockMessages());
    } else {
      setChats([]);
      setMessages({});
      setCurrentChat(null);
    }
  }, [currentUser]);

  // Send a message
  const sendMessage = (chatId: string, text: string, image?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      chatId,
      senderId: currentUser?.id || '',
      text,
      image,
      timestamp: Date.now(),
      read: false
    };

    // Add message to chat
    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage]
    }));

    // Update last message in chat
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? {
        ...chat,
        lastMessage: {
          text: text || (image ? 'Sent an image' : ''),
          timestamp: Date.now(),
          senderId: currentUser?.id || '',
          read: false
        }
      } : chat
    ));
  };

  // Mark messages in a chat as read
  const markAsRead = (chatId: string) => {
    if (!currentUser) return;
    
    // Mark all messages from other users as read
    setMessages(prev => ({
      ...prev,
      [chatId]: (prev[chatId] || []).map(msg => 
        msg.senderId !== currentUser.id ? { ...msg, read: true } : msg
      )
    }));

    // Update last message read status if needed
    setChats(prev => prev.map(chat => 
      chat.id === chatId && chat.lastMessage && chat.lastMessage.senderId !== currentUser.id
        ? {
            ...chat,
            lastMessage: {
              ...chat.lastMessage,
              read: true
            }
          }
        : chat
    ));
  };

  // Get unread message count for a chat
  const getUnreadCount = (chatId: string): number => {
    if (!currentUser || !messages[chatId]) return 0;
    
    return messages[chatId].filter(msg => 
      msg.senderId !== currentUser.id && !msg.read
    ).length;
  };

  // Get typing status for a chat
  const getTypingStatus = (chatId: string) => {
    return typingStatus[chatId] || { isTyping: false, userId: null };
  };

  const value = {
    chats,
    messages,
    currentChat,
    chatUsers: mockChatUsers,
    setCurrentChat,
    sendMessage,
    markAsRead,
    getUnreadCount,
    getTypingStatus
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  return useContext(ChatContext);
};
