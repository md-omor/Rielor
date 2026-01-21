import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import ValueSection from "@/components/landing/ValueSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-white selection:bg-slate-200">
      {/* Navigation - Minimal */}
      <nav className="container mx-auto px-4 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-white text-lg uppercase">
            J
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">JobFit</span>
        </div>
      </nav>

      <main>
        <Hero />
        <HowItWorks />
        <ValueSection />
      </main>

      <Footer />
    </div>
  );
}
