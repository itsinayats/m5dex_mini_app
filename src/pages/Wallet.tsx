import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Wallet as WalletIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Trophy, 
  ShieldCheck, 
  Zap,
  TrendingUp,
  Terminal,
  Cpu, 
  History,
  Orbit,
  Sparkles,
  Lock,
  PiggyBank,
  AlertOctagon,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { TonConnectButton, useTonConnectUI, THEME, useTonAddress, CHAIN } from "@tonconnect/ui-react";

const Wallet: React.FC = () => {
  const { user, updateWallet, transactions, handleWithdraw, config } = useAppContext();
  const navigate = useNavigate();
  const [tonConnectUI] = useTonConnectUI();
  const userFriendlyAddress = useTonAddress();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [now, setNow] = useState(Date.now());

    useEffect(() => {
      const timer = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(timer);
    }, []);

const getCooldown = () => {
    if (!user.last_withdrawal_at) return null;
    
    // Convert the last withdrawal to a timestamp
    const lastWithdrawal = new Date(user.last_withdrawal_at).getTime();
    
    // Calculate duration in milliseconds: Days * Hours * Minutes * Seconds * MS
    const durationMs = config?.withdrawal_duration_days * 24 * 60 * 60 * 1000;
    
    const cooldownEnd = lastWithdrawal + durationMs;
    const remaining = cooldownEnd - now;

    return remaining > 0 ? remaining : null;
  };

  const formatCooldown = (ms: number) => {
    // 1. Calculate total units
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    // 2. Get remainders for the display strings
    const displayHours = hours % 24;
    const displayMinutes = minutes % 60;
    const displaySeconds = seconds % 60;

    return `${days}D ${displayHours}H ${displayMinutes}M ${displaySeconds}S`;
  };


  const maxWithdrawable = (user?.total_balance ?? 0) * (config?.coinPriceTON ?? 0);

  useEffect(() => {
    if (!userFriendlyAddress) return;

    if (tonConnectUI.account?.chain !== CHAIN.MAINNET) {
      void tonConnectUI.disconnect();
      alert("System Error: Protocol requires Mainnet connection.");
      return;
    }

    updateWallet(userFriendlyAddress);
  }, [userFriendlyAddress, tonConnectUI, updateWallet]);




  tonConnectUI.uiOptions = {
    uiPreferences: {
      theme: THEME.DARK,
      colorsSet: {
        [THEME.DARK]: {
          connectButton: { background: '#8b5cf6' },
          accent: '#ec4899',
        }
      }
    }
  };



  // const filteredTransactions = transactions.filter(t =>
  //   ['boost_rank', 'ton_task', 'mining_boost', 'withdrawal', 'referral_commission', 'withdrawal_partner'].includes(t.type)
  // );
  const filteredTransactions = transactions;

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, Math.max(totalPages, 1)));
  }, [totalPages]);

  if (!user) return null;
  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  return (
    <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="px-6 space-y-6 pb-24 text-white">
      
      {/* Top Protocol Header */}
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
          <Orbit size={14} className="text-pink-500 animate-spin-slow" />
          <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Wallet status</h1>
        </div>
        
        <div className="scale-75 origin-right">
          <div className="p-[1.5px] rounded-[23px] bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <div className="rounded-[22px] overflow-hidden bg-[#0F172A]">
              <TonConnectButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Asset Display */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-3xl opacity-20 blur-md group-hover:opacity-40 transition-opacity" />
        <div className="relative bg-[#090E1A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-2">
                  <ShieldCheck size={12} className="text-purple-400" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Wallet Status</span>
              </div>
              <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="text-[8px] font-bold text-cyan-500 uppercase">Synchronized</span>
              </div>
            </div>
            
    <div className="p-8 space-y-6 flex flex-col items-center">
  {/* Balance Display */}
  <div className="flex flex-col items-center space-y-1">
    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]  ">Total_Balance</p>
    <h2 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-transparent tabular-nums">
      {(user.total_balance.toLocaleString())}
    </h2>
    
    {/* Branding Line */}
    <div className="flex items-center gap-3 mt-2">
      <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-red-500/50" />
      <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">{config?.coin_ticker}</span>
      <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-purple-500/50" />
    </div>

    <div className="inline-flex items-center px-4 py-1.5 rounded-xl bg-black border border-slate-800 mt-4 shadow-inner">
      <p className="bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent text-[10px] font-black uppercase tracking-widest">
        ≈ {maxWithdrawable.toLocaleString()} GRAM
      </p>
    </div>
  </div>

  {/* Action / Cooldown Area */}
  <div className="w-full max-w-[240px] pt-2">
    {getCooldown() ? (
      <div className="w-full bg-black/40 border-2 border-pink-900/20 p-4 rounded-[1.5rem] flex flex-col items-center gap-2 relative overflow-hidden">
        {/* Micro-glow for cooldown */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500/30" />
        
        <Lock size={16} className="text-red-500/40 animate-pulse" />
        <div className="text-center">
          <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Next_Withdrawal_Window</p>
          <p className="text-xl font-black text-pink-500/80 font-mono tracking-tighter  ">
            {formatCooldown(getCooldown()!)}
          </p>
        </div>
      </div>
    ) : (
        <button
      onClick={() => setShowWithdrawModal(true)}
      className="relative w-full h-14 rounded-2xl overflow-hidden group active:scale-95 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
    >
        {/* Animated Rainbow Border */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 animate-gradient-x" />
        
        {/* Inner Dark Mask to match your Staking/Withdrawal pages */}
        <div className="absolute inset-[2px] bg-[#0F172A] rounded-[14px] flex items-center justify-center group-hover:bg-transparent transition-colors duration-300">
          <span className="text-white font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-2">
            <ArrowUpRight size={16} strokeWidth={3} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            Withdraw_NOW
          </span>
        </div>
      </button>
    )}
  </div>
</div>
        </div>
      </div>

       <div className="group relative p-[1px] rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500">
            <div className="bg-[#0F172A] rounded-[15px] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-purple-400 shadow-lg border border-white/10">
                        <PiggyBank size={20} className="fill-current" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white uppercase leading-none">Stake Your Asset</p>
                        <p className="text-[8px] font-bold text-purple-400 uppercase mt-1">Earn {config?.staking_monthly_roi}% Monthly ROI</p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate("/staking")}
                    className="bg-white text-black px-5 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                >
                    Open
                </button>
            </div>
        </div>

      {/* Partner Claim */}
      
        <div className="group relative p-[1px] rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500">
            <div className="bg-[#0F172A] rounded-[15px] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-purple-400 shadow-lg border border-white/10">
                        <Zap size={20} className="fill-current" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white uppercase leading-none">Direct Commission ( {user?.partner_balance.toLocaleString(undefined, { minimumFractionDigits: 0,maximumFractionDigits: 2 })} GRAM)</p>
                        <p className="text-[8px] font-bold text-purple-400 uppercase mt-1">Earn {config?.friends_commission_percentage_ton}% on referrals</p>
                    </div>
                </div>
                <button 
                    onClick={() => userFriendlyAddress ? navigate("/partnerWithdrawal") : tonConnectUI.openModal()}
                    className="bg-white text-black px-5 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                >
                    Claim
                </button>
            </div>
        </div>
   

      

      {/* Transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <History size={12} className="text-slate-500" />
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">GRAM Transaction History</h3>
          </div>
        </div>

        <div className="bg-[#090E1A] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="divide-y divide-white/5">
            {currentTransactions?.map((t) => {
              const isIncome = t.type.includes('referral_commission') || t.type.includes('Commission')|| t.description.includes('Commission') || t.description.includes('Commission') ;
              return (
                <div key={t._id} className="p-4 flex items-center justify-between hover:bg-white/[0.03] transition-all group relative">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                      isIncome ? 'bg-cyan-500/5 border-cyan-500/20 text-cyan-400' : 'bg-pink-500/5 border-pink-500/20 text-pink-400'
                    }`}>
                      {isIncome && (t.status === "completed" || t.status === "pending")  ? <ArrowDownLeft size={18} /> : t.status === "rejected" ? <AlertOctagon size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-white  tracking-tight  max-w-[130px]">
                        {t.description}
                      </p>
                      <div className="flex items-center gap-2">
                          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">
                            {new Date(t.created_at).toLocaleDateString()}
                          </p>
                          {t.hash && (
                            <a href={`https://tonviewer.com/transaction/${t.hash}`} target="_blank" rel="noreferrer" className="p-1">
                              <ExternalLink size={10} className="text-purple-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                            </a>
                          )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-[12px] font-black tabular-nums tracking-tighter ${isIncome ? 'text-cyan-400' : 'text-pink-400'}`}>
                      {isIncome && (t.status === "completed" || t.status === "pending")  ? '+' : t.status === "rejected"?'': '-'}{t.amount_ton.toFixed(2)} GRAM
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                        <div className={`w-1 h-1 rounded-full ${t.status === 'completed' ? 'bg-cyan-500' : 'bg-yellow-500'}`} />
                                            <p
                        className={`text-[7px] font-black uppercase tracking-widest ${
                          t.status === "rejected"
                            ? "text-rose-400"
                            : t.status === "completed"
                            ? "text-emerald-400"
                            : "text-yellow-500"
                        }`}
                      >
                        {t.status}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="bg-white/5 p-4 flex items-center justify-between border-t border-white/5 backdrop-blur-md">
              <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} className="p-2 text-slate-500 hover:text-pink-500 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-black text-slate-600  uppercase">Beam Layer</span>
                <span className="text-[10px] font-black text-white tracking-widest">{currentPage} <span className="text-slate-600 mx-1">/</span> {totalPages}</span>
              </div>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} className="p-2 text-slate-500 hover:text-cyan-500 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>



<AnimatePresence>
        {showWithdrawModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
          >
            {/* Modal Container with Rainbow Border */}
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }}
              className="relative w-full max-w-md group"
            >
              {/* Outer Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-[32px] opacity-40 blur-xl animate-pulse" />
              
              {/* The Border Layer */}
              <div className="relative p-[1.5px] rounded-[31px] bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 overflow-hidden shadow-2xl">
                
                {/* Inner Modal Content */}
                <div className="rounded-[30px] bg-[#090E1A] overflow-hidden">
                  <div className="p-7 space-y-6">
                 
                      <>
                        <div className="text-center space-y-3">
                          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-yellow-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center border border-yellow-500/30">
                            <Trophy className="text-yellow-500" size={32} />
                          </div>
                          <h3 className="text-xl font-black uppercase tracking-tight">Are you Sure?</h3>
                          <p className="text-[12px] text-slate-400 font-bold uppercase leading-relaxed px-2">
                            Withdraw <span className="text-white">{maxWithdrawable.toLocaleString()} GRAM</span> now, or <span className="text-cyan-400">Stake</span> to activate <span className="text-cyan-400">{config?.staking_monthly_roi ?? 0}% Monthly </span> Yield to earn {(maxWithdrawable* ((config?.staking_monthly_roi ?? 0)/100)).toLocaleString()} GRAM Monthly .
                          </p>
                        </div>

                        <div className="space-y-3">
                          <button 
                            onClick={() => navigate("/staking")}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(8,145,178,0.3)] active:scale-95 transition-all"
                          >
                            🚀 Stake Now
                          </button>
                          <button 
                            onClick={() => navigate("/withdraw")}
                            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors"
                          >
                            No, I want to withdraw
                          </button>
                        </div>
                      </>
                   
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


export default Wallet;