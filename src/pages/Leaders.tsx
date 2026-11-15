import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Zap, TrendingUp, Award, ListFilter, Target, Flame, Crown } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import BoostSheet from "../components/BoostSheet";

const Leaders: React.FC = () => {
  const { 
    user, leaderboard, setLeaderboard, 
    fetchLeaderboard, setBoostType, setShowBoostSheet,config
  } = useAppContext();

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  if (!user) return null;

  const currentLeaders = leaderboard.current === "mining" ? leaderboard.miningLeaders : leaderboard.totalLeaders;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-6 space-y-6 pb-24 text-white font-sans"
    >
      {/* Header Selector - Rainbow Toggle */}
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
            <ListFilter size={14} className="text-purple-400" />
            <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{config?.coin_ticker} Ranking</h1>
        </div>
        <div className="flex bg-[#090E1A] p-1 rounded-2xl border border-white/5 shadow-inner">
            {["total", "mining"]?.map((type) => (
                <button 
                    key={type}
                    onClick={() => setLeaderboard({ ...leaderboard, current: type })}
                    className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                        (leaderboard.current || "total") === type 
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' 
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                >
                    {type}
                </button>
            ))}
        </div>
      </div>

      {/* Prism Podium */}
      <div className="grid grid-cols-3 gap-2 items-end pt-8 relative">
        {/* Rank 2 - Purple Reflection */}
        {currentLeaders[1] && (
            <div className="flex flex-col items-center gap-2 pb-2">
                <div className="relative w-16 h-16 rounded-2xl bg-[#0F172A] border border-purple-500/30 flex items-center justify-center text-purple-400 font-black overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent" />
                    <span className="text-2xl relative z-10">{currentLeaders[1].username[0].toUpperCase()}</span>
                    <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-purple-500/20 text-[8px] font-bold">#2</div>
                </div>
                <p className="text-[9px] font-black uppercase text-slate-400 truncate w-full text-center tracking-tight">
                    {currentLeaders[1].username}
                </p>
            </div>
        )}

        {/* Rank 1 - The Spectrum King */}
        {currentLeaders[0] && (
            <div className="flex flex-col items-center gap-3 relative -top-4">
                <div className="relative group">
                    {/* Animated Rainbow Aura */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 blur-xl rounded-full opacity-40 animate-pulse" />
                    <div className="w-24 h-24 rounded-3xl bg-[#0F172A] border-2 border-white/20 flex items-center justify-center relative overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-cyan-500/20" />
                        <span className="text-4xl font-black bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent relative z-10">
                            {currentLeaders[0].username[0].toUpperCase()}
                        </span>
                        <div className="absolute bottom-0 w-full py-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white text-[8px] font-black text-center uppercase tracking-tighter">
                        Alpha
                        </div>
                    </div>
                    <Crown size={22} className="absolute -top-7 left-1/2 -translate-x-1/2 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                </div>
                <p className="text-[11px] font-black uppercase text-white tracking-[0.15em] drop-shadow-sm">
                    {currentLeaders[0].username}
                </p>
            </div>
        )}

        {/* Rank 3 - Cyan Reflection */}
        {currentLeaders[2] && (
            <div className="flex flex-col items-center gap-2 pb-2">
                <div className="relative w-16 h-16 rounded-2xl bg-[#0F172A] border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent" />
                    <span className="text-2xl relative z-10">{currentLeaders[2].username[0].toUpperCase()}</span>
                    <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-cyan-500/20 text-[8px] font-bold">#3</div>
                </div>
                <p className="text-[9px] font-black uppercase text-slate-400 truncate w-full text-center tracking-tight">
                    {currentLeaders[2].username}
                </p>
            </div>
        )}
      </div>

      {/* Local Node Stats - Glassmorphism */}
      <div className="relative group overflow-hidden bg-[#090E1A] border border-white/5 rounded-3xl shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />
        <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-2">
                <Target size={12} className="text-pink-500" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{config?.coin_ticker}_Position.sys</span>
            </div>
            <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-pink-500/50" />
                <div className="w-1 h-1 rounded-full bg-cyan-500/50" />
            </div>
        </div>
        <div className="p-5 flex justify-between items-center bg-gradient-to-br from-purple-500/[0.03] to-transparent">
            <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">My Rank</p>
                <p className="text-3xl font-black text-white tracking-tighter">
                    #{leaderboard.current === 'mining' ? (leaderboard.miningRank || '---') : (leaderboard.totalRank || '---')}
                </p>
            </div>
            <div className="text-right space-y-1">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">My balance</p>
                <div className="flex items-center justify-end gap-1.5">
                    <p className="text-2xl font-black bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                        {leaderboard.current === 'mining' ? (user.mining_balance ?? 0).toLocaleString() : (user.total_balance ?? 0).toLocaleString()}
                    </p>
                    <span className="text-[9px] text-slate-500 font-bold">{config?.coin_ticker}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Rainbow CTA Button */}
      <div className="relative group overflow-hidden p-[1px] rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 shadow-lg shadow-purple-500/20 active:scale-95 transition-all">
        <div className="bg-[#0F172A] rounded-[15px] p-4 flex items-center justify-between relative overflow-hidden">
            <div className="relative z-10">
                <p className="text-[10px] font-black uppercase text-white tracking-tighter flex items-center gap-2">
                    <Flame size={12} className="text-orange-500" /> Jump Leaderboard
                </p>
                <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">Climb the Leaderboard</p>
            </div>
            <button 
                onClick={() => { setBoostType('rank'); setShowBoostSheet(true); }}
                className="bg-white text-black px-5 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest relative z-10 hover:bg-slate-200 transition-colors"
            >
                Rank Boost
            </button>
            <TrendingUp size={80} className="absolute -right-4 -bottom-6 opacity-5 text-white rotate-12" />
        </div>
      </div>

      {/* Entities List - Rainbow Accents */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Award size={12} className="text-cyan-500" />
          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Top 20 Users</h3>
        </div>

        <div className="space-y-2">
            {currentLeaders?.map((leader, idx) => {
                const rank = idx + 1;
                const tonReward = rank <= 5 ? [500, 300, 200, 100, 50][idx] : null;

                return (
                    <div key={idx} className={`relative group overflow-hidden flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                        rank <= 3 ? 'bg-[#0F172A]/80 border-white/10' : 'bg-transparent border-white/5'
                    }`}>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-[10px] font-black border transition-colors ${
                                rank === 1 ? 'bg-gradient-to-br from-pink-500 to-purple-600 border-white/20 text-white' :
                                rank === 2 ? 'bg-purple-900/20 border-purple-500/30 text-purple-400' :
                                rank === 3 ? 'bg-cyan-900/20 border-cyan-500/30 text-cyan-400' :
                                'bg-white/5 border-white/5 text-slate-600'
                            }`}>
                                {rank.toString().padStart(2, '0')}
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-black uppercase text-white tracking-tight">{leader.username}</p>
                                {tonReward && (
                                    <div className="flex flex-row items-center gap-1.5 ">
                                        <div className="text-[7px] text-cyan-400 animate-pulse" >WIN</div>
                                        <p className="text-[7px] font-bold text-cyan-400 uppercase tracking-widest">+{tonReward} GRAM</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-right relative z-10">
                            <p className="text-sm font-black bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                                {(leader.total_balance ?? leader.mining_balance ?? 0).toLocaleString()}
                                <span className="text-[8px] text-slate-500 ml-1.5 font-bold uppercase tracking-widest">{config?.coin_ticker}</span>
                            </p>
                        </div>
                        
                        {/* Hover Gradient Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                );
            })}
        </div>
      </div>

      <BoostSheet />
    </motion.div>
  );
};

export default Leaders;