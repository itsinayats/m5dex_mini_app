import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ShieldCheck, Cpu } from "lucide-react";

interface CelebrationProps {
  show: boolean;
  content: { title: string; message: string };
}

const Celebration: React.FC<CelebrationProps> = ({ show, content }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#101318]/80 backdrop-blur-md pointer-events-none"
        >
          {/* Decorative Grid Background for Overlay */}
          <div className="absolute inset-0 opacity-10" 
               style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
          />

          <motion.div 
            initial={{ scale: 0.8, y: 20, rotateX: 15 }}
            animate={{ scale: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-[#171b22] border-2 border-emerald-500/30 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(16,185,129,0.2)] text-center space-y-6 max-w-xs overflow-hidden"
          >
            {/* Top Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-brand-500" />

            {/* Core Success Icon */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-emerald-500/20 rounded-full" 
                />
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl border border-emerald-500/40 flex items-center justify-center shadow-[inset_0_0_15px_rgba(16,185,129,0.2)]">
                    <Zap size={32} className="text-emerald-400 fill-emerald-400 animate-pulse" />
                </div>
            </div>

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-center gap-2 mb-1">
                 <Cpu size={12} className="text-brand-500" />
                 <span className="text-[9px] font-black text-neutral-500 uppercase ">Protocol_Success</span>
              </div>
              
              <h2 className="text-3xl font-black uppercase tracking-tighter text-white leading-none">
                {content.title}
              </h2>
              
              <div className="bg-emerald-500/5 border border-emerald-500/10 py-2 px-4 rounded-xl">
                <p className="text-[10px] text-emerald-400 font-mono font-bold tracking-tight">
                  {">"} {content.message}
                </p>
              </div>
            </div>

            {/* Footer Status */}
            <div className="flex justify-center items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5">
                    <ShieldCheck size={10} className="text-emerald-500" />
                    <span className="text-[8px] font-black text-neutral-500 uppercase">Verified</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-neutral-800" />
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[8px] font-black text-neutral-500 uppercase">Live_Node</span>
                </div>
            </div>

            {/* Scanning Line Effect */}
            <motion.div 
                animate={{ y: [0, 240, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-0 h-px bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.5)] z-0"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Celebration;
