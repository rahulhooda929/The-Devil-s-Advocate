import React, { useState, useRef, useEffect } from 'react';
import { DebateSession, Message, AgentRole, AgentStatus, DebateScore } from './types';
import { startDebateSession, sendDebateMessage, evaluateUserArgument } from './services/geminiService';
import TopicInput from './components/TopicInput';
import ChatMessage from './components/ChatMessage';
import AgentVisualizer from './components/AgentVisualizer';
import ScorePanel from './components/ScorePanel';
import { Send, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<DebateSession | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showScorePanel, setShowScorePanel] = useState(false); // Mobile toggle
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const handleStart = async (topic: string) => {
    startDebateSession(topic);
    
    // Initial user message logic setup
    const initialMessage: Message = {
      id: Date.now().toString(),
      role: AgentRole.USER,
      text: topic,
      timestamp: Date.now()
    };

    setSession({
      topic,
      messages: [initialMessage],
      status: AgentStatus.IDLE,
      scores: []
    });

    // Trigger the bot's first response
    await processTurn(topic, [initialMessage]);
  };

  const processTurn = async (userText: string, currentHistory: Message[]) => {
    if (!session && currentHistory.length === 0) return;

    // 1. Set Status: LISTENING -> RESEARCHING (Simulated transition for UX)
    setSession(prev => prev ? { ...prev, status: AgentStatus.LISTENING } : null);
    await new Promise(r => setTimeout(r, 800)); // UX Pause

    setSession(prev => prev ? { ...prev, status: AgentStatus.RESEARCHING } : null);
    
    // 2. Call Gemini (Researcher + Debater)
    // The service handles the search tool internally
    const response = await sendDebateMessage(userText);
    
    setSession(prev => prev ? { ...prev, status: AgentStatus.DEBATING } : null);
    await new Promise(r => setTimeout(r, 600)); // UX Pause for "Thinking"

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: AgentRole.MODEL,
      text: response.text,
      sources: response.sources,
      timestamp: Date.now()
    };

    // 3. Update Chat
    setSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, botMessage],
        status: AgentStatus.JUDGING
      };
    });

    // 4. Judge Agent (Async)
    // We judge the USER'S text that triggered this, using the new bot response as context implicitly
    const score = await evaluateUserArgument(userText, response.text);
    
    setSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        status: AgentStatus.IDLE,
        scores: [...prev.scores, score]
      };
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !session || session.status !== AgentStatus.IDLE) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      role: AgentRole.USER,
      text: inputValue,
      timestamp: Date.now()
    };

    const updatedMessages = [...session.messages, newMsg];
    
    setSession({
      ...session,
      messages: updatedMessages
    });
    setInputValue('');

    await processTurn(newMsg.text, updatedMessages);
  };

  // View: Landing
  if (!session) {
    return <TopicInput onStart={handleStart} />;
  }

  const currentScore = session.scores.length > 0 ? session.scores[session.scores.length - 1] : null;

  // View: Debate Interface
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative transition-all duration-300 ease-in-out">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
             <h2 className="font-serif font-bold text-slate-200 tracking-wide text-lg truncate max-w-xs md:max-w-md">
               {session.topic}
             </h2>
          </div>
          <button 
            onClick={() => setShowScorePanel(!showScorePanel)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            {showScorePanel ? <X /> : <Menu />}
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 scroll-smooth">
          {session.messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
          <div className="h-24"></div> {/* Spacer for fixed input */}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
          <form onSubmit={handleSendMessage} className="relative max-w-4xl mx-auto">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={session.status !== AgentStatus.IDLE ? "Agent is speaking..." : "Type your rebuttal..."}
              disabled={session.status !== AgentStatus.IDLE}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 pl-6 pr-14 py-4 rounded-full shadow-2xl focus:outline-none focus:ring-2 focus:ring-amber-900 focus:border-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || session.status !== AgentStatus.IDLE}
              className="absolute right-2 top-2 bottom-2 bg-amber-700 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-600 text-white p-2.5 rounded-full transition-colors flex items-center justify-center aspect-square"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">
                {session.status === AgentStatus.IDLE ? "Your Turn" : "Agent Active"}
            </span>
          </div>
        </div>

        {/* Agent Visualizer Overlay */}
        <AgentVisualizer status={session.status} />
      </div>

      {/* Side Panel (Judge) - Desktop: Fixed, Mobile: Overlay */}
      <div className={`
        fixed inset-y-0 right-0 w-80 lg:w-96 bg-slate-950 shadow-2xl transform transition-transform duration-300 z-20
        lg:relative lg:transform-none lg:block border-l border-slate-800
        ${showScorePanel ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <ScorePanel score={currentScore} history={session.scores} />
      </div>
    </div>
  );
};

export default App;