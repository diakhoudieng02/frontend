import { useState } from 'react';
import { Send, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = "Pose une question sur ton cours..." }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            rows={1}
            disabled={disabled}
            className={cn(
              'w-full resize-none rounded-2xl border border-border bg-muted px-4 py-3 pr-12',
              'text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'min-h-[48px] max-h-32',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="button"
            className="absolute right-3 bottom-3 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
        
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || disabled}
          className="h-12 w-12 rounded-full btn-primary-gradient flex-shrink-0"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </form>
  );
}
