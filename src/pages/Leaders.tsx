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
            <ListFilter size={14} className="text-brand-400" />
            <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">{config?.coin_ticker} Ranking</h1>
        </div>
        <div className="flex bg-[#101318] p-1 rounded-2xl border border-white/5 shadow-inner">
            {["total", "mining"]?.map((type) => (
                <button 
                    key={type}
                    onClick={() => setLeaderboard({ ...leaderboard, current: type })}
                    className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                        (leaderboard.current || "total") === type 
                        ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg'
                        : 'text-neutral-600 hover:text-neutral-400'
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
                <div className="relative w-16 h-16 rounded-2xl bg-[#171b22] border border-brand-500/30 flex items-center justify-center text-brand-400 font-black overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 to-transparent" />
                    <span className="text-2xl relative z-10">{currentLeaders[1].username[0].toUpperCase()}</span>
                    <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-brand-500/20 text-[8px] font-bold">#2</div>
                </div>
                <p className="text-[9px] font-black uppercase text-neutral-400 truncate w-full text-center tracking-tight">
                    {currentLeaders[1].username}
                </p>
            </div>
        )}

        {/* Rank 1 - The Spectrum King */}
        {currentLeaders[0] && (
            <div className="flex flex-col items-center gap-3 relative -top-4">
                <div className="relative group">
                    {/* Animated Rainbow Aura */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-brand-500 via-brand-500 to-brand-500 blur-xl rounded-full opacity-40 animate-pulse" />
                    <div className="w-24 h-24 rounded-3xl bg-[#171b22] border-2 border-white/20 flex items-center justify-center relative overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 via-brand-500/20 to-brand-500/20" />
                        <span className="text-4xl font-black bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent relative z-10">
                            {currentLeaders[0].username[0].toUpperCase()}
                        </span>
                        <div className="absolute bottom-0 w-full py-1 bg-gradient-to-r from-brand-500 via-brand-500 to-brand-500 text-neutral-950 text-[8px] font-black text-center uppercase tracking-tighter">
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
                <div className="relative w-16 h-16 rounded-2xl bg-[#171b22] border border-brand-500/30 flex items-center justify-center text-brand-400 font-black overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 to-transparent" />
                    <span className="text-2xl relative z-10">{currentLeaders[2].username[0].toUpperCase()}</span>
                    <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-brand-500/20 text-[8px] font-bold">#3</div>
                </div>
                <p className="text-[9px] font-black uppercase text-neutral-400 truncate w-full text-center tracking-tight">
                    {currentLeaders[2].username}
                </p>
            </div>
        )}
      </div>

      {/* Local Node Stats - Glassmorphism */}
      <div className="relative group overflow-hidden bg-[#101318] border border-white/5 rounded-3xl shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
        <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-2">
                <Target size={12} className="text-brand-500" />
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{config?.coin_ticker}_Position</span>
            </div>
            <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-brand-500/50" />
                <div className="w-1 h-1 rounded-full bg-brand-500/50" />
            </div>
        </div>
        <div className="p-5 flex justify-between items-center bg-gradient-to-br from-brand-500/[0.03] to-transparent">
            <div className="space-y-1">
                <p className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.2em]">My Rank</p>
                <p className="text-3xl font-black text-white tracking-tighter">
                    #{leaderboard.current === 'mining' ? (leaderboard.miningRank || '---') : (leaderboard.totalRank || '---')}
                </p>
            </div>
            <div className="text-right space-y-1">
                <p className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.2em]">My balance</p>
                <div className="flex items-center justify-end gap-1.5">
                    <p className="text-2xl font-black bg-gradient-to-r from-brand-400 to-brand-400 bg-clip-text text-transparent">
                        {leaderboard.current === 'mining' ? (user.mining_balance ?? 0).toLocaleString() : (user.total_balance ?? 0).toLocaleString()}
                    </p>
                    <span className="text-[9px] text-neutral-500 font-bold">{config?.coin_ticker}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Rainbow CTA Button */}
      <div className="relative group overflow-hidden p-[1px] rounded-2xl bg-gradient-to-r from-brand-500 via-brand-500 to-brand-500 shadow-lg shadow-brand-500/20 active:scale-95 transition-all">
        <div className="bg-[#171b22] rounded-[15px] p-4 flex items-center justify-between relative overflow-hidden">
            <div className="relative z-10">
                <p className="text-[10px] font-black uppercase text-white tracking-tighter flex items-center gap-2">
                    <Flame size={12} className="text-orange-500" /> Jump Leaderboard
                </p>
                <p className="text-[8px] font-bold text-neutral-500 uppercase mt-0.5">Climb the Leaderboard</p>
            </div>
            <button 
                onClick={() => { setBoostType('rank'); setShowBoostSheet(true); }}
                className="bg-white text-black px-5 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest relative z-10 hover:bg-neutral-200 transition-colors"
            >
                Rank Boost
            </button>
            <TrendingUp size={80} className="absolute -right-4 -bottom-6 opacity-5 text-white rotate-12" />
        </div>
      </div>

      {/* Entities List - Rainbow Accents */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Award size={12} className="text-brand-500" />
          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Top 20 Users</h3>
        </div>

        <div className="space-y-2">
            {currentLeaders?.map((leader, idx) => {
                const rank = idx + 1;
                const tonReward = rank <= 5 ? [500, 300, 200, 100, 50][idx] : null;

                return (
                    <div key={idx} className={`relative group overflow-hidden flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                        rank <= 3 ? 'bg-[#171b22]/80 border-white/10' : 'bg-transparent border-white/5'
                    }`}>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-[10px] font-black border transition-colors ${
                                rank === 1 ? 'bg-gradient-to-br from-brand-500 to-brand-600 border-white/20 text-[#000]' :
                                rank === 2 ? 'bg-brand-900/20 border-brand-500/30 text-brand-400' :
                                rank === 3 ? 'bg-brand-900/20 border-brand-500/30 text-brand-400' :
                                rank === 4 ? 'bg-brand-900/20 border-brand-500/30 text-brand-400' :
                                rank === 5 ? 'bg-brand-900/20 border-brand-500/30 text-brand-400' :
                                'bg-white/5 border-white/5 text-neutral-600'
                            }`}>
                                <span className="text-[#000]" />
                                {rank.toString().padStart(2, '0')}
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-black uppercase text-white tracking-tight">{leader.username}</p>
                                {tonReward && (
                                    <div className="flex flex-row items-center gap-1.5 ">
                                        <div className="text-[7px] text-brand-400 animate-pulse" >WIN</div>
                                        <p className="text-[7px] font-bold text-brand-400 uppercase tracking-widest">+{tonReward} GRAM</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-right relative z-10">
                            <p className="text-sm font-black bg-gradient-to-r from-brand-400 to-brand-400 bg-clip-text text-transparent">
                                {(leader.total_balance ?? leader.mining_balance ?? 0).toLocaleString()}
                                <span className="text-[8px] text-neutral-500 ml-1.5 font-bold uppercase tracking-widest">{config?.coin_ticker}</span>
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
