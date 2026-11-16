import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Zap, 
  AlertCircle,
  Cpu,
  ShieldCheck,
  Activity,
  Terminal as TerminalIcon,
  Percent,
  Layers,
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  History
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const PartnerWithdrawal: React.FC = () => {
  const { user, handleWithdrawPartner,transactions, isLoading,config } = useAppContext();
  const navigate = useNavigate();

  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const partnerBalance = user?.partner_balance || 0;

  useEffect(() => {
    const numAmount = parseFloat(amount);
    const hasInsufficientFunds = numAmount > partnerBalance;
    const hasInsufficientBalance = numAmount/config?.coinPriceTON > user?.total_balance;
    const isInvalidNumber = isNaN(numAmount) || numAmount <= 0;
    
    if (hasInsufficientFunds) {
      setError("ERR_INSUFFICIENT_CREDITS_GRAM");
    } else {
      setError(null);
    }
     if (hasInsufficientBalance) {
      setError(`ERR_INSUFFICIENT_FUNDS_${config?.coin_ticker}`);
    } else {
      setError(null);
    }
    

    setIsButtonDisabled(isLoading || isInvalidNumber || hasInsufficientFunds);
  }, [amount, partnerBalance, isLoading]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const setMax = () => {
    if(partnerBalance/config?.coinPriceTON <= user?.total_balance){
      setAmount(partnerBalance.toString())
    }else{
       setAmount(user?.total_balance * config?.coinPriceTON)
    }
    
  };

  const onWithdrawClick = async () => {
    const success = await handleWithdrawPartner(parseFloat(amount));
    if (success) setAmount("");
  };

  if (!user) return null;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;



  const filteredTransactions = transactions.filter(t =>
    ['withdrawal_partner','referral_commission'].includes(t.type)
  );
  console.log(filteredTransactions)


  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-6 space-y-6 pb-24 text-neutral-200"
    >
      {/* Protocol Header */}
      <div className="flex items-center justify-between pt-6">
        <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-900 border-2 border-neutral-800 text-neutral-400 active:scale-90 transition-all shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
            >
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="text-[10px] font-black uppercase  text-neutral-500  ">Financial_Relay_v2</h1>
                <p className="text-sm font-black text-white uppercase tracking-tight">Direct Comm. Payout</p>
            </div>
        </div>
        <div className="w-10 h-10 bg-black border-2 border-neutral-800 rounded-xl flex items-center justify-center relative">
            <Cpu size={18} className="text-brand-500" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#171b22] animate-pulse" />
        </div>
      </div>

      {/* Hero: Revenue Stream Monitor (Mechanical Rainbow) */}
      <div className="relative bg-[#171b22] border-2 border-neutral-800 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Spectral Energy Rail */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-500 via-brand-500 to-brand-500" />
        
        <div className="p-8 text-center relative">
          <div className="flex justify-center mb-3">
             <div className="px-3 py-1 bg-black border border-neutral-800 rounded-full flex items-center gap-2">
                <Activity size={10} className="text-emerald-500" />
                <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Active_Stream_Authorized</span>
             </div>
          </div>
          
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] mb-1  ">Claimable_Commission</p>
          <h2 className="text-5xl font-black tracking-tighter   text-white tabular-nums">
            {partnerBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h2>
          <div className="mt-3 inline-block bg-gradient-to-r from-brand-400 via-brand-400 to-brand-400 bg-clip-text text-transparent font-black text-[10px] uppercase ">
            GRAM
          </div>
        </div>

        {/* Micro-Grid Background Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '16px 16px' }} />
      </div>

      {/* Extraction Interface */}
      <div className="space-y-4">
        <div className="bg-black/40 border-2 border-neutral-800 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TerminalIcon size={14} className="text-brand-500" />
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">INPUT_AMOUNT</span>
            </div>
            <button 
              onClick={setMax} 
              className="text-[9px] font-black text-white uppercase tracking-widest bg-neutral-800 border border-neutral-700 px-3 py-1.5 rounded-lg hover:bg-neutral-700 transition-all active:scale-95 shadow-lg"
            >
              Max
            </button>
          </div>

<div className="relative group">
  <input
    type="text"
    value={amount}
    onChange={handleAmountChange}
    placeholder="0.00"
    className={`w-full bg-black border-2 ${
      error
        ? "border-red-500/50"
        : "border-neutral-800 focus:border-brand-500/50"
    } rounded-2xl p-6 text-3xl font-black text-white focus:outline-none transition-all placeholder:text-neutral-900 font-mono`}
  />

  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-end">
    <span className="text-[10px] font-black text-neutral-700 uppercase tracking-widest mb-1">
      UNIT
    </span>
    <span className="text-sm font-black text-brand-500 uppercase">
      GRAM
    </span>
  </div>
</div>

{/*  {config?.coin_ticker} equivalent */}
<div className="mt-3 px-2 flex items-center justify-between">
  <span className="text-xs font-bold text-neutral-500">
     {config?.coin_ticker} to sell
  </span>

  <span className="text-sm font-black text-brand-400 font-mono">
    {amount && !isNaN(Number(amount))
      ? `${(Number(amount) / config?.coinPriceTON).toLocaleString()} ${config?.coin_ticker}`
      : `0 ${config?.coin_ticker}`}
  </span>
</div>

{/* Available Balance */}
<div className="mt-3 px-2 flex items-center justify-between">
  <span className="text-xs font-bold text-emerald-500">
    Available Balance
  </span>

  <span className="text-sm font-black text-emerald-400 font-mono">
    {`${user.total_balance.toLocaleString()}  ${config?.coin_ticker}`}
  </span>
</div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -5 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="flex items-center gap-2 px-2 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
              >
                <AlertCircle size={12} />
                <span className="text-[9px] font-black uppercase tracking-[0.1em]">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rainbow Execution Button */}
        <button 
          disabled={isButtonDisabled}
          onClick={onWithdrawClick}
          className={`relative group w-full h-16 rounded-2xl overflow-hidden transition-all ${
            !isButtonDisabled ? 'active:scale-95' : 'opacity-30 grayscale'
          }`}
        >
          {/* Rainbow Gradient Background */}
          <div className={`absolute inset-0 bg-gradient-to-r from-brand-500 via-brand-500 ${!isButtonDisabled ? 'animate-gradient-x' : ''}`} />
          
          {/* Inner Dark Mask */}
          <div className="absolute inset-[2px] bg-[#171b22] rounded-[14px] flex items-center justify-center group-hover:bg-transparent transition-colors duration-300">
            {isLoading ? (
              <Activity size={20} className="animate-spin text-white" />
            ) : (
              <div className="flex items-center gap-3">
                <Zap size={16} className={`text-white transition-transform duration-500 ${!isButtonDisabled && 'fill-white group-hover:scale-125'}`} />
                <span className="text-white font-black text-[11px] uppercase ">Place Withdrawal</span>
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Protocol Specs (Industrial Information) */}
      <div className="bg-black/40 border-2 border-neutral-800 rounded-3xl p-6 space-y-6">
        <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-neutral-500" />
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Protocol_Clearance</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-2xl shadow-inner">
                <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mb-2">Commission_Rate</p>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-black border border-emerald-500/30 rounded-lg flex items-center justify-center text-emerald-500">
                        <Percent size={14} />
                    </div>
                    <span className="text-sm font-black text-white  ">{config?.friends_commission_percentage_ton}%</span>
                </div>
            </div>
            
            <div className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-2xl shadow-inner">
                <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mb-2">Network_Mode</p>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-black border border-brand-500/30 rounded-lg flex items-center justify-center text-brand-400">
                        <Zap size={14} />
                    </div>
                    <span className="text-sm font-black text-white   uppercase tracking-tighter">Instant</span>
                </div>
            </div>
        </div>

        <div className="p-4 bg-red-500/5 border-2 border-red-500/10 rounded-2xl flex gap-4">
            <AlertCircle size={18} className="text-red-500/50 shrink-0" />
            <p className="text-[8px] font-black text-neutral-600 uppercase leading-relaxed tracking-widest  ">
              [CRITICAL] Payouts are computed via {config?.coin_ticker} real-time modules. Ensure your target TON_RELAY is synchronized before confirming withdrawal.
            </p>
        </div>

     
      </div>
 {/* Transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <History size={12} className="text-neutral-500" />
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">GRAM Transaction History</h3>
          </div>
        </div>

        <div className="bg-[#101318] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="divide-y divide-white/5">
            {currentTransactions?.map((t) => {
              const isIncome = t.type==='referral_commission';
              return (
                <div key={t._id} className="p-4 flex items-center justify-between hover:bg-white/[0.03] transition-all group relative">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                      isIncome ? 'bg-brand-500/5 border-brand-500/20 text-brand-400' : 'bg-brand-500/5 border-brand-500/20 text-brand-400'
                    }`}>
                      {isIncome ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-black text-white uppercase tracking-tight  max-w-[130px]">
                        {t.description}
                      </p>
                      <div className="flex items-center gap-2">
                          <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-tighter">
                            {new Date(t.created_at).toLocaleDateString()}
                          </p>
                          {t.hash && (
                            <a href={`https://tonviewer.com/transaction/${t.hash}`} target="_blank" rel="noreferrer" className="p-1">
                              <ExternalLink size={10} className="text-brand-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                            </a>
                          )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-[12px] font-black tabular-nums tracking-tighter ${isIncome ? 'text-brand-400' : 'text-brand-400'}`}>
                      {isIncome ? '+' : '-'}{t.amount_ton.toFixed(2)} GRAM
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                        <div className={`w-1 h-1 rounded-full ${t.status === 'completed' ? 'bg-brand-500' : 'bg-yellow-500'}`} />
                                            <p
                        className={`text-[7px] font-black uppercase tracking-widest ${
                          t.status === "rejected"
                            ? "text-rose-400"
                            : t.status === "completed"
                            ? "text-emerald-400"
                            : "text-neutral-600"
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
              <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} className="p-2 text-neutral-500 hover:text-brand-500 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-black text-neutral-600  uppercase">Beam Layer</span>
                <span className="text-[10px] font-black text-white tracking-widest">{currentPage} <span className="text-neutral-600 mx-1">/</span> {totalPages}</span>
              </div>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} className="p-2 text-neutral-500 hover:text-brand-500 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PartnerWithdrawal;
