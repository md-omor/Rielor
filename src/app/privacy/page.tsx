
export default function PrivacyPage() {
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
            Data Protection
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-6 leading-tight font-zalando">
            PRIVACY <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-500 italic font-medium">POLICY.</span>
          </h1>
          
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium font-zalando">
            Your privacy matters. Learn how Rielor handles your data with transparency and care.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto prose prose-slate prose-lg">
          <div className="space-y-12">
            <div>
              <p className="text-slate-600 leading-relaxed font-zalando">
                Welcome to **Rielor** ("we", "our", "us"). This Privacy Policy explains how we collect, use, store, and protect your information when you use our website and services (the "Service"). By using Rielor, you agree to the practices described in this policy.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">1. What Information We Collect</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800 font-zalando">a) Information You Provide</h3>
                <p className="text-slate-600 leading-relaxed font-zalando">
                  When you use Rielor, you may provide:
                </p>
                <ul className="list-disc pl-5 text-slate-600 space-y-2 font-zalando">
                  <li>Resume or CV content</li>
                  <li>Job descriptions</li>
                  <li>Text inputs related to career analysis</li>
                  <li>Account-related information (if applicable, such as email)</li>
                </ul>
                <p className="text-slate-600 leading-relaxed font-zalando">You control what information you submit.</p>
              </div>
              <div className="space-y-4 pt-4">
                <h3 className="text-xl font-bold text-slate-800 font-zalando">b) Automatically Collected Information</h3>
                <p className="text-slate-600 leading-relaxed font-zalando">
                  We may collect limited technical data such as:
                </p>
                <ul className="list-disc pl-5 text-slate-600 space-y-2 font-zalando">
                  <li>Device type and browser</li>
                  <li>IP address (for security and abuse prevention)</li>
                  <li>Usage data (pages visited, actions taken)</li>
                </ul>
                <p className="text-slate-600 leading-relaxed font-zalando">This data is collected to keep the platform stable and secure.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">2. How We Use Your Information</h2>
              <p className="text-slate-600 leading-relaxed font-zalando">We use your information only to:</p>
              <ul className="list-disc pl-5 text-slate-600 space-y-2 font-zalando">
                <li>Analyze resume and job description alignment</li>
                <li>Generate career-related insights and explanations</li>
                <li>Improve platform functionality and reliability</li>
                <li>Maintain security and prevent misuse</li>
              </ul>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 border-l-4 border-l-slate-900">
                <p className="text-slate-800 font-medium font-zalando m-0 italic">
                  We do <strong>not</strong> use your data for advertising profiling.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">3. AI Processing Disclosure</h2>
              <p className="text-slate-600 leading-relaxed font-zalando">
                Rielor uses automated systems and AI-assisted tools to process submitted content.
              </p>
              <ul className="list-disc pl-5 text-slate-600 space-y-2 font-zalando">
                <li>AI outputs may not always be accurate or complete</li>
                <li>Results depend on the quality of the input data</li>
                <li>AI analysis is used solely to provide informational insights</li>
              </ul>
              <p className="text-slate-600 leading-relaxed font-zalando">
                Your data is <strong>not</strong> used to train public AI models without anonymization.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">4. Data Storage and Retention</h2>
              <ul className="list-disc pl-5 text-slate-600 space-y-2 font-zalando">
                <li>Submitted content may be stored temporarily to provide analysis results</li>
                <li>We retain data only as long as necessary to operate the Service</li>
                <li>You may request deletion of your data at any time</li>
              </ul>
              <p className="text-slate-600 leading-relaxed font-zalando">We take reasonable steps to protect stored data.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">5. Data Sharing</h2>
              <p className="text-slate-600 leading-relaxed font-zalando">We do <strong>not</strong> sell or rent your personal data.</p>
              <p className="text-slate-600 leading-relaxed font-zalando">We may share limited data only with:</p>
              <ul className="list-disc pl-5 text-slate-600 space-y-2 font-zalando">
                <li>Trusted infrastructure providers (hosting, storage, analytics)</li>
                <li>Service providers strictly necessary to operate Rielor</li>
              </ul>
              <p className="text-slate-600 leading-relaxed font-zalando">All third parties are required to follow appropriate data protection practices.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">6. Cookies and Tracking</h2>
              <p className="text-slate-600 leading-relaxed font-zalando">Rielor may use minimal cookies or similar technologies to:</p>
              <ul className="list-disc pl-5 text-slate-600 space-y-2 font-zalando">
                <li>Maintain session functionality</li>
                <li>Understand basic usage patterns</li>
              </ul>
              <p className="text-slate-600 leading-relaxed font-zalando">You can disable cookies in your browser settings, though some features may not function properly.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">7. Data Security</h2>
              <p className="text-slate-600 leading-relaxed font-zalando">
                We implement reasonable technical and organizational measures to protect your information. However, no system is 100% secure. You use the Service at your own risk.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">8. Your Rights</h2>
              <p className="text-slate-600 leading-relaxed font-zalando">Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-5 text-slate-600 space-y-2 font-zalando">
                <li>Access your personal data</li>
                <li>Request correction or deletion</li>
                <li>Withdraw consent where applicable</li>
              </ul>
              <p className="text-slate-600 leading-relaxed font-zalando">
                To exercise these rights, contact us at <a href="mailto:programmeromor@gmail.com" className="text-slate-900 underline decoration-slate-300 underline-offset-4 font-medium">programmeromor@gmail.com</a>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">9. Children’s Privacy</h2>
              <p className="text-slate-600 leading-relaxed font-zalando">
                Rielor is not intended for users under the age of 18. We do not knowingly collect data from minors.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">10. Changes to This Policy</h2>
              <p className="text-slate-600 leading-relaxed font-zalando">
                We may update this Privacy Policy from time to time. Continued use of Rielor after updates means you accept the revised policy.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 font-zalando uppercase tracking-tight">11. Contact Us</h2>
              <p className="text-slate-600 leading-relaxed font-zalando">
                If you have questions or requests regarding this Privacy Policy, contact:
              </p>
              <p className="text-slate-600 leading-relaxed font-zalando">
                <strong>Email:</strong> <a href="mailto:programmeromor@gmail.com" className="text-slate-900 underline decoration-slate-300 underline-offset-4 font-medium">programmeromor@gmail.com</a>
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
