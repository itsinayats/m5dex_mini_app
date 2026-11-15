import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Wallet,
  Lock,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

import {
  TonConnectButton,
  useTonConnectUI,
  useTonAddress,
  THEME,
  CHAIN,
} from "@tonconnect/ui-react";

import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const WithdrawGram: React.FC = () => {
  const {
    user,
    updateWallet,
    handleWithdraw,
    config,
    tasks,
  } = useAppContext();

  const navigate = useNavigate();

  const [tonConnectUI] = useTonConnectUI();
  const userFriendlyAddress = useTonAddress();

  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawAmountCoin, setWithdrawAmountCoin] = useState(0);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const allTasks = tasks || [];
  const pendingCount = allTasks.filter((t) => !t.completed_at).length;

  /*
  |--------------------------------------------------------------------------
  | TIMER
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | TON CONNECT
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      userFriendlyAddress &&
      tonConnectUI.account?.chain.toString() !==
        CHAIN.MAINNET.toString()
    ) {
      tonConnectUI.disconnect();

      alert("System Error: Protocol requires Mainnet connection.");
    } else if (userFriendlyAddress) {
      updateWallet(userFriendlyAddress);
    }
  }, [userFriendlyAddress]);

  /*
  |--------------------------------------------------------------------------
  | TON CONNECT THEME
  |--------------------------------------------------------------------------
  */

  tonConnectUI.uiOptions = {
    uiPreferences: {
      theme: THEME.DARK,
      colorsSet: {
        [THEME.DARK]: {
          connectButton: {
            background: "#8b5cf6",
          },
          accent: "#ec4899",
        },
      },
    },
  };

  /*
  |--------------------------------------------------------------------------
  | MAX WITHDRAWABLE
  |--------------------------------------------------------------------------
  */

  const maxWithdrawable =
    user.total_balance * config?.coinPriceTON;

  /*
  |--------------------------------------------------------------------------
  | WITHDRAWAL COOLDOWN
  |--------------------------------------------------------------------------
  */

  const getCooldown = () => {
    if (!user.last_withdrawal_at) return null;

    const lastWithdrawal = new Date(
      user.last_withdrawal_at
    ).getTime();

    const durationMs =
      config?.withdrawal_duration_days *
      24 *
      60 *
      60 *
      1000;

    const cooldownEnd =
      lastWithdrawal + durationMs;

    const remaining = cooldownEnd - now;

    return remaining > 0 ? remaining : null;
  };

  const formatCooldown = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const displayHours = hours % 24;
    const displayMinutes = minutes % 60;
    const displaySeconds = seconds % 60;

    return `${days}D ${displayHours}H ${displayMinutes}M ${displaySeconds}S`;
  };

  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  const validate = (val: any) => {
    const allowedLimit =
      user.total_deposit * config?.withdrawtimes -
      user.total_withdrawal;

    if (Number(val) > allowedLimit) {
      setError(
        `NOT_ENOUGH_LIMIT - MAX(${allowedLimit} GRAM)`
      );
      return;
    }

    if (Number(val) > maxWithdrawable) {
      setError(
        `INSUFFICIENT_BALANCE - MAX(${maxWithdrawable} GRAM)`
      );
      return;
    }

    if (Number(val) <= 0) {
      setError("");
      return;
    }

    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | MAX BUTTON
  |--------------------------------------------------------------------------
  */

  const handleMax = () => {
    const allowedLimit =
      user.total_deposit * config?.withdrawtimes -
      user.total_withdrawal;

    const balance =
      user.total_balance * config?.coinPriceTON;

    const maxAmount = Math.max(
      0,
      Math.min(balance, allowedLimit)
    );

    setWithdrawAmount(maxAmount.toString());

    setWithdrawAmountCoin(
      Number(
        maxAmount / config?.coinPriceTON
      )
    );

    validate(maxAmount);
  };

  /*
  |--------------------------------------------------------------------------
  | INPUT
  |--------------------------------------------------------------------------
  */

  const handleAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = e.target.value;

    setWithdrawAmount(val);

    setWithdrawAmountCoin(
      Number(
        Number(val) / config?.coinPriceTON
      )
    );

    validate(val);
  };

  /*
  |--------------------------------------------------------------------------
  | FINAL WITHDRAW
  |--------------------------------------------------------------------------
  */

  const handleFinalSubmit = async () => {
    if (pendingCount > 0) return;

    const amountTON = parseFloat(withdrawAmount);

    if (
      isNaN(amountTON) ||
      amountTON <= 0 ||
      amountTON > maxWithdrawable
    ) {
      setError(
        "Invalid amount or insufficient balance."
      );
      return;
    }

    if (error) return;

    try {
      setLoading(true);

      await handleWithdraw(amountTON);

      setWithdrawAmount("");
      setWithdrawAmountCoin(0);

      navigate("/wallet");
    } catch (err) {
      console.error(
        "Withdrawal failed",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | COOLDOWN
  |--------------------------------------------------------------------------
  */

  const cooldown = getCooldown();

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 20,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      className="min-h-screen px-5 pb-24 text-white"
    >
      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="flex items-center justify-between pt-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-all"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="text-center">
          <h1 className="text-sm font-black uppercase tracking-[0.2em]">
            Withdraw GRAM
          </h1>

          <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-1">
            Withdrawal
          </p>
        </div>

        <div className="w-10" />
      </div>

      {/* =========================================================
          WALLET CONNECTION
      ========================================================= */}

      <div className="flex justify-end mb-4">
        <div className="scale-75 origin-right">
          <div className="p-[1.5px] rounded-[23px] bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 overflow-hidden">
            <div className="rounded-[22px] overflow-hidden bg-[#0F172A]">
              <TonConnectButton />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          COOLDOWN
      ========================================================= */}

      {cooldown ? (
        <div className="mb-5 relative overflow-hidden rounded-2xl border border-pink-900/30 bg-black/40 p-5">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500/30" />

          <div className="flex flex-col items-center text-center gap-2">
            <Lock
              size={20}
              className="text-red-500/50 animate-pulse"
            />

            <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">
              Next_Withdrawal_Window
            </p>

            <p className="text-2xl font-black text-pink-500 font-mono tracking-tighter">
              {formatCooldown(cooldown)}
            </p>
          </div>
        </div>
      ) : null}

      {/* =========================================================
          MAIN WITHDRAW CARD
      ========================================================= */}

      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-[32px] opacity-20 blur-xl" />

        <div className="relative p-[1.5px] rounded-[30px] bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500">
          <div className="rounded-[29px] bg-[#090E1A] overflow-hidden">

            {/* =================================================
                OVERVIEW
            ================================================= */}

            <div className="p-5 space-y-5">

              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] via-black/30 to-purple-500/[0.04] p-4">

                <div className="absolute -top-16 -right-16 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

                <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-pink-500/10 blur-3xl rounded-full pointer-events-none" />

                {/* Header */}

                <div className="relative flex items-center justify-between mb-4">

                  <div>
                    <h3 className="text-xl font-black uppercase tracking-widest bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
                      Withdraw GRAM
                    </h3>

                    <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
                      Withdrawal overview
                    </p>
                  </div>

                  <div className="px-2.5 py-1 rounded-lg border border-cyan-400/10 bg-cyan-400/5">
                    <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400/70">
                      GRAM
                    </span>
                  </div>

                </div>

                {/* Balance */}

                <div className="relative rounded-xl border border-white/5 bg-black/30 p-3 mb-3">

                  <div className="flex justify-between items-center">

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">
                        Total Balance
                      </p>

                      <p className="mt-1 text-lg font-black text-white">
                        {user.total_balance.toLocaleString()}

                        <span className="ml-1.5 text-[9px] font-black uppercase tracking-widest text-white/30">
                          {config?.coin_ticker}
                        </span>
                      </p>
                    </div>

                    <div className="text-right">

                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">
                        GRAM Value
                      </p>

                      <p className="mt-1 text-sm font-black bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                        {maxWithdrawable.toLocaleString()}

                        <span className="ml-1 text-[8px] text-cyan-400/60">
                          GRAM
                        </span>
                      </p>

                    </div>

                  </div>
                </div>

                {/* Stats */}

                <div className="grid grid-cols-2 gap-2 mb-3">

                  <div className="rounded-xl border border-white/5 bg-white/[0.025] p-3">

                    <p className="text-[8px] font-black uppercase tracking-[0.15em] text-white/30">
                      Total GRAM TXN
                    </p>

                    <p className="mt-1 text-sm font-black bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                      {user.total_deposit.toLocaleString()}
                    </p>

                    <p className="text-[8px] font-bold text-white/20 uppercase">
                      GRAM
                    </p>

                  </div>

                  <div className="rounded-xl border border-white/5 bg-white/[0.025] p-3">

                    <p className="text-[8px] font-black uppercase tracking-[0.15em] text-white/30">
                      Withdrawn
                    </p>

                    <p className="mt-1 text-sm font-black bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                      {user.total_withdrawal.toLocaleString()}
                    </p>

                    <p className="text-[8px] font-bold text-white/20 uppercase">
                      GRAM
                    </p>

                  </div>

                </div>

                {/* Withdrawal Limit */}

                <div className="relative rounded-xl border border-purple-400/10 bg-purple-500/[0.035] p-3">

                  {(() => {

                    const withdrawLimit =
                      user.total_deposit *
                      config?.withdrawtimes;

                    const withdrawn =
                      Math.min(
                        user.total_withdrawal,
                        withdrawLimit
                      );

                    const remaining =
                      Math.max(
                        0,
                        withdrawLimit -
                          user.total_withdrawal
                      );

                    const progress =
                      withdrawLimit > 0
                        ? Math.min(
                            100,
                            (withdrawn /
                              withdrawLimit) *
                              100
                          )
                        : 0;

                    return (
                      <>
                        <div className="flex justify-between items-center mb-3">

                         

                          <div>

                            <p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/30">
                              Withdrawal Limit
                            </p>

                            <p className="mt-1 text-[11px] font-black text-white/80">
                             

                              <div className="flex flex-col text-[8px] font-bold text-white/30 uppercase">
                               <div>{config?.withdrawtimes}X of total GRAM txn </div> 
                              <div> (mining boost, rank boost)</div> 

                              </div>
                             
                            </p>

                          </div>

                          <div className="text-right">

                            <p className="text-[8px] font-black uppercase tracking-widest text-white/30">
                              Maximum
                            </p>

                            <p className="mt-1 text-[11px] font-black bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                              {withdrawLimit.toLocaleString()}

                              <span className="ml-1 text-[7px] text-white/30">
                                GRAM
                              </span>
                            </p>

                          </div>

                        </div>
                

                        {/* Progress */}

                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-black/60 border border-white/5">

                          <div
                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 transition-all duration-700"
                            style={{
                              width: `${progress}%`,
                            }}
                          />

                        </div>

                        <div className="flex justify-between items-center mt-2">

                          <div>
                            <span className="text-[7px] font-black uppercase tracking-widest text-white/25">
                              Used
                            </span>

                            <p className="text-[9px] font-black text-white/70">
                              {withdrawn.toLocaleString()} GRAM
                            </p>
                          </div>

                          <div className="text-center">
                            <span className="text-[7px] font-black uppercase tracking-widest text-white/25">
                              Progress
                            </span>

                            <p className="text-[9px] font-black text-cyan-400">
                              {progress.toFixed(1)}%
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-[7px] font-black uppercase tracking-widest text-white/25">
                              Remaining
                            </span>

                            <p className="text-[9px] font-black bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                              {remaining.toLocaleString()} GRAM
                            </p>
                          </div>
   
                        </div>
                        
                      </>
                      
                    );

                  })()}

                </div>
                <div className="mt-3 flex items-center gap-2 px-2 py-1 rounded-lg border border-green-500/10 bg-green-500/5">  
                  <AlertCircle size={30} className="text-yellow-500" /> 
                  <p className="mt-2 text-[8px] font-bold text-pink-500  tracking-widest">
                    Withdrawal limit is upto 2 times of the total GRAM transactions made using Mining Boost, Rank Boost or Ton task
                  </p>
                  </div>
              </div>

              {/* =================================================
                  AMOUNT INPUT
              ================================================= */}

              <div className="relative">

                <div className="absolute inset-0 bg-purple-500/5 blur-xl rounded-full pointer-events-none" />

                <div className="relative space-y-2">

                  <div className="flex justify-between items-center px-2 py-2">

                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                      Enter Amount
                    </span>

                    <button
                      onClick={handleMax}
                      disabled={!!cooldown || pendingCount > 0}
                      className="text-[9px] font-black text-white uppercase tracking-widest bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg active:scale-95 transition-all disabled:opacity-40"
                    >
                      Max
                    </button>

                  </div>

                  <div className="relative">

                    <input
                      type="number"
                      min="0"
                      value={withdrawAmount}
                      onChange={handleAmountChange}
                      disabled={!!cooldown || pendingCount > 0}
                      placeholder="0.00"
                      className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 pr-20 text-left text-3xl font-black text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-slate-800 disabled:opacity-50"
                    />

                    <div className="absolute right-5 inset-y-0 flex items-center pointer-events-none">

                      <span className="bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent text-sm font-black uppercase tracking-widest">
                        GRAM
                      </span>

                    </div>

                  </div>

                  <div className="flex justify-between items-center px-2">

                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                      Withdraw
                    </span>

                    <span className="text-[10px] font-mono font-bold text-white/90">
                      {Number(
                        withdrawAmountCoin || 0
                      ).toLocaleString()}

                      <span className="ml-1 text-[8px] text-white/30">
                        {config?.coin_ticker}
                      </span>
                    </span>

                  </div>

                </div>

              </div>

              {/* Error */}

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                  <p className="text-[9px] font-black text-rose-500 uppercase">
                    {error}
                  </p>
                </div>
              )}

              {pendingCount > 0 && (
                <div
                  role="status"
                  className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                      <Lock size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-amber-200">
                        Complete your tasks to withdraw
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        You have {pendingCount} pending {pendingCount === 1 ? "task" : "tasks"}.
                        {" "}Withdrawal will be available once all tasks are completed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================
                  ACTION BUTTONS
              ================================================= */}

              <div className="flex gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 font-black text-[10px] uppercase text-slate-400 active:scale-95 transition-all"
                >
                  Back
                </button>

                {pendingCount > 0 ? (
                  <button
                    onClick={() => navigate("/tasks")}
                    className="flex-[2] py-4 px-3 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 shadow-lg shadow-pink-500/20 font-black text-[10px] text-white uppercase tracking-widest active:scale-95 transition-all"
                  >
                    View Tasks
                  </button>
                ) : userFriendlyAddress ? (
                  <button
                    disabled={!!error || !!cooldown || loading}
                    onClick={handleFinalSubmit}
                    className={`flex-[2] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                      error || cooldown || loading
                        ? "bg-white/5 border border-white/5 text-slate-600"
                        : "bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 shadow-lg shadow-pink-500/20 active:scale-95"
                    }`}
                  >
                    {loading ? "Processing..." : "Confirm Withdrawal"}
                  </button>
                ) : (
                  <button
                    onClick={() => tonConnectUI.openModal()}
                    className="flex-[2] py-4 rounded-2xl bg-blue-500 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Security */}

      <div className="flex items-center justify-center gap-2 mt-5">
        <ShieldCheck
          size={12}
          className="text-cyan-500/50"
        />

        <p className="text-[8px] font-black uppercase tracking-widest text-white/20">
          Secure TON Mainnet Withdrawal
        </p>
      </div>

    </motion.div>
  );
};

export default WithdrawGram;
