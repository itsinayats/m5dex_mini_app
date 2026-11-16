import React from 'react';
import { Loader2 } from "lucide-react";

interface LoaderProps {
  message?: string;
}

const FullScreenLoader: React.FC<LoaderProps> = ({ message = "Processing..." }) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/5 border border-white/10 shadow-2xl">
        {/* Animated Spinner */}
        <Loader2 size={48} className="text-brand-500 animate-spin" />
        
        {/* Optional Message */}
        <p className="text-sm font-black uppercase tracking-widest text-white/80 animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};

export default FullScreenLoader;
