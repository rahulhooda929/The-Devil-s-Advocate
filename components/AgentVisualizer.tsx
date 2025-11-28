import React, { useEffect, useState } from 'react';
import { AgentStatus } from '../types';
import { Brain, Search, MessageSquare, Scale, Loader2 } from 'lucide-react';

interface AgentVisualizerProps {
  status: AgentStatus;
}

const AgentVisualizer: React.FC<AgentVisualizerProps> = ({ status }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    switch (status) {
      case AgentStatus.LISTENING:
        setDisplayText('Listener Agent: Analyzing your argument...');
        break;
      case AgentStatus.RESEARCHING:
        setDisplayText('Researcher Agent: Scouring the web for counter-evidence...');
        break;
      case AgentStatus.DEBATING:
        setDisplayText('Debater Agent: Constructing logical rebuttal...');
        break;
      case AgentStatus.JUDGING:
        setDisplayText('Judge Agent: Evaluating your performance...');
        break;
      default:
        setDisplayText('Ready');
    }
  }, [status]);

  if (status === AgentStatus.IDLE) return null;

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-slate-900/90 border border-amber-500/30 backdrop-blur-md text-amber-500 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      {status === AgentStatus.LISTENING && <Brain className="w-5 h-5 animate-pulse" />}
      {status === AgentStatus.RESEARCHING && <Search className="w-5 h-5 animate-bounce" />}
      {status === AgentStatus.DEBATING && <MessageSquare className="w-5 h-5 animate-pulse" />}
      {status === AgentStatus.JUDGING && <Scale className="w-5 h-5 animate-pulse" />}
      <span className="text-sm font-semibold tracking-wide">{displayText}</span>
      <Loader2 className="w-4 h-4 animate-spin opacity-50 ml-2" />
    </div>
  );
};

export default AgentVisualizer;