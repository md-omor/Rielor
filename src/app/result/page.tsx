import DecisionHeader from '@/components/result/DecisionHeader';
import MissingSkills from '@/components/result/MissingSkills';
import RecruiterNotes from '@/components/result/RecruiterNotes';
import ScoreBreakdown from '@/components/result/ScoreBreakdown';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import Link from 'next/link';

// Placeholder data
const MOCK_RESULT = {
  decision: 'APPLY WITH IMPROVEMENTS' as const,
  score: 68,
  breakdown: [
    { label: 'Required Skills', score: 75 },
    { label: 'Experience Level', score: 62 },
    { label: 'Education Match', score: 90 },
    { label: 'Tool Mastery', score: 45 },
    { label: 'Eligibility', score: 100 },
  ],
  missingSkills: ['Distributed Systems', 'Go/Golang', 'Kubernetes Architecture', 'gRPC Framework'],
  notes: [
    "Candidate shows strong generalist profile but lacks specialized depth in high-scale infrastructure.",
    "Resume mentions 'Microservices' but lacks specific implementation details with Kubernetes.",
    "Recommend adding specific Go projects to the resume to meet technical filtering bars.",
    "Education background exceeds requirements, providing a solid theoretical foundation."
  ]
};

export default function ResultPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-white text-lg group-hover:bg-slate-800 transition-colors">
            J
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">JobFit</span>
        </Link>
        <Link href="/upload">
          <Button variant="secondary" size="sm" className="font-bold">
            NEW ANALYSIS
          </Button>
        </Link>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <DecisionHeader decision={MOCK_RESULT.decision} score={MOCK_RESULT.score} />
        
        <div className="grid lg:grid-cols-2 gap-16 mt-16">
          <div className="space-y-16">
            <ScoreBreakdown breakdown={MOCK_RESULT.breakdown} />
            <MissingSkills skills={MOCK_RESULT.missingSkills} />
          </div>
          
          <div className="space-y-12">
            <RecruiterNotes notes={MOCK_RESULT.notes} />
            
            <Card className="p-10 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-colors"></div>
              <h3 className="text-xl font-black mb-4 tracking-tight">IMPROVE YOUR SCORE</h3>
              <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                Our analysis suggests that adding specific mentions of "Cloud Native Patterns" could increase your score by up to 12 points.
              </p>
              <Button size="lg" className="w-full bg-white text-slate-900 hover:bg-slate-100 py-6 text-lg">
                View Tailored Tips
              </Button>
            </Card>
          </div>
        </div>
      </main>

      <footer className="mt-20 py-12 border-t border-slate-100 text-center">
        <p className="text-slate-400 text-xs font-black tracking-widest uppercase">
          Confidential AI Signal Analysis • JobFit Pro 2026
        </p>
      </footer>
    </div>
  );
}
