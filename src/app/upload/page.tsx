import UploadForm from '@/components/upload/UploadForm';
import Link from 'next/link';

export default function UploadPage() {
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
        <Link href="/" className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">
          Back to Home
        </Link>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Analyze Your Job Fit</h1>
          <p className="text-slate-600 max-w-xl mx-auto">
            Provide your details below and our AI will evaluate how well your profile matches the role.
          </p>
        </div>

        <UploadForm />
      </main>

      <footer className="mt-20 py-8 border-t border-slate-100 text-center">
        <p className="text-slate-400 text-sm">JobFit — Professional Job Application Analyzer</p>
      </footer>
    </div>
  );
}
