import React from "react";
import { motion } from "framer-motion";
import { 
  Calendar, Twitter, Zap, Trophy, 
  Pickaxe, Users, UserCheck, Send, 
  ChevronRight, ArrowUpRight, 
  Layers, Wallet, Activity, Target,
  ArrowRight,
  Instagram,
  Youtube,
  Globe
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import CheckinModal from "../components/CheckinModal";
import AchievementSection from "../components/AchievementSection";

const Home: React.FC = () => {
  const { user, setShowCheckinModal,config } = useAppContext();

  if (!user) return null;

  // Spectrum Mapping: Assigning colors based on the rainbow spectrum
  const earningsSummary = [
    { label: "Daily Checkin", value: user.checkin_balance, icon: Calendar, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    { label: "Mining", value: user.mining_balance, icon: Pickaxe, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    { label: "Tasks", value: user.task_balance, icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    { label: "Referrals", value: user.referral_balance, icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Seniority", value: user.age_reward, icon: Trophy, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Joining Bonus", value: user.joining_bonus, icon: UserCheck, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-6 space-y-6 pb-24 text-slate-200"
    >
      {/* Iridescent Balance Hero */}
      <div className="pt-2">
        <div className="relative group">
          {/* Rotating Rainbow Glow */}
          <motion.div 
            animate={{ rotate: 360 }}
           
            className="absolute -inset-1 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 rounded-[10px] blur-2xl opacity-20"
          />
          
    <div className="relative overflow-hidden bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 rounded-[20px] p-8 shadow-2xl">
  {/* Animated Mesh Gradient Background */}
  <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-overlay" />
  
 <div className="flex flex-col items-center mb-5 bg-white/5 px-4 py-2 rounded-[10px] border border-white/10 w-full">
  {/* Price Row */}
  <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full gap-2">

    {/* Current Price */}
    <div className="flex flex-col items-start">
      <span className="text-[8px] sm:text-[9px] font-black text-amber-400 animate-pulse">
        Current Price
      </span>
      <span className="text-[11px] sm:text-xs font-black text-white">
        {config?.coinPriceTON} GRAM
      </span>
    </div>

    {/* Center Arrow */}
    <ArrowRight
      size={12}
      className="text-white animate-pulse"
    />

    {/* Next Price */}
    <div className="flex flex-col items-end">
      <span className="text-[8px] sm:text-[9px] font-black text-green-400">
        Next Price
      </span>
      <span className="text-[11px] sm:text-xs font-black text-white">
        {config?.coinPriceNextTON} GRAM
      </span>
    </div>

  </div>

  {/* Date */}
  <div className="text-[8px] sm:text-[9px] text-white/60 mt-1 text-center">
    Next Price Date: 01-11-2026
  </div>
</div>
  
  <div className="relative z-10 flex flex-col items-center">
    
    {/* Label Badge */}
    <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-[10px] border border-white/10 mb-6">
      <Activity size={10} className="text-white animate-pulse" />
      <span className="text-[9px] font-black uppercase tracking-[0.4em]  text-white/70">Your Balance</span>
    </div>
    
    <div className="flex flex-col items-center gap-1">
      <motion.h1 
         className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tighter tabular-nums"
      >
        {Number(user.total_balance ?? 0).toLocaleString(undefined, { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 0 
        })}
      </motion.h1>

      

      {/* Branding Line */}
      <div className="flex items-center gap-2 mt-2">
          <div className="h-px w-4 bg-gradient-to-r from-transparent to-red-500" />
          <span className="text-[10px] font-black text-white/40 uppercase ">{config?.coin_ticker}</span>
          <div className="h-px w-4 bg-gradient-to-l from-transparent to-purple-500" />
      </div>
      {/* USDT Value - Added Section */}
      <div className="flex items-center gap-1.5 opacity-60">
        <span className="text-sm font-medium text-white/80">≈</span>
        <span className="text-sm font-bold text-white tracking-wide">
          {/* Replace '0.01' with your actual conversion rate */}
          {(Number(user.total_balance ?? 0) * config?.coinPriceTON).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </span>
        <span className="text-[10px] font-black text-white/50">GRAM</span>
      </div>
    </div>

    {/* Rainbow Progress Bar */}
    <div className="w-full h-1.5 bg-white/5 rounded-[10px] mt-8 overflow-hidden p-[1px]">
      <div className="h-full w-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 rounded-[10px]" />
    </div>
  </div>
</div>
        </div>
      </div>

  {/* Glass Quick Actions */}
<div className="flex justify-center px-2 pb-4">
  <div className="flex items-center justify-between w-full max-w-md bg-white/5 border border-white/10 rounded-2xl px-3 py-3 backdrop-blur-md">

    {/* CHECK-IN */}
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => setShowCheckinModal(true)}
      className="flex flex-col items-center flex-1"
    >
      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
        <Calendar size={16} />
      </div>
      <span className="text-[8px] font-bold text-white/70 mt-1">
        Check
      </span>
    </motion.button>

    {/* TWITTER */}
    <a
      href={config?.twitter}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col items-center flex-1"
    >
      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
        <Twitter size={16} />
      </div>
      <span className="text-[8px] font-bold text-white/70 mt-1">
        X
      </span>
    </a>

    {/* TELEGRAM */}
    <a
      href={config?.telegramChannel}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col items-center flex-1"
    >
      <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
        <Send size={16} />
      </div>
      <span className="text-[8px] font-bold text-white/70 mt-1">
        TG
      </span>
    </a>
     <a
      href={config?.website || "#"}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col items-center flex-1"
    >
      <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
        <Globe size={16} />
      </div>
      <span className="text-[8px] font-bold text-white/70 mt-1">
        WEB
      </span>
    </a>

    {/* INSTAGRAM */}
    {/* <a
      href={config?.instagram || "#"}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col items-center flex-1"
    >
      <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
        <Instagram size={16} />
      </div>
      <span className="text-[8px] font-bold text-white/70 mt-1">
        IG
      </span>
    </a> */}

    {/* YOUTUBE */}
    {/* <a
      href={config?.youtube || "#"}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col items-center flex-1"
    >
      <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
        <Youtube size={16} />
      </div>
      <span className="text-[8px] font-bold text-white/70 mt-1">
        YT
      </span>
    </a> */}

  </div>
</div>
      {/* Achievement Blocks */}
      <div className="space-y-6">
        <AchievementSection type="all" />

      </div>

      {/* Spectrum Asset Report */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-[#0B1220] border border-white/10 flex items-center justify-center text-pink-400">
                <Target size={14} className="text-white/40" />
                </div>
                <h2 className="text-[9px] font-black uppercase  text-slate-500">Earning_Summary</h2>
            </div>
            <div className="h-px flex-1 mx-4 bg-gradient-to-r from-white/5 to-transparent" />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {earningsSummary?.map((item, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-[#0F172A] border ${item.border} rounded-[10px] p-4 flex flex-col gap-3 relative overflow-hidden group hover:bg-white/[0.02] transition-colors`}
            >
              <div className={`absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${item.color}`}>
                <item.icon size={48} />
              </div>
              
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-[10px] ${item.bg} ${item.color} border border-white/5 shadow-inner`}>
                  <item.icon size={14} />
                </div>
                <ArrowUpRight size={10} className="text-white/20" />
              </div>

              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{item.label}</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-sm font-black text-white tabular-nums">
                        {Number(item.value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`text-[7px] font-bold uppercase ${item.color} opacity-60`}>{config?.coin_ticker}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <CheckinModal />
    </motion.div>
  );
};

export default Home;