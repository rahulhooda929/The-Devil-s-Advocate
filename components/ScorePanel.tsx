import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { DebateScore } from '../types';
import { AlertCircle } from 'lucide-react';

interface ScorePanelProps {
  score: DebateScore | null;
  history: DebateScore[];
}

const ScorePanel: React.FC<ScorePanelProps> = ({ score }) => {
  if (!score) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-6 border-l border-slate-800 bg-slate-900/50">
        <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-center text-sm">Review unavailable.<br/>Start debating to receive a critique.</p>
      </div>
    );
  }

  const data = [
    { subject: 'Logic', A: score.logic, fullMark: 100 },
    { subject: 'Evidence', A: score.evidence, fullMark: 100 },
    { subject: 'Emotion', A: score.emotionalControl, fullMark: 100 },
  ];

  return (
    <div className="h-full flex flex-col p-6 border-l border-slate-800 bg-slate-900/50">
      <h3 className="text-amber-500 font-bold tracking-widest uppercase text-xs mb-6 text-center">
        Judge's Evaluation
      </h3>
      
      <div className="flex-1 min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Performance"
              dataKey="A"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="#f59e0b"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 space-y-4">
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Critique</span>
          <p className="text-sm text-slate-200 leading-relaxed italic">"{score.feedback}"</p>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-800/30 p-2 rounded">
                <div className="text-lg font-bold text-white">{score.logic}</div>
                <div className="text-[10px] text-slate-400 uppercase">Logic</div>
            </div>
            <div className="bg-slate-800/30 p-2 rounded">
                <div className="text-lg font-bold text-white">{score.evidence}</div>
                <div className="text-[10px] text-slate-400 uppercase">Facts</div>
            </div>
            <div className="bg-slate-800/30 p-2 rounded">
                <div className="text-lg font-bold text-white">{score.emotionalControl}</div>
                <div className="text-[10px] text-slate-400 uppercase">Tone</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ScorePanel;