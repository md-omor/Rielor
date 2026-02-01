"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect } from "react";

const SignUpPage = () => {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.search) {
      window.history.replaceState({}, "", url.pathname);
    }
  }, []);

  return (
    <div className="min-h-screen py-32 bg-slate-50 flex items-center justify-center px-4">
      <SignUp
        appearance={{
          elements: {
            card: "shadow-xl shadow-slate-200/50 border border-slate-100 rounded-3xl",
            headerTitle: "text-2xl font-bold text-slate-900",
            headerSubtitle: "text-slate-500",
            socialButtonsBlockButton: "rounded-xl",
            formButtonPrimary: "bg-slate-900 hover:bg-slate-800",
          },
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
      />
    </div>
  );
};

export default SignUpPage;
