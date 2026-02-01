import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <section className="relative pt-24 pb-16 px-4 overflow-hidden border-b border-slate-100">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-slate-100 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-0 right-[-5%] w-[30%] h-[50%] bg-slate-50 blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-slate-900/[0.03] border border-slate-900/10 text-slate-600 text-[13px] font-semibold tracking-wide uppercase font-zalando">
            Platform Agreement
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-6 leading-tight font-zalando">
            TERMS & <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-500 italic font-medium">CONDITIONS.</span>
          </h1>
          
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium font-zalando">
            Clear, calm, and professional. Understand how Rielor works and your relationship with the platform.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto prose prose-slate prose-lg">
          <div className="space-y-12">
            <div>
              <p className="text-slate-600 leading-relaxed font-zalando">
                Welcome to Rielor. These Terms & Conditions govern your use of the Rielor platform. By accessing or using our services, you agree to be bound by these terms.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">1. Introduction & Acceptance of Terms</h2>
              <p className="text-slate-600 leading-relaxed font-zalando">
                Rielor is a career decision-support platform. These terms constitute a binding agreement between you and Rielor. If you do not agree with any part of these terms, you must not use the platform.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">2. Purpose of the Platform</h2>
              <p className="text-slate-600 leading-relaxed font-zalando">
                Rielor is designed to provide career clarity by analyzing the alignment between a user's resume and a specific job description. The platform provides informational analysis only (PASS / IMPROVE / REJECT).
              </p>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 border-l-4 border-l-slate-900">
                <p className="text-slate-800 font-medium font-zalando m-0 italic">
                  Important: Rielor is NOT a recruiter, employer, or hiring agency. We do not guarantee jobs, interviews, or any specific hiring outcomes. The results provided are advisory and informational only.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">3. Eligibility</h2>
              <p className="text-slate-600 leading-relaxed font-zalando">
                You must be at least 18 years old to use Rielor. By using the platform, you represent and warrant that you meet this eligibility requirement.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">4. User Content</h2>
              <p className="text-slate-600 leading-relaxed font-zalando">
                You retain full ownership of any content you upload to Rielor, including resumes and job descriptions. By uploading content, you grant Rielor a limited license to process this data solely for the purpose of providing you with analysis and insights.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">5. Data Handling & Privacy</h2>
              <p className="text-slate-600 leading-relaxed font-zalando">
                Your privacy is important to us. Please refer to our <Link href="/privacy" className="text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 transition-colors">Privacy Policy</Link> for detailed information on how we collect, use, and protect your data.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">6. AI-Generated Insights Disclaimer</h2>
              <p className="text-slate-600 leading-relaxed font-zalando">
                Rielor uses artificial intelligence to generate insights and analysis. AI outputs may be imperfect, incomplete, or inaccurate. These insights should be used as guidance only and not as the sole basis for career decisions. Rielor does not guarantee the accuracy of AI-generated content.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">7. No Guarantees</h2>
              <p className="text-slate-600 leading-relaxed font-zalando">
                We provide the platform "as is" and make no guarantees regarding the effectiveness of the analysis in securing employment. Your career success depends on numerous factors beyond the scope of Rielor's analysis.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">8. Acceptable Use</h2>
              <p className="text-slate-600 leading-relaxed font-zalando">
                You agree to use Rielor only for lawful purposes. You may not use the platform to upload malicious code, attempt unauthorized access, or engage in fraudulent activities.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">9. Intellectual Property</h2>
              <p className="text-slate-600 leading-relaxed font-zalando">
                All content and functionality on Rielor (excluding user content) are the property of Rielor and are protected by international copyright and trademark laws.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">10. Service Availability</h2>
              <p className="text-slate-600 leading-relaxed font-zalando">
                We strive for constant availability but do not guarantee uninterrupted service. We may modify or discontinue any part of the service at any time without notice.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">11. Limitation of Liability</h2>
              <p className="text-slate-600 leading-relaxed font-zalando">
                To the maximum extent permitted by law, Rielor shall not be liable for any indirect or consequential damages arising from your use of the platform.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">12. Changes to Terms</h2>
              <p className="text-slate-600 leading-relaxed font-zalando">
                We may update these terms periodically. Continued use of the platform after changes signifies your acceptance of the new terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">13. Governing Law</h2>
              <p className="text-slate-600 leading-relaxed font-zalando">
                These Terms & Conditions are governed by and construed in accordance with the laws of Bangladesh.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">14. Contact Information</h2>
              <p className="text-slate-600 leading-relaxed font-zalando">
                Questions about these terms? Reach out at <a href="mailto:programmeromor@gmail.com" className="text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 transition-colors">programmeromor@gmail.com</a>.
              </p>
            </section>

            <div className="pt-12 border-t border-slate-100">
              <p className="text-slate-400 text-sm font-zalando italic">
                Last updated: February 1, 2026
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
