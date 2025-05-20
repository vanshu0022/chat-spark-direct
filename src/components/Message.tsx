
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Check } from "lucide-react";
import { Message as MessageType } from "../contexts/ChatContext";

interface MessageProps {
  message: MessageType;
  isOwnMessage: boolean;
  sender: {
    name: string;
    avatar: string;
  } | undefined;
}

const Message = ({ message, isOwnMessage, sender }: MessageProps) => {
  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex ${isOwnMessage ? "flex-row-reverse" : "flex-row"} max-w-[85%]`}>
        {!isOwnMessage && sender && (
          <Avatar className="h-8 w-8 mt-1">
            <AvatarImage src={sender.avatar} alt={sender.name} />
            <AvatarFallback>{sender.name[0]}</AvatarFallback>
          </Avatar>
        )}

        <div className={`flex flex-col ${isOwnMessage ? "items-end mr-2" : "items-start ml-2"}`}>
          <div className={`message-bubble ${isOwnMessage ? "message-outgoing" : "message-incoming"}`}>
            {message.text}
            
            {message.image && (
              <img 
                src={message.image} 
                alt="Message attachment" 
                className="mt-2 rounded-md max-h-[200px] w-auto" 
              />
            )}
          </div>
          
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <span>{format(message.timestamp, 'h:mm a')}</span>
            {isOwnMessage && (
              <div className="ml-1 text-primary">
                {message.read ? (
                  <div className="flex items-center">
                    <Check className="h-3 w-3" />
                    <Check className="h-3 w-3 -ml-1" />
                  </div>
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
