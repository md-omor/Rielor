import Image from "next/image";
import React from 'react';

import logo from "@/assets/logo.png";

const Footer: React.FC = () => {
  return (
    <footer className="py-12 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <Image
            src={logo}
            alt="Rielor logo"
            width={32}
            height={32}
            className="w-8 h-8 rounded-lg object-contain"
          />
          <span className="font-bold text-xl text-slate-900 tracking-tight">Rielor</span>
        </div>
        <div className="text-slate-400 text-sm">
          © {new Date().getFullYear()} Rielor. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
