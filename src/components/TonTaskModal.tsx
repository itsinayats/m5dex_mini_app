import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ShieldCheck, Minus, Plus, Activity, X, Settings, Cpu, Zap, AlertTriangle, Info } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { TonConnectButton, useTonConnectUI, useTonAddress, CHAIN } from "@tonconnect/ui-react";

const ADMIN_WALLET = import.meta.env.VITE_ADMIN_WALLET || "";
console.log("ADMIN_WALLET",ADMIN_WALLET)

const TonTaskModal: React.FC = () => {
  const { 
    showTonTaskModal, setShowTonTaskModal, 
    isProcessingTon, setIsProcessingTon,
    executeTaskCompletion, initdata,updateWallet
  } = useAppContext();


  const [tonConnectUI] = useTonConnectUI();
  const userFriendlyAddress = useTonAddress();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (userFriendlyAddress) {
      setConnected(true);
    }
  }, [userFriendlyAddress]);

 useEffect(() => {
    if(userFriendlyAddress && tonConnectUI.account?.chain.toString() !== CHAIN.MAINNET.toString()) {
         tonConnectUI.disconnect();
          alert("System Error: Protocol requires Mainnet connection.");
    }
      else if (userFriendlyAddress) {
      updateWallet(userFriendlyAddress);
    }
  }, [userFriendlyAddress]);


  // Functionality Preserved
  async function checkTransaction(txHash: string) {
    const res = await fetch("/api/user/getHashFromBoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-telegram-init-data": initdata
      },
      body: JSON.stringify({ hash: txHash })
    });
    const response = await res.json();
    return response.error ? null : response.hash;
  }

  function isTxSuccessful(tx: any) {
    if (tx.aborted || tx.destroyed) return false;
    if (tx.compute_phase?.exit_code !== 0) return false;
    if (tx.action_phase?.success === false) return false;
    const sentFunds = tx.out_msgs?.some((msg: any) => msg.value > 0 && msg.bounced === false);
    return !!sentFunds;
  }

  async function validateTx(txHash: string, timeoutMs = 30000, intervalMs = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const res = await fetch(`https://tonapi.io/v2/blockchain/transactions/${txHash}`);
      if (res.ok) {
        const data = await res.json();
        const result = isTxSuccessful(data);
        return { success: result };
      }
      await new Promise(r => setTimeout(r, intervalMs));
    }
    return { success: false };
  }

  const sendTon = async (address: string, amount: number) => {
    let success = false;
    const myTransaction = {
      validUntil: Math.floor(Date.now() / 1000) + 300,
      messages: [{
        address: address,
        amount: String(amount * 10 ** 9)
      }]
    };
    try {
      const response = await tonConnectUI.sendTransaction(myTransaction);
      let trrhash;
      if (response.boc) {
        trrhash = await checkTransaction(response.boc);
        const result = await validateTx(trrhash);
        success = result.success;
      }
      return success === true ? trrhash : false;
    } catch (e) {
      return false;
    }
  };

  const performTonTask = async () => {
    console.log("showTonTaskModal.ton_price---->",showTonTaskModal.ton_price)
    if (!showTonTaskModal) return;
    setIsProcessingTon(true);
    const hash = await sendTon(ADMIN_WALLET, Number(showTonTaskModal.ton_price));
    if (hash) {
      console.log("showTonTaskModal",showTonTaskModal)
      await executeTaskCompletion(showTonTaskModal.id, hash, showTonTaskModal.ton_price, userFriendlyAddress);
      setShowTonTaskModal(null);
    } else {
      alert("Transaction failed or Wallet disconnected");
    }
    setIsProcessingTon(false);
  };

  return (
    <AnimatePresence>
      {showTonTaskModal && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isProcessingTon && setShowTonTaskModal(null)}
            className="fixed inset-0 bg-[#020617]/95 z-[100] backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[380px] bg-[#0F172A] z-[110] border-2 border-slate-800 shadow-[0_40px_80px_rgba(0,0,0,0.8)] overflow-hidden rounded-[2rem]"
          >
            {/* Prismatic Top Rail */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 via-blue-500 via-cyan-500 via-emerald-500 via-yellow-500 to-red-500" />
            
            {/* Internal Hardware Frame */}
            <div className="p-8 space-y-8 relative">
              
              {/* Header Interface */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-black border-2 border-slate-800 rounded-xl flex items-center justify-center shadow-inner relative">
                       <Wallet size={24} className="text-white opacity-80" />
                       <div className="absolute -top-1 -right-1 w-2 h-2 bg-slate-700 rounded-full border border-slate-900" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase   tracking-tighter text-white">Connect Wallet</h3>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_cyan]" />
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">GRAM wallet verification</p>
                      </div>
                    </div>
                  </div>
                </div>
                {!isProcessingTon && (
                  <button 
                    onClick={() => setShowTonTaskModal(null)}
                    className="p-2 bg-slate-900 border-2 border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Amount Meter (Mechanical Grid) */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 blur-xl opacity-50" />
                <div className="relative bg-black border-2 border-slate-800 rounded-3xl p-6 space-y-6">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-slate-600 uppercase ">Task amount</span>
                     <Zap size={12} className="text-yellow-500" />
                  </div>
                  
                  <div className="flex items-center justify-center">

                    <div className="text-center flex flex-col">
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-black text-white   tracking-tighter tabular-nums">
                          {showTonTaskModal.ton_price}
                        </span>
                        <span className="text-xs font-black bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent uppercase">GRAM</span>
                      </div>
                     
                    </div>

                  
                  </div>
                </div>
              </div>

              {/* Console Footprint */}
              <div className="bg-[#090E1A] border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                
                 <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                    <ul>
                      <li>- This task will register your wallet with us and </li>
                      <li>- Verify wallet with First transaction and</li>
                      <li>- Make you eligible to withdraw your earnings</li>
                    </ul>
                 </div>
              </div>

              {/* Action Sequence */}
              <div className="space-y-4">
                {connected ? (
                  <div className="space-y-4">
                    <button 
                      disabled={isProcessingTon}
                      onClick={performTonTask}
                      className={`relative w-full h-16 rounded-2xl overflow-hidden group transition-all ${
                        isProcessingTon ? 'cursor-not-allowed grayscale' : 'active:scale-95'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 via-blue-500 via-cyan-500 animate-gradient-x" />
                      <div className="absolute inset-[2px] bg-[#0F172A] rounded-[14px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                        <div className="flex items-center gap-3">
                          {isProcessingTon ? (
                            <>
                              <Activity size={20} className="animate-spin text-white" />
                              <span className="text-white font-black uppercase text-xs tracking-[0.2em]">Please Wait...</span>
                            </>
                          ) : (
                            <span className="text-white font-black uppercase text-xs tracking-[0.2em]">Confirm TASK</span>
                          )}
                        </div>
                      </div>
                    </button>
                    
                    <div className="flex justify-center filter saturate-50 hover:saturate-100 transition-all opacity-80">
                      <TonConnectButton />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6 p-4 bg-black/40 border-2 border-dashed border-slate-800 rounded-3xl">
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Relay_Offline: Link Wallet</p>
                     <div className="scale-110">
                        <TonConnectButton />
                     </div>
                  </div>
                )}
                
                {!isProcessingTon && (
                  <button 
                    onClick={() => setShowTonTaskModal(null)}
                    className="w-full text-[9px] text-slate-700 font-black uppercase tracking-[0.4em] hover:text-red-500 transition-colors pt-2"
                  >
                    Abort_Sequence
                  </button>
                )}
              </div>
            </div>

            {/* Micro Grid Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '16px 16px' }} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TonTaskModal;