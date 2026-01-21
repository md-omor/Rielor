"use client";

import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const UploadForm: React.FC = () => {
  const router = useRouter();
  const [jobInputType, setJobInputType] = useState<'upload' | 'paste'>('paste');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
  };

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            router.push('/result');
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing, router]);

  return (
    <div className="max-w-4xl mx-auto space-y-10 relative">
      {isAnalyzing && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-slate-900 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-slate-900">
                {progress}%
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">ANALYZING SIGNAL...</h3>
              <p className="text-slate-500 font-medium">Extractions complete. Calculating fit vectors and recruiter logic.</p>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-900 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Resume Section */}
      <Card className="p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
          <svg className="w-32 h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          1. Your Profile
        </h2>
        
        <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center hover:border-slate-400 group/drop transition-all duration-300 bg-slate-50/50 hover:bg-white active:scale-[0.99] cursor-pointer">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6 group-hover/drop:scale-110 group-hover/drop:shadow-md transition-all">
            <svg className="w-8 h-8 text-slate-400 group-hover/drop:text-slate-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <p className="text-xl font-bold text-slate-900 mb-1">Click to upload resume</p>
          <p className="text-slate-400 font-medium">PDF or DOCX (Signal optimized)</p>
          <input type="file" className="hidden" accept=".pdf,.docx" onChange={() => {}} />
        </div>
      </Card>

      {/* Job Description Section */}
      <Card className="p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
          <svg className="w-32 h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-200 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            2. The Opportunity
          </h2>
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
            <button 
              onClick={() => setJobInputType('paste')}
              className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${jobInputType === 'paste' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
            >
              PASTE TEXT
            </button>
            <button 
              onClick={() => setJobInputType('upload')}
              className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${jobInputType === 'upload' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
            >
              UPLOAD JD
            </button>
          </div>
        </div>

        {jobInputType === 'paste' ? (
          <div className="relative">
            <textarea 
              className="w-full h-56 p-6 rounded-2xl border-2 border-slate-100 bg-slate-50/30 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all resize-none text-lg text-slate-700 font-medium placeholder:text-slate-300"
              placeholder="Paste the full job description here. More detail means better matching signal..."
              onChange={() => {}}
            ></textarea>
            <div className="absolute bottom-4 right-4 text-[11px] font-black text-slate-400 tracking-widest uppercase pointer-events-none">
              Minimum 50 words recommended
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-20 text-center hover:border-slate-400 transition-all bg-slate-50/50 hover:bg-white cursor-pointer group/jd">
             <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6 group-hover/jd:scale-110 transition-all">
              <svg className="w-8 h-8 text-slate-400 group-hover/jd:text-slate-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-xl font-bold text-slate-900 mb-1">Click to upload JD</p>
            <p className="text-slate-400 font-medium tracking-tight">PDF, Text or Word Doc</p>
            <input type="file" className="hidden" accept=".pdf,.txt,.docx" onChange={() => {}} />
          </div>
        )}
      </Card>

      <div className="pt-8 text-center">
        <Button size="lg" className="h-20 w-full max-w-sm text-xl shadow-2xl shadow-slate-900/10 active:scale-95 group" onClick={handleAnalyze}>
          ANALYZE MY FIT
          <svg className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>
        <p className="text-slate-400 font-bold text-xs tracking-[0.2em] mt-8 uppercase">
          AI-Powered Engine • Zero Data Retention • Instant Analysis
        </p>
      </div>
    </div>
  );
};

export default UploadForm;
