import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  X, 
  Zap, 
  Timer, 
  Cpu, 
  Activity, 
  Layers 
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

const CheckinModal: React.FC = () => {
  const { showCheckinModal, setShowCheckinModal, user, handleCheckin,config } = useAppContext();
  const [timeLeft, setTimeLeft] = useState<string>("00:00:00");

  if (!user) return null;

  const checkinDays = Array.from({ length: 120 }, (_, i) => ({
    day: i + 1,
    reward: 100 + (i * 100)
  }));

  const currentDayIndex = user.checkin_streak; 
  const currentDayData = checkinDays[currentDayIndex];
  const lastCheckinTime = user.last_checkin ? new Date(user.last_checkin).getTime() : 0;
  const canClaimToday = !lastCheckinTime || (Date.now() - lastCheckinTime >= 24 * 60 * 60 * 1000);

  useEffect(() => {
    if (canClaimToday || !showCheckinModal) return;

    const updateTimer = () => {
      const now = Date.now();
      const nextAvailable = lastCheckinTime + (24 * 60 * 60 * 1000);
      const diff = nextAvailable - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    };

    const timerId = setInterval(updateTimer, 1000);
    updateTimer();
    return () => clearInterval(timerId);
  }, [lastCheckinTime, canClaimToday, showCheckinModal]);

  return (
    <AnimatePresence>
      {showCheckinModal && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCheckinModal(false)}
            className="fixed inset-0 bg-[#07090c]/90 z-[60] backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed bottom-0 left-0 right-0 bg-[#171b22] rounded-t-[2.5rem] p-6 z-[70] border-t-2 border-neutral-800 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] h-[85vh] flex flex-col overflow-hidden"
          >
            {/* Spectral Power Rail */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-500 via-brand-500 to-brand-500" />
            
            <div className="w-12 h-1.5 bg-neutral-800 rounded-full mx-auto mb-8 shrink-0 mt-2" />
            
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8 shrink-0 px-1">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-black border-2 border-neutral-800 rounded-2xl shadow-inner">
                  <Activity size={20} className="text-brand-500 animate-pulse" />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="text-[10px] font-black text-neutral-500 uppercase    leading-tight">Reward</h4>
                  <p className="text-lg font-black text-white uppercase tracking-tighter   leading-tight">Daily Check in</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCheckinModal(false)} 
                className="w-10 h-10 flex items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 active:scale-90 transition-all"
              >
                <X size={20} />
              </button>
            </div>

 {/* PRIMARY FOCUS: SYNC MODULE */}
{/* PRIMARY FOCUS: COMPACT SYNC MODULE */}
<div className="mb-4 shrink-0 px-1">
  <div
    onClick={() => canClaimToday ? handleCheckin() : null}
    className={`relative p-4 rounded-2xl border flex items-center justify-between transition-all overflow-hidden bg-black shadow-xl ${
      canClaimToday 
      ? 'border-brand-500/40 cursor-pointer active:scale-[0.98]'
      : 'border-neutral-800'
    }`}
  >
    {/* HUD Grid Overlay (Subtle) */}
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
         style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '12px 12px' }} />

    {/* LEFT: REWARD DATA */}
    <div className="relative z-10 flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
          <div className={`w-1 h-1 rounded-full ${canClaimToday ? 'bg-brand-500 animate-ping' : 'bg-neutral-700'}`} />
          <span className={`text-[7px] font-black uppercase tracking-[0.1em]   ${canClaimToday ? 'text-brand-500' : 'text-neutral-600'}`}>
            {canClaimToday ? `Ready_D${currentDayData.day}` : `Chekin_Locked`}
          </span>
      </div>
      <div className="flex items-baseline gap-1.5">
          <h2 className="text-3xl font-black text-white tracking-tighter   tabular-nums leading-none">
              {currentDayData.reward.toLocaleString()}
          </h2>
          <span className="text-[8px] font-black text-neutral-500 uppercase  ">{config?.coin_ticker}</span>
      </div>
    </div>

    {/* RIGHT: ACTION OR TIMER (Compact Bay) */}
    <div className="relative z-10 w-40">
      {canClaimToday ? (
        <div className="relative h-10 rounded-lg overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500 via-brand-500 to-brand-500 animate-gradient-x" />
            <div className="absolute inset-[1px] bg-black rounded-[7px] flex items-center justify-center gap-2 group-hover:bg-transparent transition-colors">
                <Zap size={12} className="text-white fill-white" />
                <span className="text-white font-black text-[9px] uppercase tracking-widest">CHECK IN</span>
            </div>
        </div>
      ) : (
        <div className="h-10 bg-neutral-900/40 border border-neutral-800 rounded-lg flex items-center px-3 gap-3">
           <Timer size={12} className="text-neutral-600 shrink-0" />
           <div className="flex flex-col">
              <span className="text-[6px] font-black text-neutral-600 uppercase   leading-none mb-0.5">NEXT_CHECK_IN</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-black text-white   tabular-nums leading-none">{timeLeft}</span>
                <span className="text-[6px] font-black text-brand-500/40 uppercase">REM</span>
              </div>
           </div>
        </div>
      )}
    </div>

    {/* Bottom Accent Rail */}
    <div className="absolute bottom-0 left-0 h-[1px] bg-neutral-800 w-full">
       <div className={`h-full bg-gradient-to-r from-transparent via-brand-500/50 to-transparent ${canClaimToday ? 'w-full' : 'w-1/3'}`} />
    </div>
  </div>
</div>
            {/* HISTORY GRID */}
            <div className="flex-1 overflow-y-auto no-scrollbar border-t-2 border-neutral-900 pt-6 px-1">
              <div className="flex items-center gap-2 mb-6 px-1">
                 <Layers size={14} className="text-neutral-600" />
                 <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest  ">Check in history</span>
              </div>
              
              <div className="grid grid-cols-4 gap-4 pb-12">
                {checkinDays?.map((item) => {
                  const isCompleted = user.checkin_streak >= item.day;
                  const isCurrent = user.checkin_streak + 1 === item.day;
                  
                  return (
                    <div 
                      key={item.day}
                      className={`relative h-20 rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${
                        isCompleted 
                        ? 'bg-emerald-500/5 border-emerald-500/20' 
                        : isCurrent
                        ? 'bg-neutral-900 border-brand-500 shadow-[0_0_15px_rgba(255,224,0,0.2)]'
                        : 'bg-black border-neutral-800/40 opacity-40'
                      }`}
                    >
                      {isCurrent && (
                        <div className="absolute -top-[1px] -right-[1px] w-3.5 h-3.5 bg-brand-500 rounded-bl-lg rounded-tr-lg flex items-center justify-center">
                            <Activity size={8} className="text-black" />
                        </div>
                      )}

                      <p className={`text-[7px] font-black uppercase tracking-widest   mb-1 ${isCompleted ? 'text-emerald-500' : isCurrent ? 'text-brand-400' : 'text-neutral-700'}`}>
                        DAY_{item.day}
                      </p>
                      
                      <div className="flex items-center gap-1 mb-1">
                         <Zap size={8} className={isCompleted ? "text-emerald-500 fill-emerald-500" : isCurrent ? "text-brand-400 fill-brand-400" : "text-neutral-800"} />
                         <p className={`text-[10px] font-black   tabular-nums leading-none ${isCompleted ? 'text-white' : isCurrent ? 'text-white' : 'text-neutral-600'}`}>
                            {item.reward}
                         </p>
                      </div>

                      {isCompleted && (
                        <div className="w-3.5 h-3.5 bg-emerald-500 rounded-md flex items-center justify-center">
                           <CheckCircle2 size={10} className="text-black" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer action always centered at bottom */}
            <div className="pt-4 pb-2 shrink-0 border-t-2 border-neutral-900 mt-auto">
              <button 
                onClick={() => setShowCheckinModal(false)}
                className="w-full h-14 rounded-[1.25rem] bg-neutral-900 border-2 border-neutral-800 font-black text-neutral-500 uppercase tracking-[0.4em] text-[10px] active:scale-95 transition-all   hover:text-white"
              >
                Disconnect_Terminal
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CheckinModal;
