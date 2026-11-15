import React from "react";
import { motion } from "framer-motion";
import { Users, Share2, Copy, Gift, Zap, ShieldCheck, Terminal, Link2, Network, Sparkles, Radio } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const Friends: React.FC = () => {
  const { user, friends,config } = useAppContext();

  const handleShare = async () => {
    if (!user) return;
    const baseUrl = `${config?.telegram_bot_link}`;
    const referralLink = `${baseUrl}?start=r${user.id}\n\nJoin my squad! Get ${config?.referral_joining_bonus + config?.joining_bonus} ${config?.coin_ticker},  When join using my referral link  🌈`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Join ${config?.coin_ticker} Mining!`,
          text: 'Start refracting tokens with me!',
          url: referralLink,
        });
      } else {
        throw new Error();
      }
    } catch (err) {
      await navigator.clipboard.writeText(referralLink);
      alert("Spectrum Link Copied!");
    }
  };

  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="px-6 space-y-6 pb-24 text-white"
    >
      {/* Header Info - Glass Style */}
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
            <Radio size={14} className="text-pink-500 animate-pulse" />
            <h1 className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-400">Friends</h1>
        </div>
        <div className="bg-white/5 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
            <span className="text-[13px] font-black bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                NODE_ID: {user.id}
            </span>
        </div>
      </div>

      {/* Referral Telemetry Grid - Rainbow Borders */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "SQUAD", val: friends.length, icon: Users, color: "text-pink-400", border: "border-pink-500/20" },
          { label: "Refraction", val: `${config?.friends_commission_percentage_coin}%`, icon: Zap, color: "text-purple-400", border: "border-purple-500/20" },
          { label: "BONUS", val: (user.referral_balance).toLocaleString(), icon: Sparkles, color: "text-cyan-400", border: "border-cyan-500/20" }
        ]?.map((stat, i) => (
          <div key={i} className={`bg-[#0F172A] border ${stat.border} rounded-2xl p-4 flex flex-col items-center gap-2 relative overflow-hidden`}>
            <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${stat.color === 'text-pink-400' ? 'from-pink-500' : stat.color === 'text-purple-400' ? 'from-purple-500' : 'from-cyan-500'} to-transparent opacity-30`} />
            <stat.icon size={16} className={stat.color} />
            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <p className="text-xs font-black text-white">{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Main Invite Panel - Rainbow Gradient Glow */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-[22px] opacity-20 group-hover:opacity-40 transition duration-500 blur-sm" />
        
        <div className="relative bg-[#090E1A] border border-white/5 rounded-2xl overflow-hidden">
            <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-purple-400" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">refraction_protocol.sh</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                    <span className="text-[8px] font-bold text-cyan-500 uppercase">Broadcasting</span>
                </div>
            </div>
            
            <div className="p-6 space-y-5">
                <div className="space-y-4">
                    {[
                    { icon: Zap, text: `Earn ${config?.friends_commission_percentage_coin}% ${config?.coin_ticker} Reflection`, sub: "Passive yields from every Referral's Earnings", color: "text-pink-400" },
                    { icon: Gift, text: `Earn ${config?.referral_joining_bonus} ${config?.coin_ticker} Referral Bonus`, sub: "For every new user you refer", color: "text-purple-400" },
                    { icon: ShieldCheck, text: `Earn ${config?.friends_commission_percentage_ton}% GRAM Reflection`, sub: "Commission from friend's GRAM transactions", color: "text-cyan-400" }
                    ]?.map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                        <item.icon size={16} className={item.color} />
                        </div>
                        <div>
                        <p className="text-[13px] font-black uppercase text-white tracking-wide">{item.text}</p>
                        <p className="text-[8px] font-bold text-slate-500 uppercase">{item.sub}</p>
                        </div>
                    </div>
                    ))}
                </div>

                <div className="flex gap-3 pt-2">
                    <button 
                    onClick={async () => {
                        const baseUrl = `${config?.telegram_bot_link}`;
                        const referralLink = `${baseUrl}?start=r${user.id}\n\nJoin my squad! Get ${config?.referral_joining_bonus + config?.joining_bonus} ${config?.coin_ticker},  When you join using my referral link  🌈`;
                        await navigator.clipboard.writeText(referralLink);
                        alert("Referral link Copied!");
                    }}
                    className="flex-1 relative h-12 rounded-xl overflow-hidden font-black text-[13px] uppercase tracking-widest transition-all active:scale-95 group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 animate-gradient-x" />
                        <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                            <Copy size={14} /> Copy Referral Link
                        </span>
                    </button>
                    <button 
                    onClick={handleShare}
                    className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all"
                    >
                        <Share2 size={18} className="text-slate-300" />
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Peers List - Refracted Style */}
      <div className="space-y-4">
      <div className="flex items-center justify-between w-full px-1">
      {/* Left: Icon + Friends */}
      <div className="flex items-center gap-2">
      <Network size={12} className="text-pink-500" />
      <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
      Friends
      </h3>
      </div>

      

      {/* Right: Count */}
      <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
      {friends.length} Friends
      </h3>
      </div>
        <div className="space-y-2.5">
          {friends.length > 0 ? friends?.map(friend => (
            <div key={friend.id} className="group relative overflow-hidden bg-[#0F172A]/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between transition-all hover:border-purple-500/30">
              <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-cyan-500 blur-md opacity-20" />
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-cyan-500/20 flex items-center justify-center text-white font-black text-sm border border-white/10">
                    {friend.username[0].toUpperCase()}
                    </div>
                </div>
                <div>
                  <p className="text-[11px] font-black text-white uppercase tracking-tight">{friend.username}</p>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
                    {friend.total_balance.toLocaleString()} {config?.coin_ticker} <span className="text-slate-600">Refracted</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-black bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    +{(friend.total_balance * (config?.friends_commission_percentage_coin/100)).toLocaleString()} {config?.coin_ticker} 
                </p>
                <p className="text-[7px] text-slate-600 font-black uppercase">Refraction</p>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
              <div className="inline-flex p-3 rounded-full bg-white/5 mb-3">
                <Users size={20} className="text-slate-700" />
              </div>
              <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.4em]">Its alone here</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Friends;