import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft, 
  AlertCircle,
  ShieldCheck,
  Terminal,
  Activity,
  Lock,
  Cpu,
  BarChart3
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const Withdrawal: React.FC = () => {
  const { user, handleWithdraw, selectExchange, isLoading } = useAppContext();
  const navigate = useNavigate();
  const [showExchangeList, setShowExchangeList] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user) return null;

  const exchanges = [
    { name: "Binance", logo: "/images/logo/bnb.png" },
    { name: "Bybit", logo: "/images/logo/bybit.png" },
    { name: "MEXC", logo: "/images/logo/mexc.png" }, 
    { name: "KUKOIN", logo: "/images/logo/kucoin.png" },
    { name: "OKX", logo: "/images/logo/okx.png" },
    { name: "BINGX", logo: "/images/logo/bingex.png" },
    { name: "GATEIO", logo: "/images/logo/gateio.png" },
    { name: "HTX", logo: "/images/logo/htx.png" },
    { name: "BITGET", logo: "/images/logo/bitget.png" }
  ];

  const selectedLogo = exchanges.find(ex => ex.name === user.selected_exchange)?.logo;

  const qualifiers = [
    { 
      id: 'exchange', 
      label: 'Choose Exchange', 
      status: !!user.selected_exchange,
      value: user.selected_exchange || 'AUTH_REQUIRED',
      logo: selectedLogo,
      action: () => setShowExchangeList(true)
    },
    { 
      id: 'ton_tx', 
      label: 'Perform GRAM TASK', 
      status: user.ton_transaction_completed || (user.tontaskamount || 0) > 0,
      value: (user.ton_transaction_completed || (user.tontaskamount || 0) > 0) ? 'SYST_OK' : 'PENDING_TX',
      action: () => navigate("/tasks")
    },
    { 
      id: 'task_rewards', 
      label: 'Task Rewards', 
      status: (user.task_balance || 0) >= 25000,
      value: `${(user.task_balance ?? 0).toLocaleString()} / 25k`,
      action: () => navigate("/")
    },
    { 
      id: 'mining_rewards', 
      label: 'Total mining', 
      status: (user.mining_balance || 0) >= 300,
      value: `${(user.mining_balance ?? 0).toLocaleString()} / 300`,
      action: () => navigate("/mine")
    },
    { 
      id: 'referral_rewards', 
      label: 'referrals rewards', 
      status: (user.referral_balance || 0) >= 1000,
      value: `${(user.referral_balance ?? 0).toLocaleString()} / 1k`,
      action: () => navigate("/friends")
    },
    { 
      id: 'referral_count', 
      label: 'Total Referrals', 
      status: (user.referral_count >= 1),
      value: `${user.referral_count} / 1 ACTIVE`
    }
  ];

  const allQualifiersMet = qualifiers.every(q => q.status);
  const limitTon = (((user.tontaskamount || 0) * 0.05) + ((user.totalrankboostamount || 0) * 0.05) + ((user.friends_ton_tasks_total || 0) * 0.05) + ((user.friends_boost_rank_total || 0) * 0.05));

  const getCooldown = () => {
    if (!user.last_withdrawal_at) return null;
    const cooldownEnd = new Date(user.last_withdrawal_at).getTime() + 7 * 24 * 60 * 60 * 1000;
    return cooldownEnd - now > 0 ? cooldownEnd - now : null;
  };

  const formatCooldown = (ms: number) => {
    const d = Math.floor(ms / (24 * 3600000));
    const h = Math.floor((ms % 3600000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${d}D ${h}H ${m}M ${s}S`;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 space-y-6 pb-24 text-slate-200">
      
      {/* Protocol Header */}
      <div className="flex items-center justify-between pt-6">
        <div className="flex items-center gap-4">
            <button onClick={() => showExchangeList ? setShowExchangeList(false) : navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border-2 border-slate-800 text-slate-400 active:scale-90">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="text-[10px] font-black uppercase  text-slate-500  ">Financial_Module_v8</h1>
                <p className="text-sm font-black text-white uppercase tracking-tight">{showExchangeList ? 'Select Exchange' : 'Payer_Protocol'}</p>
            </div>
        </div>
        {!showExchangeList && (
            <div className="w-10 h-10 bg-black border-2 border-slate-800 rounded-xl flex items-center justify-center">
                <ShieldCheck size={18} className="text-cyan-500" />
            </div>
        )}
      </div>

      <div className="space-y-6">
        {showExchangeList ? (
          <div className="grid grid-cols-1 gap-3">
            {exchanges?.map((ex) => (
              <button key={ex.name} onClick={() => { selectExchange(ex.name); setShowExchangeList(false); }}
                className={`relative group overflow-hidden w-full p-4 rounded-2xl border-2 flex justify-between items-center transition-all ${user.selected_exchange === ex.name ? 'bg-slate-900 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-[#090E1A] border-slate-800'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-lg bg-white p-2 flex items-center justify-center shadow-inner"><img src={ex.logo} alt={ex.name} className="w-full h-full object-contain" /></div>
                  <span className="font-black uppercase tracking-widest text-[11px]  ">{ex.name}</span>
                </div>
                {user.selected_exchange === ex.name && <CheckCircle2 size={18} className="text-emerald-400" />}
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* Main Payout HUD (Mechanical Rainbow) */}
            <div className="relative bg-[#0F172A] border-2 border-slate-800 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              {/* Spectral Power Rail */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 via-blue-500 via-cyan-500 via-emerald-500 via-yellow-500 to-red-500" />
              
              <div className="p-8 text-center relative">
                <div className="flex justify-center mb-4">
                   <div className="px-3 py-1 bg-black border border-slate-800 rounded-full flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Authorization_Limit</span>
                   </div>
                </div>
                <h2 className="text-6xl font-black tracking-tighter   text-white tabular-nums">
                  {limitTon.toFixed(2)}
                </h2>
                <div className="mt-2 inline-block bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent font-black text-xs uppercase tracking-[0.4em]">TON_CREDITS</div>
              </div>

              {/* HUD Grid Overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                   style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '20px 20px' }} />
            </div>

            {/* Breakdown Matrix */}
            {/* <div className="bg-black/40 border-2 border-slate-800 rounded-3xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-cyan-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telemetry_Data</span>
                </div>
                <BarChart3 size={14} className="text-slate-700" />
              </div>

              <div className="space-y-4">
                {[
                  { label: "GRAM Tasks", base: user.tontaskamount, color: "from-pink-500" },
                  { label: "RANK Boosts", base: user.totalrankboostamount, color: "from-purple-500" },
                  { label: "Peer Activity", base: user.friends_ton_tasks_total + user.friends_boost_rank_total, color: "from-cyan-500" }
                ].map((item, idx) => (
                  <div key={idx} className="relative group">
                    <div className="flex justify-between items-end pb-3 border-b border-slate-800/50">
                        <div className="flex items-center gap-3">
                           <div className={`w-1 h-6 bg-gradient-to-b ${item.color} to-transparent rounded-full`} />
                           <div>
                              <p className="text-[10px] font-black text-white uppercase   tracking-tight">{item.label}</p>
                              <p className="text-[8px] font-black text-slate-600 uppercase tracking-tighter  ">Yield 5%</p>
                           </div>
                        </div>
                        <p className="text-sm font-black text-white tabular-nums">+{( (item.base || 0) * 0.05).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Execution Trigger */}
            <div className="pt-2">
              {getCooldown() ? (
                <div className="w-full bg-slate-900 border-2 border-red-500/20 p-5 rounded-2xl flex flex-col items-center gap-2">
                  <Lock size={20} className="text-red-500/40" />
                  <p className="text-[9px] font-black text-slate-500 uppercase ">Temporal_Lock_Active</p>
                  <p className="text-lg font-black text-red-400 font-mono tracking-tighter">{formatCooldown(getCooldown()!)}</p>
                </div>
              ) : (
                <button 
                  disabled={!allQualifiersMet || isLoading}
                  onClick={() => handleWithdraw(limitTon)}
                  className={`relative group w-full h-16 rounded-2xl overflow-hidden transition-all ${
                    allQualifiersMet ? 'active:scale-95' : 'opacity-40 grayscale'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 via-blue-500 via-cyan-500 ${allQualifiersMet ? 'animate-gradient-x' : ''}`} />
                  <div className="absolute inset-[2px] bg-[#0F172A] rounded-[14px] flex items-center justify-center gap-3">
                    {isLoading ? (
                       <Activity size={18} className="animate-spin text-white" />
                    ) : (
                       <Zap size={16} className={`text-white ${allQualifiersMet ? 'fill-white' : ''}`} />
                    )}
                    <span className="text-white font-black text-[11px] uppercase ">
                        {allQualifiersMet ? 'Commit_Withdrawal' : 'Clearance_Pending'}
                    </span>
                  </div>
                </button>
              )}
            </div>

            {/* Security Clearance (Qualifiers) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                   <Terminal size={12} className="text-slate-600" />
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Withdrawal Qualifiers</h3>
                </div>
                <span className="text-[10px] font-black   text-cyan-500">{qualifiers.filter(q => q.status).length}/{qualifiers.length} VALID</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {qualifiers?.map((q) => (
                  <div key={q.id} onClick={q.action} className={`group relative p-4 rounded-2xl border-2 transition-all ${q.status ? 'bg-slate-900/50 border-slate-800' : 'bg-black/20 border-slate-800 opacity-60'} ${q.action ? 'cursor-pointer active:scale-95' : ''}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {q.id === 'exchange' && q.logo ? (
                                <div className="w-8 h-8 rounded-lg bg-white p-1 shadow-inner"><img src={q.logo} alt="ex" className="w-full h-full object-contain" /></div>
                            ) : (
                                <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors ${q.status ? 'bg-black border-emerald-500/50 text-emerald-400' : 'bg-black border-slate-800 text-slate-800'}`}>
                                    {q.status ? <CheckCircle2 size={14} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-slate-800" />}
                                </div>
                            )}
                            <div>
                                <p className="text-[11px] font-black text-white uppercase   tracking-tight">{q.label}</p>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{q.value}</p>
                            </div>
                        </div>
                        {q.action && !q.status && <ChevronRight size={14} className="text-slate-700 group-hover:text-white transition-colors" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Industrial Warning */}
            <div className="bg-red-500/5 border-2 border-red-500/10 p-5 rounded-2xl flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                   <AlertCircle size={20} className="text-red-500/60" />
                </div>
                <p className="text-[9px] font-black text-slate-600 uppercase leading-relaxed tracking-widest  ">
                  Critical: Withdrawal protocol resets every week. Network weight status must be verified during the validation phase.
                </p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Withdrawal;