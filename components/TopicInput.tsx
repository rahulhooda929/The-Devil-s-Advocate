import React, { useState } from 'react';
import { Flame, ArrowRight } from 'lucide-react';

interface TopicInputProps {
  onStart: (topic: string) => void;
}

const PRESET_TOPICS = [
  "Social media does more harm than good.",
  "Universal Basic Income is inevitable.",
  "AI art is not real art.",
  "Remote work destroys company culture."
];

const TopicInput: React.FC<TopicInputProps> = ({ onStart }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) onStart(input);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-900/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-slate-800/40 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-amber-950/30 rounded-full border border-amber-900/50 shadow-2xl shadow-amber-900/20">
            <Flame className="w-12 h-12 text-amber-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-br from-slate-100 to-slate-500 tracking-tight">
            The Devil's Advocate
          </h1>
          <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
            I am a multi-agent system designed to dismantle your echo chamber. 
            State a strong opinion, and I will research, analyze, and challenge it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="State a controversial opinion..."
            className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 px-6 py-4 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-600/50 focus:border-transparent transition-all placeholder:text-slate-600 text-lg"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-2 bottom-2 bg-slate-800 hover:bg-amber-700 disabled:opacity-50 disabled:hover:bg-slate-800 text-white p-2.5 rounded-lg transition-colors duration-200"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="space-y-4">
          <span className="text-xs uppercase tracking-widest text-slate-600">Or choose a topic</span>
          <div className="flex flex-wrap justify-center gap-3">
            {PRESET_TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => onStart(topic)}
                className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-amber-900/50 hover:bg-slate-800 text-slate-400 hover:text-amber-500 text-sm rounded-full transition-all duration-200"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 text-slate-700 text-xs text-center">
        Powered by Gemini 2.5 Flash • Google Search Grounding • Multi-Agent Logic
      </div>
    </div>
  );
};

export default TopicInput;