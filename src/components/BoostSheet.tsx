import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Trophy, Lock, ChevronRight, Settings, Cpu, HardDrive, Box, ShieldAlert, Radio, Gauge } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useTonAddress, useTonConnectUI, CHAIN, TonConnectButton, THEME } from "@tonconnect/ui-react";
import FullScreenLoader from "./FullScreenLoader";

const ADMIN_WALLET = import.meta.env.VITE_ADMIN_WALLET || "";



const BoostSheet: React.FC = () => {
  const { 
    showBoostSheet, setShowBoostSheet, 
    boostType, user, 
    boostMining, boostRank, config,updateWallet
  } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [tonConnectUI] = useTonConnectUI();
  const [miningPlans, setMiningPlans] = useState([]);
  const [rankPlans, setRankPlans] = useState([]);
  const userFriendlyAddress = useTonAddress();


   useEffect(() => {
      if(userFriendlyAddress && tonConnectUI.account?.chain.toString() !== CHAIN.MAINNET.toString()) {
           tonConnectUI.disconnect();
            alert("System Error: Protocol requires Mainnet connection.");
      }
        else if (userFriendlyAddress) {
        updateWallet(userFriendlyAddress);
      }
    }, [userFriendlyAddress]);

  // --- Logic Functions ---
  const handleBoostMining = async (plan: any) => {
    if (!userFriendlyAddress) return alert("Please Connect wallet First");
    setLoading(true);
    const hash = await sendTon(ADMIN_WALLET, plan.ton, "mining");
    if (hash) {
      await boostMining(plan.mult, hash, userFriendlyAddress);
      setLoading(false);
    }
  };

  const handleBoostRank = async (plan: any) => {
    if (!userFriendlyAddress) return alert("Please Connect wallet First");
    setLoading(true);
    const hash = await sendTon(ADMIN_WALLET, plan.ton, "rank");
    if (hash) {
      await boostRank(plan.amount, plan.ton, hash, userFriendlyAddress);
      setLoading(false);
    }
  };

  const sendTon = async (address: string, amount: number, boostFor: string) => {
    const myTransaction = {
      validUntil: Math.floor(Date.now() / 1000) + 300,
      messages: [
        {
          address: address,
          amount: String(amount * 10 ** 9),
        }
      ]
    };
    try {
      const response = await tonConnectUI.sendTransaction(myTransaction);
      return response.boc || false;
    } catch (e) {
      setLoading(false);
      return false;
    }
  };

  if (!user) return null;


    useEffect(() => {
        setMiningPlans(config?.miningPlans);
        setRankPlans(config?.rankPlans);
    }, []);

  return (
    <AnimatePresence>
      {showBoostSheet && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowBoostSheet(false)}
            className="fixed inset-0 bg-[#020617]/90 z-[60] backdrop-blur-sm"
          />
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            /* Set to 75% screen height */
            className="fixed bottom-0 left-0 right-0 bg-[#0F172A] z-[70] h-[75vh] flex flex-col shadow-[0_-30px_100px_rgba(0,0,0,1)] rounded-t-[2.5rem] border-t-2 border-slate-800"
          >
            {/* Rainbow Hardware Rail */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 via-blue-500 via-cyan-500 via-emerald-500 via-yellow-500 to-red-500" />

            {/* Header */}
            <div className="p-6 pb-2 shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black border border-slate-800 rounded-xl flex items-center justify-center shadow-inner">
                        {boostType === 'mining' ? <Settings size={18} className="text-pink-500 animate-spin-slow" /> : <Trophy size={18} className="text-cyan-400" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase   tracking-tighter text-white leading-tight">
                        {boostType === 'mining' ? 'Upgrade Mining' : 'Boost_Rank'}
                      </h3>
                      <p className="text-[7px] font-black text-slate-500 uppercase ">Module_Output_v.4</p>
                    </div>
                </div>
                <button onClick={() => setShowBoostSheet(false)} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-500">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Wallet Interface */}
            <div className="px-6 mb-4 shrink-0">
                <div className="bg-black/40 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${userFriendlyAddress ? 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]' : 'bg-slate-700'} animate-pulse`} />
                        <span className="text-[9px] font-black uppercase text-white/50 tracking-widest">
                            {userFriendlyAddress ? 'Wallet Connected' : 'Connect Wallet'}
                        </span>
                    </div>
                    <div className="scale-75 origin-right filter brightness-90">
                        <TonConnectButton />
                    </div>
                </div>
            </div>
            
            {/* Scrollable List - With extra bottom padding for menu clearance */}
            <div className="flex-1 overflow-y-auto px-6 py-2 space-y-3 custom-scrollbar">
              {(boostType === 'mining' ? miningPlans : rankPlans)?.map((plan: any, idx) => {
                const isLocked = boostType === 'mining' && plan.pph <= user.mining_speed;
                return (
                  <div 
                    key={idx}
                    onClick={() => !isLocked && (boostType === 'mining' ? handleBoostMining(plan) : handleBoostRank(plan))}
                    className={`relative overflow-hidden group ${isLocked ? 'opacity-20 grayscale' : 'cursor-pointer active:scale-95'}`}
                  >
                    <div className="absolute inset-0 bg-slate-900/40 border border-slate-800 rounded-xl transition-all group-hover:border-slate-600" />
                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${plan.color || 'from-cyan-500 to-blue-600'}`} />

                    <div className="relative p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-black border border-slate-800 rounded-lg flex items-center justify-center">
                            {isLocked ? <Lock size={16} className="text-slate-800" /> : <Cpu size={16} className="text-white opacity-80" />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase   tracking-tighter">
                            {boostType === 'mining' ? `${plan.mult}X SPEED BOOST` : `+${plan.amount.toLocaleString()}`}
                          </p>
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                            {boostType === 'mining' ? `${plan.pph} PPH` : plan.desc}
                          </p>
                        </div>
                      </div>
                      <div className="bg-black/60 border border-slate-800 px-3 py-1 rounded-lg">
                         <p className={`text-[10px] font-bold text-white bg-clip-text`}>
                           {plan.price}
                         </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Spacer to prevent bottom menu from covering the last item */}
              <div className="h-24 w-full" />
            </div>

            {/* Subtle Terminal Glow at the very bottom */}
            <div className="h-6 bg-gradient-to-t from-black/50 to-transparent shrink-0 pointer-events-none" />
          </motion.div>
          {loading && <FullScreenLoader message={"Compiling_Hardware..."} />}
        </>
      )}
    </AnimatePresence>
  );
};

export default BoostSheet;