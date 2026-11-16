import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Award, Target, Zap,
  TrendingUp, Cpu, Layers, Trophy
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

interface AchievementSectionProps {
  type?: "referral" | "tier" | "milestone" | "all";
}

const AchievementSection: React.FC<AchievementSectionProps> = ({ type = "all" }) => {
  const {
    user,
    claimReferralAchievement,
    claimTierAchievement,
    claimMilestoneAchievement,
    config
  } = useAppContext();

  const [referralAchievements, setReferralAchievements] = useState<any[]>([]);
  const [tierAchievements, setTierAchievements] = useState<any[]>([]);
  const [milestoneAchievements, setMilestoneAchievements] = useState<any[]>([]);

  if (!user) return null;

  useEffect(() => {
    setReferralAchievements(config?.referralAchievements || []);
    setTierAchievements(config?.tierAchievements || []);
    setMilestoneAchievements(config?.milestoneAchievements || []);
  }, [config]);

  return (
    <div className="space-y-10 text-white">

      {/* ================= MILESTONE ================= */}
      {(type === "all" || type === "milestone") && (
        <div className="space-y-4">
<div className="flex justify-between items-center px-1">

  {/* LEFT SECTION */}
  <div className="flex items-center gap-2">

    <div className="w-8 h-8 rounded-lg bg-[#13171d] border border-white/10 flex items-center justify-center text-brand-400">
      <Target size={16} />
    </div>

    <div>
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/90">
        Milestone Achievements
      </h2>

      <p className="text-[9px] text-white/40">
        Protocol Evolution
      </p>
    </div>

  </div>

  {/* RIGHT SECTION (BALANCE) */}
  <div className="text-right">

    <div className="text-[10px] font-bold text-white">
      {Number(user.total_balance).toLocaleString()}{" "}
      <span className="text-white/60">
        {config?.coin_ticker}
      </span>
    </div>

  </div>

</div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3">

            {milestoneAchievements.map((ach: any) => {
              const isClaimed = user.claimed_milestone_achievements?.includes(ach.target);
              const canClaim = user.total_balance >= ach.target && !isClaimed;

              const progress = Math.min(100, (user.total_balance / ach.target) * 100);

              return (
                <div
                  key={ach.target}
                  className={`min-w-[170px] bg-[#13171d] border rounded-2xl p-4 flex flex-col justify-between ${
                    canClaim ? "border-brand-400/50" : "border-white/10"
                  }`}
                >

                  <div>
                    <p className="text-[13px] text-white/50 uppercase">
                      Target
                    </p>

                    <p className="text-lg font-bold text-white">
                      {ach.target.toLocaleString()} 
                    </p>

                    <p className="text-[13px] text-brand-400 font-semibold mt-1">
                      +{ach.reward.toLocaleString()} {config?.coin_ticker}
                    </p>
                  </div>

                  <div className="mt-3">

                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={`h-full ${
                          canClaim
                            ? "bg-gradient-to-r from-brand-500 to-brand-400"
                            : "bg-white/20"
                        }`}
                      />
                    </div>

                    <button
                      disabled={!canClaim}
                      onClick={() => claimMilestoneAchievement(ach.target)}
                      className={`w-full mt-3 h-9 rounded-lg text-[13px] font-bold ${
                        isClaimed
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : canClaim
                          ? "bg-brand-500 text-white"
                          : "bg-white/5 text-white/30"
                      }`}
                    >
                      {isClaimed ? "Claimed" : canClaim ? "Claim" : "Locked"}
                    </button>

                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= REFERRAL ================= */}
      {(type === "all" || type === "referral") && (
        <div className="space-y-4">

          <div className="flex justify-between px-1">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-[#13171d] border border-white/10 flex items-center justify-center text-brand-400">
              <Layers size={14} className="text-brand-400" />
              </div>
              <h2 className="text-[10px] font-bold uppercase text-white/90">
                Referral Achievements
              </h2>
            </div>

            <span className="text-[10px] text-white">
              {user.referral_count} Users
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar">

            {referralAchievements.map((ach: any) => {
              const isClaimed = user.claimed_referral_achievements?.includes(ach.target);
              const canClaim = user.referral_count >= ach.target && !isClaimed;

              const progress = Math.min(100, (user.referral_count / ach.target) * 100);

              return (
                <div
                  key={ach.target}
                  className="min-w-[150px] bg-[#13171d] border border-white/10 rounded-2xl p-4"
                >

                  <p className="text-[12px] text-white/50">Target</p>

                  <p className="text-lg font-bold text-white">
                    {ach.target} Friends
                  </p>

                  <p className="text-[13px] text-brand-400">
                    +{ach.reward.toLocaleString()} {config?.coin_ticker}
                  </p>

                  <div className="w-full h-1 bg-white/10 mt-3 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <button
                    disabled={!canClaim}
                    onClick={() => claimReferralAchievement(ach.target)}
                    className={`w-full mt-3 h-8 rounded-lg text-[13px] font-bold text-[13px] ${
                      isClaimed
                        ? "bg-emerald-500/10 text-emerald-400"
                        : canClaim
                        ? "bg-brand-500 text-white"
                        : "bg-white/5 text-white/30"
                    }`}
                  >
                    {isClaimed ? "Claimed" : canClaim ? "Claim" : "Locked"}
                  </button>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TIER ================= */}
      {(type === "all" || type === "tier") && (
        <div className="space-y-4">

          <div className="flex items-center gap-2 px-1">
             <div className="w-8 h-8 rounded-lg bg-[#13171d] border border-white/10 flex items-center justify-center text-brand-400">
              
            <TrendingUp size={14} className="text-brand-400" />
            </div>
            <h2 className="text-[10px] font-bold uppercase text-white/90">
              Mining Achievements (Claim 2X Coin)
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {tierAchievements?.map((ach) => {
              const isClaimed = user.claimed_tier_achievements.includes(ach.tier);
              const canClaim = user.mining_balance >= ach.target && !isClaimed;
              const progress = Math.min(100, (user.mining_balance / ach.target) * 100);

              return (
                <div 
                  key={ach.tier}
                  className={`relative group bg-[#171b22] border-2 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-300 ${
                    canClaim ? 'border-brand-500/50' : 'border-neutral-800/60'
                  }`}
                >
                  {/* Left Energy Strip */}
                  <div className={`absolute left-0 top-0 w-1 h-full bg-gradient-to-b ${
                    ach.tier === 'Silver' ? 'from-neutral-400' :
                    ach.tier === 'Gold' ? 'from-brand-400' :
                    ach.tier === 'Platinum' ? 'from-brand-400' :
                    'from-brand-500 to-brand-500'
                  } to-transparent rounded-l-2xl`} />

                  <div className="flex items-center gap-4 flex-1 pl-2">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 shadow-inner relative ${
                      ach.tier === 'Silver' ? 'bg-black border-neutral-700 text-neutral-400' :
                      ach.tier === 'Gold' ? 'bg-black border-amber-800 text-amber-500 shadow-amber-900/20' :
                      ach.tier === 'Platinum' ? 'bg-black border-brand-800 text-brand-400 shadow-brand-900/20' :
                      'bg-black border-brand-800 text-brand-400 shadow-brand-900/20'
                    }`}>
                      <Award size={20} />
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-neutral-800 rounded-full border border-neutral-700" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-baseline flex-col">
                        <p className="font-black text-xs   uppercase text-white tracking-tighter">{ach.tier}_Level</p>
                        <p className="text-[9px] font-black text-neutral-500   tabular-nums">{user.mining_balance.toLocaleString()} / {ach.target.toLocaleString()}</p>
                      </div>
                      <div className="w-full h-1.5 bg-black border border-neutral-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className={`h-full bg-gradient-to-r ${
                            ach.tier === 'Silver' ? 'from-neutral-500 to-neutral-400' :
                            ach.tier === 'Gold' ? 'from-brand-600 to-brand-400' :
                            ach.tier === 'Platinum' ? 'from-brand-600 to-brand-400' :
                            'from-brand-600 to-brand-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 pl-4 border-l-2 border-neutral-800/50">
                    <div className="flex items-center gap-1">
                     
                      <p className="text-[9px] font-black bg-gradient-to-r from-brand-400 to-brand-400 bg-clip-text text-transparent mt-1">+{ach.reward.toLocaleString()} {config?.coin_ticker}</p>
                    </div>
                    <button
                      disabled={!canClaim}
                      onClick={() => claimTierAchievement(ach.tier)}
                      className={`px-5 h-8 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                        isClaimed 
                          ? 'text-emerald-500/50 bg-emerald-500/5 border border-emerald-500/10' 
                          : canClaim 
                            ? 'bg-white text-[#171b22] active:scale-95 shadow-[0_4px_15px_rgba(255,255,255,0.2)]'
                            : 'text-neutral-700 bg-black/40 border border-neutral-800 cursor-not-allowed'
                      }`}
                    >
                      {isClaimed ? 'Claimed' : 'Claim'}
                    </button>
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      )}

    </div>
  );
};

export default AchievementSection;
