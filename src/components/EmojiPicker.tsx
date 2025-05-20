
import { useEffect, useRef } from "react";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

const EmojiPicker = ({ onEmojiSelect, onClose }: EmojiPickerProps) => {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const commonEmojis = [
    "😊", "😂", "❤️", "😍", "👍", "😒", "😘", "😭", "😁", "😔", 
    "😉", "😎", "😢", "😆", "😜", "😋", "😡", "🙄", "😴", "🤔",
    "😳", "😅", "😩", "😌", "😀", "😃", "😄", "😱", "😝", "😚",
    "😏", "🔥", "👏", "👌", "💯", "🙏", "💕", "💞", "💓", "💖"
  ];

  return (
    <div 
      ref={pickerRef}
      className="emoji-picker absolute bottom-16 left-0 bg-white p-2 z-10 grid grid-cols-8 gap-1 max-h-[200px] overflow-y-auto shadow-lg border rounded-lg"
    >
      {commonEmojis.map((emoji, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onEmojiSelect(emoji)}
          className="hover:bg-gray-100 rounded p-1 text-xl"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default EmojiPicker;
