"use client";

import Button from "@/components/shared/Button";
import Card from "@/components/shared/Card";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { memo, useCallback, useEffect, useState } from "react";

const UPLOAD_DRAFT_STORAGE_KEY = "upload_draft_v1";

// --- Memoized Sub-components ---

const AuthModal = memo(
  ({
    isOpen,
    onClose,
    onSignIn,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSignIn: () => void;
  }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6 min-h-screen">
        <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-100 p-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white mx-auto flex items-center justify-center">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 15v2m0-8v2m0 6a6 6 0 100-12 6 6 0 000 12z"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900">
              Sign in to analyze
            </h3>
            <p className="text-slate-500 font-medium">
              Uploading and pasting is available, but analysis requires an
              account.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              className="h-12 text-base cursor-pointer"
              onClick={onSignIn}
            >
              Go to Sign In
            </Button>
            <button
              className="text-sm font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
              onClick={onClose}
            >
              Continue editing
            </button>
          </div>
        </div>
      </div>
    );
  },
);
AuthModal.displayName = "AuthModal";

const AnalysisOverlay = memo(
  ({
    isVisible,
    progress,
    isExtracting,
  }: {
    isVisible: boolean;
    progress: number;
    isExtracting: boolean;
  }) => {
    if (!isVisible) return null;
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-slate-900 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-slate-900">
              {progress}%
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">
              {isExtracting ? "EXTRACTING FROM URL..." : "ANALYZING SIGNAL..."}
            </h3>
            <p className="text-slate-500 font-medium">
              {isExtracting
                ? "Connecting to source and parsing job details."
                : "Extractions complete. Calculating fit vectors and recruiter logic."}
            </p>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  },
);
AnalysisOverlay.displayName = "AnalysisOverlay";

const ResumeSection = memo(
  ({
    resumeName,
    isUploading,
    onFileUpload,
  }: {
    resumeName: string;
    isUploading: boolean;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <Card className="p-6 sm:p-10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
        <svg
          className="w-32 h-32"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 sm:mb-8 flex items-center gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/10">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        1. Your Profile
      </h2>
      <label
        className={`relative block border-2 border-dashed rounded-2xl p-8 sm:p-16 text-center transition-all duration-300 cursor-pointer ${resumeName ? "bg-indigo-50/50 border-indigo-200" : "bg-slate-50/50 border-slate-200 hover:border-slate-400 hover:bg-white"}`}
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6 transition-all">
          {isUploading ? (
            <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-slate-900 animate-spin"></div>
          ) : (
            <svg
              className={`w-8 h-8 ${resumeName ? "text-indigo-500" : "text-slate-400"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          )}
        </div>
        <p className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
          {isUploading
            ? "Processing file..."
            : resumeName || "Click to upload resume"}
        </p>
        <p className="text-slate-400 font-medium">
          {resumeName
            ? `Successfully extracted: ${resumeName}`
            : "PDF or DOCX (Signal optimized)"}
        </p>
        <input
          type="file"
          className="hidden"
          accept=".pdf,.docx"
          onChange={onFileUpload}
          disabled={isUploading}
        />
      </label>
    </Card>
  ),
);
ResumeSection.displayName = "ResumeSection";

const JobDescriptionSection = memo(
  ({
    jobInputType,
    setJobInputType,
    jdText,
    setJdText,
    jdUrlInput,
    setJdUrlInput,
    jdName,
    isUploading,
    onFileUpload,
    extractionWarning,
    setExtractionWarning,
    showExtractedPreview,
    setShowExtractedPreview,
  }: {
    jobInputType: "upload" | "paste";
    setJobInputType: (t: "upload" | "paste") => void;
    jdText: string;
    setJdText: (t: string) => void;
    jdUrlInput: string;
    setJdUrlInput: (t: string) => void;
    jdName: string;
    isUploading: boolean;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    extractionWarning: string | null;
    setExtractionWarning: (w: string | null) => void;
    showExtractedPreview: boolean;
    setShowExtractedPreview: (s: boolean) => void;
  }) => (
    <Card className="p-6 sm:p-10 relative overflow-hidden group">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 sm:mb-10 gap-4 sm:gap-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-200 shadow-sm">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          2. The Opportunity
        </h2>
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-fit border border-slate-200">
          <button
            onClick={() => setJobInputType("paste")}
            className={`flex-1 cursor-pointer sm:flex-none px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all outline-none focus:outline-none ${jobInputType === "paste" ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"}`}
          >
            PASTE TEXT
          </button>
          <button
            onClick={() => setJobInputType("upload")}
            className={`flex-2 cursor-pointer sm:flex-none px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${jobInputType === "upload" ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"}`}
          >
            URL / UPLOAD
          </button>
        </div>
      </div>
      {extractionWarning && (
        <div
          className={`mb-4 p-4 rounded-xl border-2 ${
            extractionWarning.startsWith("✓")
              ? "bg-blue-50 border-blue-200 text-blue-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">
              {extractionWarning.startsWith("✓") ? "ℹ️" : "⚠️"}
            </span>
            <div className="flex-1">
              <p className="font-bold text-sm">{extractionWarning}</p>
              {showExtractedPreview && (
                <button
                  onClick={() => {
                    setExtractionWarning(null);
                    setShowExtractedPreview(false);
                  }}
                  className="mt-2 text-xs font-semibold underline hover:no-underline"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {jobInputType === "paste" ? (
        <div className="relative">
          <textarea
            className="w-full h-44 sm:h-56 p-4 sm:p-6 rounded-2xl border-2 border-slate-100 bg-slate-50/30 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all resize-none text-base sm:text-lg text-slate-700 font-medium placeholder:text-slate-300"
            placeholder="Paste the full job description OR a job URL (LinkedIn, Indeed, etc.) here. More detail means better matching signal..."
            value={jdText}
            onChange={(e) => {
              setJdText(e.target.value);
              setExtractionWarning(null);
              setShowExtractedPreview(false);
            }}
          />
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 text-[11px] font-black text-slate-400 tracking-widest uppercase pointer-events-none">
            {jdText.length > 0
              ? `${jdText.length} chars`
              : "Minimum 50 words recommended"}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative">
            <input
              type="text"
              className="w-full p-4 sm:p-5 rounded-2xl border-2 border-slate-100 bg-slate-50/30 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all text-base sm:text-lg text-slate-700 font-medium placeholder:text-slate-300"
              placeholder="Paste Job Posting URL here..."
              value={jdUrlInput}
              onChange={(e) => setJdUrlInput(e.target.value)}
            />
            <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
              LinkedIn, Indeed, Bdjobs, etc. supported
            </div>
          </div>
          <div className="relative flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-100"></div>
            <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
              OR
            </span>
            <div className="flex-1 h-px bg-slate-100"></div>
          </div>
          <label
            className={`block border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center transition-all cursor-pointer ${jdName ? "bg-indigo-50/50 border-indigo-200" : "bg-slate-50/50 border-slate-200 hover:border-slate-400 hover:bg-white"}`}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4 transition-all">
              {isUploading ? (
                <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-slate-900 animate-spin"></div>
              ) : (
                <svg
                  className={`w-6 h-6 ${jdName ? "text-indigo-500" : "text-slate-400"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              )}
            </div>
            <p className="text-base sm:text-lg font-bold text-slate-900 mb-1">
              {isUploading
                ? "Processing file..."
                : jdName || "Click to upload JD file"}
            </p>
            <p className="text-slate-400 text-sm font-medium tracking-tight">
              {jdName
                ? `Successfully extracted: ${jdName}`
                : "PDF, Text or Word Doc"}
            </p>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.txt,.docx"
              onChange={onFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      )}
    </Card>
  ),
);
JobDescriptionSection.displayName = "JobDescriptionSection";

// --- Main Form Component ---

const UploadForm: React.FC = () => {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [jobInputType, setJobInputType] = useState<"upload" | "paste">("paste");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState<"resume" | "jd" | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Data state
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [jdName, setJdName] = useState("");
  const [jdUrlInput, setJdUrlInput] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionWarning, setExtractionWarning] = useState<string | null>(
    null,
  );
  const [showExtractedPreview, setShowExtractedPreview] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(UPLOAD_DRAFT_STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.jobInputType) setJobInputType(draft.jobInputType);
      if (typeof draft.resumeText === "string") setResumeText(draft.resumeText);
      if (typeof draft.jdText === "string") setJdText(draft.jdText);
      if (typeof draft.resumeName === "string") setResumeName(draft.resumeName);
      if (typeof draft.jdName === "string") setJdName(draft.jdName);
      if (typeof draft.jdUrlInput === "string") setJdUrlInput(draft.jdUrlInput);
    } catch {
      localStorage.removeItem(UPLOAD_DRAFT_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(
          UPLOAD_DRAFT_STORAGE_KEY,
          JSON.stringify({
            jobInputType,
            resumeText,
            jdText,
            resumeName,
            jdName,
            jdUrlInput,
          }),
        );
      } catch {}
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [jobInputType, resumeText, jdText, resumeName, jdName, jdUrlInput]);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, type: "resume" | "jd") => {
      const file = e.target.files?.[0];
      if (!file) return;
      setError(null);
      setIsUploading(type);
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error || "Upload failed");
        if (type === "resume") {
          setResumeText(data.text);
          setResumeName(file.name);
        } else {
          setJdText(data.text);
          setJdName(file.name);
        }
      } catch (err: any) {
        setError(
          type === "resume" ? `Resume: ${err.message}` : `JD: ${err.message}`,
        );
      } finally {
        setIsUploading(null);
      }
    },
    [],
  );

  const handleAnalyze = async () => {
    if (!isSignedIn) {
      setShowAuthModal(true);
      return;
    }
    if (!resumeText) {
      setError("Please upload your resume first.");
      return;
    }

    let finalJdText = jdText;
    const isUrl = (text: string) =>
      /^(http:\/\/|https:\/\/)/i.test(text.trim());
    const trimmedJdText = jdText.trim();
    const trimmedUrlInput = jdUrlInput.trim();
    let urlToExtract: string | null = null;
    if (jobInputType === "upload") {
      if (isUrl(trimmedUrlInput)) {
        urlToExtract = trimmedUrlInput;
      }
    } else if (jobInputType === "paste" && isUrl(trimmedJdText)) {
      urlToExtract = trimmedJdText;
    }

    if (!jdText && !jdUrlInput) {
      setError("Please provide a job description (Paste URL/Text or Upload).");
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setProgress(5);

    if (urlToExtract) {
      setIsExtracting(true);
      try {
        const extractRes = await fetch("/api/extract-jd", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlToExtract }),
        });
        const extractData = await extractRes.json();

        if (!extractRes.ok) {
          setError(extractData?.error || "This link can't be accessed automatically.");
          setJobInputType("paste");
          setJdText("");
          setExtractionWarning(null);
          setIsExtracting(false);
          setIsAnalyzing(false);
          setProgress(0);
          return;
        }

        finalJdText = extractData.text;
        setJdText(finalJdText);
        setJobInputType("paste"); // Switch to paste mode to show extracted text
        setShowExtractedPreview(true);

        // Quality warning based on length
        const charCount = finalJdText.length;
        if (charCount < 500) {
          setExtractionWarning(
            `⚠️ Extracted text is short (${charCount} chars). This may result in lower accuracy. Please review and edit if needed.`,
          );
        } else if (charCount > 5000) {
          setExtractionWarning(
            `⚠️ Extracted text is very long (${charCount} chars). It may contain extra content. Please review and edit if needed.`,
          );
        } else {
          setExtractionWarning(
            `✓ Extracted ${charCount} characters from URL. Please review the text below before analyzing.`,
          );
        }

        setIsExtracting(false);
        console.log(`[Extraction Debug] URL: ${urlToExtract}`);
        console.log(`[Extraction Debug] Length: ${charCount}`);
        console.log(
          `[Extraction Debug] First 200 chars: ${finalJdText.substring(0, 200)}`,
        );
      } catch (err: any) {
        setError(err?.message || "This link can't be accessed automatically.");
        setJobInputType("paste"); // Switch to paste mode on any extraction error
        setJdText("");
        setExtractionWarning(null);
        setIsExtracting(false);
        setIsAnalyzing(false);
        setProgress(0);
        return;
      }
    }

    if (!finalJdText) {
      setError("No job description found. Please paste it manually.");
      setExtractionWarning(null);
      setIsAnalyzing(false);
      setProgress(0);
      return;
    }

    setProgress(15);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescriptionText: finalJdText }),
      });
      setProgress(40);
      const result = await response.json();
      if (response.status !== 200)
        throw new Error(result.error || "Analysis failed");
      setProgress(80);
      window.dispatchEvent(new Event("credits:updated"));
      localStorage.setItem("last_analysis_result", JSON.stringify(result));
      localStorage.removeItem(UPLOAD_DRAFT_STORAGE_KEY);
      setProgress(100);
      setTimeout(() => router.push("/result"), 500);
    } catch (err: any) {
      setError(`Analysis Error: ${err.message}`);
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10 relative px-4 sm:px-0">
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignIn={() => router.push("/sign-in?redirect_url=/upload")}
      />
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium animate-in slide-in-from-top-4">
          <span className="font-bold mr-2">Error:</span> {error}
        </div>
      )}
      <AnalysisOverlay
        isVisible={isAnalyzing}
        progress={progress}
        isExtracting={isExtracting}
      />

      <ResumeSection
        resumeName={resumeName}
        isUploading={isUploading === "resume"}
        onFileUpload={(e) => handleFileUpload(e, "resume")}
      />

      <JobDescriptionSection
        jobInputType={jobInputType}
        setJobInputType={setJobInputType}
        jdText={jdText}
        setJdText={setJdText}
        jdUrlInput={jdUrlInput}
        setJdUrlInput={setJdUrlInput}
        jdName={jdName}
        isUploading={isUploading === "jd"}
        onFileUpload={(e) => handleFileUpload(e, "jd")}
        extractionWarning={extractionWarning}
        setExtractionWarning={setExtractionWarning}
        showExtractedPreview={showExtractedPreview}
        setShowExtractedPreview={setShowExtractedPreview}
      />

      <div className="pt-4 sm:pt-8 text-center">
        <Button
          size="lg"
          className="h-14 sm:h-20 w-full max-w-sm text-base sm:text-xl shadow-2xl shadow-slate-900/10 active:scale-95 group sm:hover:scale-105 transition-transform cursor-pointer"
          onClick={handleAnalyze}
          disabled={isAnalyzing || !!isUploading}
        >
          {isAnalyzing ? "PROCESSING..." : "ANALYZE MY FIT"}
          {!isAnalyzing && (
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 ml-3 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          )}
        </Button>
        <p className="text-slate-400 font-bold text-xs tracking-[0.2em] mt-6 sm:mt-8 uppercase">
          AI-Powered Engine • Zero Data Retention • Instant Analysis
        </p>
      </div>
    </div>
  );
};

export default UploadForm;
