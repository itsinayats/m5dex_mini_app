import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Zap, AlertCircle, Activity, 
  TrendingUp, Lock, Layers, BarChart3, Clock,
  PiggyBank,
  PiggyBankIcon,
  CheckCircle
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const StakeItem = ({ stake }: { stake: any }) => {
  const [now, setNow] = useState(Date.now());
  const [isClaiming, setIsClaiming] = useState(false);

  const { claimStake,config } = useAppContext();

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  /*
   * Update time every second
   * Used for countdowns and maturity detection.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /*
   * ================================
   * BASIC STAKE DATA
   * ================================
   */

  const amount = Number(stake.amount || 0);

  const durationDays = Number(
    stake.durationDays || 30
  );

  /*
   * IMPORTANT:
   *
   * roi = MONTHLY ROI percentage
   *
   * Example:
   * amount = 10,000,000
   * roi = 30
   *
   * Monthly ROI:
   * 10,000,000 × 30% = 3,000,000
   *
   * Daily ROI:
   * 3,000,000 / 30 = 100,000
   */
  const roi = Number(stake.roi || 0);

  /*
   * ================================
   * STAKE TIMING
   * ================================
   */

  const startTime = new Date(
    stake.timestamp
  ).getTime();

  /*
   * If this is the first claim,
   * counting starts from stake timestamp.
   *
   * After a claim, backend updates
   * lastClaimedAt.
   */
  const lastClaimedTime = stake.lastClaimedAt
    ? new Date(stake.lastClaimedAt).getTime()
    : startTime;

  const durationMs =
    durationDays * ONE_DAY_MS;

  const endTime =
    startTime + durationMs;

  /*
   * Stake is matured when current time
   * reaches the end time.
   */
  const isMatured =
    now >= endTime;

  /*
   * Remaining time until maturity.
   */
  const timeRemainingMs = Math.max(
    0,
    endTime - now
  );

  /*
   * ================================
   * ROI CALCULATION
   * ================================
   */

  /*
   * Monthly ROI amount.
   *
   * Example:
   * 10,000,000 × 30 / 100
   * = 3,000,000
   */
  const monthlyInterest =
    (amount * roi) / 100;

  /*
   * Daily ROI.
   *
   * Using 30 days per month.
   *
   * 3,000,000 / 30
   * = 100,000
   */
  const dailyInterest =
    monthlyInterest / 30;

  /*
   * Total ROI possible for the
   * entire staking duration.
   *
   * Example:
   * 100,000 × 180
   * = 18,000,000
   */
  const totalRoiPossible =
    dailyInterest * durationDays;

  /*
   * ================================
   * CLAIMED ROI
   * ================================
   */

  const alreadyClaimed =
    Number(stake.claimedAmount || 0);

  /*
   * Remaining ROI that has not yet
   * been claimed.
   *
   * Principal is NOT included here.
   */
  const remainingInterest = Math.max(
    0,
    totalRoiPossible -
      alreadyClaimed
  );

  /*
   * ================================
   * TOTAL GENERATED ROI
   * ================================
   *
   * This is the ROI generated from
   * the beginning of the stake.
   *
   * It stops at maturity.
   *
   * We use completed 24-hour periods
   * so the value doesn't continuously
   * increase every second.
   */

  const elapsedFromStartMs = Math.max(
  0,
  Math.min(
    now - startTime,
    durationMs
  )
);

const completedDaysSinceStart = Math.floor(
  elapsedFromStartMs / ONE_DAY_MS
);

const totalGeneratedInterest = Math.min(
  totalRoiPossible,
  completedDaysSinceStart * dailyInterest
);
// ==========================================
// CLAIMABLE INTEREST
// ==========================================
//
// ROI is generated from the original
// stake timestamp.
//
// Claimable:
// total generated ROI - already claimed ROI
//
// Example:
// Day 1 = 1  {config?.coin_ticker}
// Day 2 = 2  {config?.coin_ticker}
// Day 3 = 3  {config?.coin_ticker}
//
// If already claimed = 1  {config?.coin_ticker}:
// Claimable = 3 - 1 = 2  {config?.coin_ticker}
//

let claimableInterest = Math.min(
  Math.max(
    0,
    totalGeneratedInterest - alreadyClaimed
  ),
  remainingInterest
);

// At maturity, allow all remaining ROI
if (isMatured) {
  claimableInterest = remainingInterest;
}


/*
 * ================================
 * LIVE ROI DISPLAY
 * ================================
 *
 * This is DISPLAY ONLY.
 *
 * It continuously increases every second
 * based on the exact elapsed time.
 *
 * Claiming still uses completed 24-hour
 * periods separately.
 */

// Exact elapsed time since stake started
const exactElapsedMs = Math.max(
  0,
  Math.min(
    now - startTime,
    durationMs
  )
);

// Continuous ROI accrued for display
const liveGeneratedInterest = Math.min(
  totalRoiPossible,
  (exactElapsedMs / ONE_DAY_MS) *
    dailyInterest
);

  /*
   * ================================
   * CLAIM STATUS
   * ================================
   */

const canClaim = claimableInterest > 0;

  const allRoiClaimed =
    remainingInterest <= 0.000001;

  /*
   * ================================
   * CLAIM COUNTDOWN
   * ================================
   *
   * Only show countdown when:
   *
   * - stake isn't matured
   * - there is nothing claimable
   */

  let claimCooldownMs = 0;

if (!isMatured && !canClaim) {
  const nextGeneratedDay =
    (completedDaysSinceStart + 1) *
    ONE_DAY_MS;

  claimCooldownMs = Math.max(
    0,
    nextGeneratedDay -
      elapsedFromStartMs
  );
}

  /*
   * ================================
   * NUMBER FORMAT
   * ================================
   */

  const formatNumber = (
    value: number
  ) => {
    return value.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  /*
   * ================================
   * TIME FORMAT
   * ================================
   */

  const formatTimeLeft = (
    milliseconds: number
  ) => {
    const totalSeconds =
      Math.max(
        0,
        Math.floor(
          milliseconds / 1000
        )
      );

    const days = Math.floor(
      totalSeconds / 86400
    );

    const hours = Math.floor(
      (totalSeconds % 86400) /
        3600
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) /
        60
    );

    const seconds =
      totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${String(
        hours
      ).padStart(
        2,
        "0"
      )}h ${String(
        minutes
      ).padStart(
        2,
        "0"
      )}m`;
    }

    return `${String(
      hours
    ).padStart(
      2,
      "0"
    )}:${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      seconds
    ).padStart(
      2,
      "0"
    )}`;
  };

  /*
   * ================================
   * CLAIM HANDLER
   * ================================
   */

  const handleClaimInterest =
    async () => {
      if (
        !canClaim ||
        isClaiming ||
        allRoiClaimed
      ) {
        return;
      }

      try {
        setIsClaiming(true);

        /*
         * Backend handles:
         *
         * - 24h validation
         * - ROI calculation
         * - balance update
         * - claimedAmount update
         * - lastClaimedAt update
         * - maturity
         */
        await claimStake(
          stake._id
        );
      } catch (error) {
        console.error(
          "Failed to claim staking ROI:",
          error
        );
      } finally {
        setIsClaiming(false);
      }
    };

  /*
   * ================================
   * CURRENT VALUE
   * ================================
   *
   * Principal + generated ROI.
   *
   * This is display-only.
   * It does NOT mean principal is
   * claimable.
   */

  const liveTotalValue =
    amount +
    totalGeneratedInterest;

  /*
   * ================================
   * PROGRESS
   * ================================
   */

  const progressRatio =
    durationMs > 0
      ? Math.min(
          1,
          Math.max(
            0,
            elapsedFromStartMs /
              durationMs
          )
        )
      : 0;

  const progressPercent =
    progressRatio * 100;

  /*
   * ================================
   * UI
   * ================================
   */

  return (
    <div
      className="
        bg-[#0d162a]
        border
        border-white/10
        rounded-3xl
        p-5
        space-y-5
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="
              w-10
              h-10
              rounded-xl
              bg-pink-500/10
              border
              border-pink-500/20
              flex
              items-center
              justify-center
            "
          >
            <Activity
              size={19}
              className="text-pink-400"
            />
          </div>

          <div>
            <p className="text-sm font-bold text-white">
              Active Stake
            </p>

            <p className="text-[10px] text-slate-500">
              {durationDays} Days
            </p>
          </div>
        </div>

        <div
          className={`
            px-3
            py-1.5
            rounded-full
            text-[10px]
            font-bold
            uppercase
            tracking-wider
            ${
              isMatured
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-pink-500/10 text-pink-400 border border-pink-500/20"
            }
          `}
        >
          {isMatured
            ? "Matured"
            : "Active"}
        </div>
      </div>

      {/* STAKED AMOUNT */}
      <div
        className="
          bg-white/[0.03]
          border
          border-white/[0.06]
          rounded-2xl
          p-4
        "
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Staked Amount
          </span>

          <Lock
            size={14}
            className="text-slate-600"
          />
        </div>

        <div className="mt-2">
          <span className="text-2xl font-black text-white">
            {formatNumber(amount)}
          </span>

          <span className="ml-2 text-xs text-slate-500">
             {config?.coin_ticker}
          </span>
        </div>
      </div>

      {/* PROGRESS */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">
            Staking Progress
          </span>

          <span className="text-[10px] font-bold text-pink-400">
            {progressPercent.toFixed(
              1
            )}
            %
          </span>
        </div>

        <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="
              h-full
              bg-gradient-to-r
              from-pink-600
              to-purple-500
              rounded-full
              transition-all
              duration-1000
            "
            style={{
              width: `${progressPercent}%`,
            }}
          />
        </div>
      </div>

      {/* ROI GRID */}
      <div className="grid grid-cols-2 gap-3">
        {/* MONTHLY ROI */}
        <div
          className="
            bg-white/[0.03]
            border
            border-white/[0.06]
            rounded-2xl
            p-4
          "
        >
          <div className="flex items-center gap-2">
            <TrendingUp
              size={14}
              className="text-green-400"
            />

            <span className="text-[10px] text-slate-500 uppercase">
              Monthly ROI
            </span>
          </div>

          <p className="text-lg font-black text-green-400 mt-2">
            {roi}%
          </p>
        </div>

        {/* DAILY RETURN */}
        <div
          className="
            bg-white/[0.03]
            border
            border-white/[0.06]
            rounded-2xl
            p-4
          "
        >
          <div className="flex items-center gap-2">
            <TrendingUp
              size={14}
              className="text-yellow-400"
            />

            <span className="text-[10px] text-slate-500 uppercase">
              Daily Return
            </span>
          </div>

          <p className="text-lg font-black text-yellow-400 mt-2">
            {formatNumber(
              dailyInterest
            )}
          </p>
        </div>
      </div>

      {/* LIVE ROI */}
      <div
        className="
          bg-gradient-to-r
          from-pink-500/[0.06]
          to-purple-500/[0.06]
          border
          border-pink-500/10
          rounded-2xl
          p-4
        "
      >
<div className="grid grid-cols-1">
  <div>
    <p className="text-[10px] text-slate-500 uppercase tracking-wider">
      Live ROI Accrued
    </p>

    <p className="text-xl font-black text-pink-400 mt-1 flex items-center">
      <span>
        +{liveGeneratedInterest.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
      </span>

      <span className="ml-auto ml-2 text-xs text-slate-500 bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent text-sm font-black uppercase tracking-widest">
        {config?.coin_ticker}
      </span>
    </p>
  </div>
</div>
      </div>

      {/* TOTAL VALUE */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-slate-500">
          Current Value
        </span>

        <span className="text-sm font-black text-white">
          {formatNumber(
            liveTotalValue
          )}{" "}
          {config?.coin_ticker}
        </span>
      </div>

       {/* TOTAL VALUE */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-slate-500">
          Claimed ROI
        </span>

        <span className="text-sm font-black text-white">
           {formatNumber(alreadyClaimed)}
          {config?.coin_ticker}
        </span>
      </div>

      {/* CLAIM SECTION */}
      <div
        className="
          border-t
          border-white/[0.06]
          pt-5
        "
      >
        {
          !allRoiClaimed && (
            <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            {isMatured
            ? "Final Payout"
            : "Daily Claimable Interest"}
            </p>

           <p className="text-xl font-black text-white mt-1">
  {formatNumber(
    isMatured
      ? amount + claimableInterest
      : claimableInterest
  )}
</p>
          </div>

          <span className="ml-2 text-xs text-slate-500 bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent text-sm font-black uppercase tracking-widest">
            {config?.coin_ticker}
          </span>
        </div>
          )
        }
        

        {/* ALL ROI CLAIMED */}
        {allRoiClaimed ? (
          <div
            className="
              w-full
              py-3.5
              rounded-2xl
              bg-green-500/10
              border
              border-green-500/20
              flex
              items-center
              justify-center
              gap-2
              text-green-400
              text-sm
              font-bold
            "
          >
            <CheckCircle
              size={17}
            />

            All ROI Claimed
          </div>
        ) : canClaim ? (
          /* CLAIM BUTTON */
         <button
  type="button"
  onClick={handleClaimInterest}
  disabled={isClaiming}
  className="
    w-full
    py-3.5
    rounded-2xl
    bg-gradient-to-r
    from-pink-600
    to-purple-600
    text-white
    text-sm
    font-black
    shadow-lg
    shadow-pink-900/20
    active:scale-[0.98]
    transition
    disabled:opacity-50
    disabled:cursor-not-allowed
  "
>
  {isClaiming
    ? "Processing..."
    : isMatured
    ? "Claim All & Unstake"
    : `Claim ${formatNumber(
        claimableInterest
      )}  ${config?.coin_ticker}`}
</button>
        ) : (
          /* COUNTDOWN */
          <div
            className="
              w-full
              py-3.5
              rounded-2xl
              bg-white/[0.03]
              border
              border-white/[0.06]
              flex
              items-center
              justify-center
              gap-2
            "
          >
            <Clock
              size={15}
              className="text-slate-500"
            />

            <span className="text-xs text-slate-400">
              Next claim in
            </span>

            <span className="text-xs font-bold text-white">
              {formatTimeLeft(
                claimCooldownMs
              )}
            </span>
          </div>
        )}

        {/* INFO */}
        {!isMatured &&
          !allRoiClaimed && (
            <p className="text-[9px] text-center text-slate-600 mt-3">
              ROI accumulates every 24
              hours since your last
              claim.
            </p>
          )}
      </div>

      {/* STAKE MATURITY COUNTDOWN */}
      {!isMatured &&
        !allRoiClaimed && (
          <div
            className="
              flex
              items-center
              justify-between
              text-[10px]
              text-slate-600
            "
          >
            <span>
              Stake ends in
            </span>

            <span className="font-semibold text-slate-500">
              {formatTimeLeft(
                timeRemainingMs
              )}
            </span>
          </div>
        )}
    </div>
  );
};


const StakingProtocol: React.FC = () => {
  const { user, handleStake, stakingHistory, fetchStakingHistory, isLoading,config } = useAppContext();
  const navigate = useNavigate();

  const [amount, setAmount] = useState<string>("");
  const [totalLiveEarnings, setTotalLiveEarnings] = useState(0);
    const [totalStaked, setTotalStaked] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const availableBalance = user?.total_balance || 0;

  useEffect(() => {
    fetchStakingHistory();
  }, []);

  // --- Real-time Aggregate Earnings Logic ---
  useEffect(() => {
    const calculateAllEarnings = () => {
      const now = Date.now();
      let total = 0;
      let totalStaking = 0;
      stakingHistory.forEach((stake: any) => {
        const startTime = new Date(stake.timestamp).getTime();
        const durationMs = (stake.durationDays || 30) * 24 * 60 * 60 * 1000;
        const totalRoiPossible = (stake.amount * (stake.roi || 0)) / 100;
        const elapsedMs = Math.max(0, now - startTime);
        const progressRatio = Math.min(1, elapsedMs / durationMs);
        total += totalRoiPossible * progressRatio;
        totalStaking += stake.amount;
      });
      setTotalStaked(totalStaking);
      setTotalLiveEarnings(total);
    };
    const timer = setInterval(calculateAllEarnings, 1000);
    return () => clearInterval(timer);
  }, [stakingHistory]);

  // --- Input Validation Logic ---
  useEffect(() => {
    const numAmount = parseFloat(amount);
    const hasInsufficientFunds = numAmount > availableBalance;
    const isInvalidNumber = isNaN(numAmount) || numAmount <= 0;
    
    if (hasInsufficientFunds) {
      setError("Insufficient Balance");
    } else {
      setError(null);
    }

    setIsButtonDisabled(isLoading || isInvalidNumber || hasInsufficientFunds);
  }, [amount, availableBalance, isLoading]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) setAmount(value);
  };

  const onStakeClick = async () => {
    if (isButtonDisabled) return;
    const success = await handleStake(parseFloat(amount));
    if (success) {
        setAmount("");
        fetchStakingHistory(); // Refresh history immediately
    }
  };

  if (!user) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 space-y-6 pb-24 text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between pt-6">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border-2 border-slate-800 text-slate-400">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="text-[10px] font-black uppercase  text-slate-500 ">Staking Protocol</h1>
                <p className="text-sm font-black text-white uppercase">Asset_Staking</p>
            </div>
        </div>
        <div className="w-10 h-10 bg-black border-2 border-pink-900/30 rounded-xl flex items-center justify-center relative">
            <Layers size={18} className="text-pink-500" />
        </div>
      </div>

      {/* Main Portfolio Monitor */}
      <div className="relative bg-[#070B14] border-2 border-pink-900/20 rounded-[2.5rem] overflow-hidden p-8 flex flex-col items-center">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-600 via-purple-400 to-pink-600 animate-pulse" />
        
        <div className="w-full flex justify-between items-center mb-6">
            <div className="px-3 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping" />
                <span className="text-[8px] font-black text-pink-500 uppercase">Protocol_Live</span>
            </div>
            
        </div>

        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1 text-center w-full">Available_balance</p>
        <h2 className="text-4xl font-black tracking-tighter text-white tabular-nums mb-4">
          {availableBalance.toLocaleString()}
        </h2>

        <div className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="text-xs font-mono font-black text-green-400 tabular-nums flex flex-col items-center">
                <span className="flex flex-row "><PiggyBank size={16} className="text-green-500 mr-2" /> <span className="text-slate-500">In-Stake</span></span>
                <span className="flex flex-row text-pink-400">{totalStaked.toLocaleString(undefined, { minimumFractionDigits: 0 })} {config?.coin_ticker} </span>
            </div>
            <span className="text-xs font-mono font-black text-green-400 tabular-nums flex flex-col items-center">
              <span className="flex flex-row "><TrendingUp size={16} className="text-green-500 mr-2" /> <span className="text-slate-500">Earning</span></span>
              <span>+{(totalLiveEarnings).toFixed(6)}</span> 
            </span>
        </div>
      </div>

      {/* Stake Input Section */}
      <div className="space-y-4">
        <div className="bg-black/40 border-2 border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enter New Stake Amount</span>
            <button onClick={() => setAmount(availableBalance.toString())} className="text-[9px] font-black text-pink-500 bg-pink-500/5 border border-pink-500/20 px-3 py-1 rounded-lg">MAX</button>
          </div>
         <div className="relative w-full">
        <input 
          type="text" 
          value={amount} 
          onChange={handleAmountChange} 
          placeholder="0.00"
          className={`w-full bg-black border-2 ${
            error ? 'border-red-500/50' : 'border-slate-800 focus:border-white/30'
          } rounded-2xl p-4 pr-16 text-2xl font-black text-white focus:outline-none font-mono transition-all`}
        />

       
  
  {/* Rightmost Coin Name */}
  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
    <div className="w-[1px] h-6 bg-white/10 mx-1" /> {/* Vertical Divider */}
    <span className="bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent text-sm font-black uppercase tracking-widest">
      {config?.coin_ticker}
    </span>
  </div>

  
</div>
 <div className="flex flex-col mt-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">
          <div className="flex flex-row justify-between">
            <div>
              Staking Duration: 
            </div>
             <div>
              {config?.staking_duration_days} Days
            </div>
          </div>
           <div className="flex flex-row justify-between">
            <div>
               Monthly ROI:
            </div>
             <div>
              {config?.staking_monthly_roi}% Monthly
            </div>
          </div>
         
        </div>
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-400">
                <AlertCircle size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          disabled={isButtonDisabled} 
          onClick={onStakeClick} 
          className={`relative w-full h-12 rounded-2xl overflow-hidden transition-all ${!isButtonDisabled ? 'active:scale-[0.98]' : 'opacity-40 grayscale pointer-events-none'}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-500 to-pink-600" />
          <div className="absolute inset-[2px] bg-[#0F172A] rounded-[14px] flex items-center justify-center">
            {isLoading ? (
                <Activity size={20} className="animate-spin text-pink-500" />
            ) : (
                <div className="flex items-center gap-3">
                    <PiggyBankIcon size={16} className="text-white" />
                    <span className="text-white font-black text-[11px] uppercase ">Confirm_Stake</span>
                </div>
            )}
          </div>
        </button>
      </div>

      {/* History List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
            <BarChart3 size={14} className="text-slate-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase">Active Stakes ({stakingHistory.length})</span>
        </div>

        <div className="space-y-3">
            {stakingHistory.length > 0 ? (
                stakingHistory?.map((stake: any) => (
                    <StakeItem key={stake._id} stake={stake} />
                ))
            ) : (
                <div className="py-10 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center opacity-50">
                    <TrendingUp size={24} className="text-slate-700 mb-2" />
                    <p className="text-[9px] font-black text-slate-600 uppercase">Zero_Active_Stakes</p>
                </div>
            )}
        </div>
      </div>
    </motion.div>
  );
};

export default StakingProtocol;