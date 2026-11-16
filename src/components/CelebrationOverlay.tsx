import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, Terminal, Cpu, Layers, Activity } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const CelebrationOverlay: React.FC = () => {
  const { showCelebration, setShowCelebration, celebrationContent,config } = useAppContext();

  return (
    <AnimatePresence>
      {showCelebration && (
        <>
          {/* Prismatic Neural-Link Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCelebration(false)}
            className="fixed inset-0 z-[120] bg-[#07090c]/95 backdrop-blur-xl"
          />

          {/* Core Spectrum Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[130] flex items-center justify-center p-4 pointer-events-auto"
          >
            <div className="relative w-full max-w-[340px]">
              
              {/* Mechanical Rail Accents (Rainbow) */}
              <div className="absolute -top-3 -left-3 w-16 h-16 border-t-4 border-l-4 border-brand-500 z-10 opacity-50" />
              <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-4 border-r-4 border-brand-500 z-10 opacity-50" />

              <div className="relative bg-[#171b22] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(255,224,0,0.1)]"
                   style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%)' }}>
                
                {/* Top Power Rail (Rainbow Gradient) */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 via-brand-500 to-brand-500" />

                {/* Header HUD: Industrial Style */}
                <div className="bg-white/[0.03] border-b border-white/10 px-6 py-4 flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse shadow-[0_0_8px_#ffcf00]" />
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.25em]">Protocol_Refraction</span>
                   </div>
                   <button onClick={() => setShowCelebration(false)} className="bg-neutral-900 border border-neutral-700 p-1.5 rounded-lg text-neutral-500 hover:text-white transition-colors">
                      <X size={14} />
                   </button>
                </div>

                <div className="p-8 space-y-8">
                  {/* Spectrum Reactor Visual */}
                  <div className="relative mx-auto w-36 h-36 flex items-center justify-center">
                     {/* Outer Rainbow Spinner */}
                     <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-2 border-dashed border-white/10 rounded-full"
                     />
                     <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-2 border-2 border-transparent border-t-brand-400 border-b-brand-500 rounded-full opacity-60"
                     />
                     
                     {/* Core Hexagon */}
                     <div className="relative w-16 h-16 bg-black border-2 border-white/20 rounded-2xl rotate-45 flex items-center justify-center shadow-[0_0_40px_rgba(255,224,0,0.4)] overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-500 via-brand-500 to-brand-500 opacity-20 group-hover:opacity-40 transition-opacity" />
                        <Zap size={28} className="text-white fill-white -rotate-45 relative z-10" />
                     </div>
                  </div>

                  {/* Terminal Text Block */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h2 className="text-4xl font-black uppercase tracking-tighter   leading-none mb-1">
                        <span className="bg-gradient-to-r from-brand-400 via-brand-400 to-brand-400 bg-clip-text text-transparent">
                            {celebrationContent?.title || "SYNCHRONIZED"}
                        </span>
                      </h2>
                      <div className="flex justify-center items-center gap-2">
                         <div className="w-8 h-[1px] bg-neutral-800" />
                         <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Data_Verified</span>
                         <div className="w-8 h-[1px] bg-neutral-800" />
                      </div>
                    </div>



 {( celebrationContent?.amount > 0)?
(<div className="relative py-4">
  {/* Sub-label for context */}
  <div className="flex justify-center items-center gap-2 mb-1">
    <span className="text-[8px] font-black text-brand-500/60 uppercase ">Yield_Generated</span>
  </div>

  <div className="relative flex justify-center items-center">
    {/* Background Ghost Text for "Glow" depth */}
    <span className="absolute inset-0 flex items-center justify-center text-5xl font-black text-brand-500/20 blur-lg select-none">
      +{celebrationContent?.amount?.toLocaleString() || "1000"}
    </span>
    
      {/* Main Counter */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
        className="relative flex items-baseline gap-1"
      >
       
        (<span className="text-5xl font-black italic tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          <span className="text-brand-500">+</span>
          {celebrationContent?.amount || "1000"}
        </span>)
        
        
        {/* Unit Tag */}
        <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest border-l border-white/20 pl-2">
          {config?.coin_ticker}
        </span>
      </motion.div>

      {/* Decorative Tech Bracket */}
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-brand-500 to-transparent opacity-50" />
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-t from-brand-500 to-transparent opacity-50" />
    </div>
      </div>
 ):""}


                    <div className="bg-black/50 border border-neutral-800 p-5 rounded-xl relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-500 to-brand-500" />
                      <p className="text-[10px] text-neutral-300 font-black leading-relaxed text-center uppercase tracking-tight">
                        {celebrationContent?.message || "Quantum packets merged successfully into local chassis."}
                      </p>
                    </div>
                  </div>


                  {/* Rainbow Action Button */}
                  <button 
                    onClick={() => setShowCelebration(false)}
                    className="relative w-full group overflow-hidden rounded-xl p-[2px] active:scale-95 transition-all shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-500 via-brand-500 to-brand-500 animate-gradient-x" />
                    <div className="relative bg-[#171b22] py-4 rounded-[10px] flex items-center justify-center gap-2 group-hover:bg-transparent transition-colors duration-300">
                        <span className="text-white font-black text-[11px] uppercase ">Confirm</span>
                    </div>
                  </button>
                </div>

                {/* Scanline Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.02)_50%,transparent_50%)] bg-[length:100%_4px] z-20" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CelebrationOverlay;
