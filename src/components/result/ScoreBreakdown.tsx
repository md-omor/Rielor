import React from 'react';

interface ScoreBreakdownProps {
  breakdown: {
    label: string;
    score: number;
  }[];
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ breakdown }) => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Signal Strengths</h2>
      <div className="grid gap-8">
        {breakdown.map((item) => (
          <div key={item.label} className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-sm font-black text-slate-900 tracking-widest uppercase">{item.label}</span>
              <span className="text-lg font-black text-slate-900">{item.score}%</span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner border border-slate-200/50">
              <div 
                className="h-full bg-slate-900 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,0,0,0.1)]"
                style={{ width: `${item.score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreBreakdown;
