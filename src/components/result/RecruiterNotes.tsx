import React from 'react';

interface RecruiterNotesProps {
  notes: string[];
}

const RecruiterNotes: React.FC<RecruiterNotesProps> = ({ notes }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recruiter-Style Notes</h2>
      <div className="space-y-4">
        {notes.map((note, index) => (
          <div key={index} className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
            <div className="flex-shrink-0 mt-1">
              <div className="w-2 h-2 rounded-full bg-slate-400 group-hover:bg-slate-900 transition-colors mt-2"></div>
            </div>
            <p className="text-slate-600 font-medium leading-relaxed italic">
              "{note}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecruiterNotes;
