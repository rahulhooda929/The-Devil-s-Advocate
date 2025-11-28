import React from 'react';
import { Message, AgentRole } from '../types';
import { User, Bot, ExternalLink } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === AgentRole.USER;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-8 animate-in fade-in slide-in-from-bottom-2`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${
          isUser 
            ? 'bg-slate-800 border-slate-600' 
            : 'bg-amber-950/30 border-amber-900/50'
        }`}>
          {isUser ? <User className="w-5 h-5 text-slate-400" /> : <Bot className="w-5 h-5 text-amber-600" />}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`p-5 rounded-2xl text-sm md:text-base leading-relaxed shadow-lg ${
            isUser 
              ? 'bg-slate-800 text-slate-100 rounded-tr-none' 
              : 'bg-slate-900/80 border border-slate-800 text-slate-200 rounded-tl-none'
          }`}>
            <div className="prose prose-invert max-w-none">
                {/* Simple line break handling for demo; in production use a markdown parser */}
                {message.text.split('\n').map((line, i) => (
                    <p key={i} className="mb-2 min-h-[1em]">{line}</p>
                ))}
            </div>
          </div>

          {/* Sources Section (Only for Bot) */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-3 bg-black/20 p-3 rounded-lg border border-slate-800 w-full max-w-md">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2 block">
                Researched Evidence
              </span>
              <div className="space-y-2">
                {message.sources.map((source, idx) => (
                  <a 
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-amber-500/80 hover:text-amber-400 hover:underline transition-colors truncate"
                  >
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{source.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          
          <span className="text-[10px] text-slate-600 mt-2 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;