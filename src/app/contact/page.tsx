"use client";

import { AlertCircle, CheckCircle2, Loader2, Mail, MessageSquare, Send, User } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong. Please try again later.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
            Support Center
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-6 leading-tight font-zalando">
            GET IN <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-500 italic font-medium">TOUCH.</span>
          </h1>
          
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium font-zalando">
            Have questions or need assistance? Our team is here to help you navigate your career journey with Rielor.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Contact Information */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 font-zalando tracking-tight mb-6">Contact Information</h2>
              <p className="text-slate-500 leading-relaxed font-zalando text-lg">
                We're always open to suggestions, feedback, or any questions you might have. Feel free to reach out to us.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 font-zalando mb-1">Email Us</h3>
                  <a href="mailto:programmeromor@gmail.com" className="text-slate-500 hover:text-slate-900 transition-colors font-medium">
                    programmeromor@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 font-zalando mb-1">Help Center</h3>
                  <p className="text-slate-500 font-medium">
                    Visit our <a href="/knowledge-center" className="text-slate-900 underline decoration-slate-200 underline-offset-4">Knowledge Center</a> for quick answers.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-900 rounded-3xl text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 rounded-full"></div>
              <div className="relative z-10">
                <h4 className="text-xl font-bold font-zalando mb-2">Build Your Future</h4>
                <p className="text-slate-400 font-medium mb-6">
                  Ready to optimize your career? Let's analyze your next big opportunity together.
                </p>
                <a 
                  href="/upload" 
                  className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-full font-bold text-sm hover:bg-slate-100 transition-all active:scale-95 shadow-lg shadow-white/10"
                >
                  Analyze Resume
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-900 via-slate-500 to-slate-900"></div>
              
              {status === "success" ? (
                <div className="text-center py-12 space-y-6 animate-fadeIn">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 font-zalando tracking-tight">Message Sent!</h2>
                  <p className="text-slate-500 text-lg max-w-md mx-auto font-medium font-zalando">
                    Thank you for reaching out. We've received your message and will get back to you as soon as possible.
                  </p>
                  <button 
                    onClick={() => setStatus("idle")}
                    className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/20"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-bold text-slate-700 font-zalando ml-1 uppercase tracking-wider">
                        Full Name
                      </label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="John Doe"
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-bold text-slate-700 font-zalando ml-1 uppercase tracking-wider">
                        Email Address
                      </label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="john@example.com"
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="block text-sm font-bold text-slate-700 font-zalando ml-1 uppercase tracking-wider">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="How can we help?"
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-bold text-slate-700 font-zalando ml-1 uppercase tracking-wider">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Write your message here..."
                      rows={6}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium text-slate-900 placeholder:text-slate-400 resize-none"
                    />
                  </div>

                  {status === "error" && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 animate-fadeIn">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p className="text-sm font-bold font-zalando">{errorMessage}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-900/20 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-3 group cursor-pointer"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
