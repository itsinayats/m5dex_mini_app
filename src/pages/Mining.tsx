import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, Activity, Cpu, Box, 
  Layers, Thermometer, Signal, 
  Terminal as TerminalIcon, Sparkles
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import BoostSheet from "../components/BoostSheet";
import CPULoadGraph from "../components/CPULoadGraph";

const Mining: React.FC = () => {
  const { 
    user, startMining, claimMining, 
    setBoostType, setShowBoostSheet, isLoading,config
  } = useAppContext();

  // State for random telemetry
  const [cpuLoad, setCpuLoad] = useState("84.4");
  const [temp, setTemp] = useState("77.8");
  const [ping, setPing] = useState("21");
const [logs, setLogs] = useState<string[]>([
  `[SYS] ${config?.coin_ticker} Kernel Active...`,
  `[NET] Quantum relay connected`,
  `[GPU] CUDA cores initialized`,
  `[MEM] Memory shard allocated`,
  `[CHAIN] Syncing latest blocks`,
  `[SYS] Mining engine stable`,
  `[AUTH] Wallet signature verified`,
  `[PING] Node latency: 21ms`,
  `[POOL] Reward stream connected`,
  `[AI] Predictive miner online`,
  `[TEMP] Thermal state nominal`,
  `[CORE] Multi-thread execution enabled`,
]);

  const [miningTime, setMiningTime] = useState<string>("03:00:00");
  const [miningProgress, setMiningProgress] = useState(0);
  const [isMiningFinished, setIsMiningFinished] = useState(false);
  const [minedTokens, setMinedTokens] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
  const interval = setInterval(() => {
    setCurrentTime(Date.now());
  }, 1000);

  return () => clearInterval(interval);
}, []);

  const MINING_DURATION = 3 * 60 * 60 * 1000;
  const isActuallyMining = Boolean(
  user?.mining_started_at &&
  currentTime - new Date(user.mining_started_at).getTime() < MINING_DURATION
);
  //const isActuallyMining = user?.mining_started_at && !isMiningFinished;

  // Telemetry & Log Jitter (Logic remains the same, colors changed in UI)
  useEffect(() => {
    if (!isActuallyMining) {
      setCpuLoad("0.0"); setTemp("32.1"); setPing("---");
      return;
    }
    const interval = setInterval(() => {
      setCpuLoad((80 + Math.random() * 10).toFixed(1));
      setTemp((75 + Math.random() * 5).toFixed(1));
      setPing(Math.floor(18 + Math.random() * 15).toString());
    }, 1500);
    return () => clearInterval(interval);
  }, [isActuallyMining]);

useEffect(() => {
  if (!isActuallyMining) return;

  const fakeLogs = [
    `[SYS] Refracted Block`,
    `[NET] Node synchronized`,
    `[POOL] Reward packet received`,
    `[AI] Optimizing hash routes`,
    `[GPU] Shader cores boosted`,
    `[TEMP] Cooling stabilized`,
    `[MEM] Cache refreshed`,
    `[CORE] Hyper-thread active`,
    `[CHAIN] New block discovered`,
    `[AUTH] Validator approved`,
    `[PING] Secure relay stable`,
    `[HASH] Difficulty adjusted`,
    `[SYS] Mining stream secured`,
    `[NODE] Peer consensus reached`,
    `[TASK] Executing smart cycle`,
    `[BOOST] Power multiplier active`,
    `[GPU] Voltage optimized`,
    `[POOL] Share accepted`,
    `[SYS] Quantum sync active`,
    `[CPU] Dynamic frequency scaling`,
  ];

  const logInterval = setInterval(() => {
    const randomHex = Math.random()
      .toString(16)
      .slice(2, 10)
      .toUpperCase();

    const randomReward = (
      Math.random() * 0.009 + 0.001
    ).toFixed(6);

    const randomLog =
      fakeLogs[Math.floor(Math.random() * fakeLogs.length)];

    const finalLog =
      Math.random() > 0.35
        ? `${randomLog} :: ${randomHex}`
        : `[+] ${config?.coin_ticker} Reward +${randomReward}`;

    setLogs((prev) => [...prev.slice(-14), finalLog]);
  }, 1200);

  return () => clearInterval(logInterval);
}, [isActuallyMining]);


  useEffect(() => {
    if (user?.mining_started_at) {
      const startTime = new Date(user.mining_started_at).getTime();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= MINING_DURATION) {
          setMiningTime("00:00:00");
          setMiningProgress(100);
          setIsMiningFinished(true);
          setMinedTokens(3 * user.mining_speed);
          clearInterval(interval);
        } else {
          const remaining = MINING_DURATION - elapsed;
          const h = Math.floor(remaining / 3600000).toString().padStart(2, '0');
          const m = Math.floor((remaining % 3600000) / 60000).toString().padStart(2, '0');
          const s = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
          setMiningTime(`${h}:${m}:${s}`);
          setMiningProgress((elapsed / MINING_DURATION) * 100);
          setMinedTokens((elapsed / 3600000) * user.mining_speed);
          setIsMiningFinished(false);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [user?.mining_started_at, user?.mining_speed]);

  if (!user) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 space-y-6 pb-24 text-white">
      
      {/* Header - Rainbow Border Style */}
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-brand-400" />
          <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Total Mined</h1>
        </div>
        <div className="p-[1px] rounded-full bg-gradient-to-r from-brand-500 via-brand-500 to-brand-500">
            <div className="bg-[#171b22] px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="text-xs font-black bg-gradient-to-r from-brand-400 to-brand-400 bg-clip-text text-transparent">
                    {user.mining_balance.toLocaleString()}
                </span>
                <span className="text-[8px] font-bold text-neutral-500 uppercase">{config?.coin_ticker}</span>
            </div>
        </div>
      </div>

      {/* Hero Display - Multi-color Text */}
      <div className="relative flex flex-col items-center text-center py-6">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 to-transparent blur-3xl -z-10" />
        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] mb-2">Progress Mining</p>
        <h1 className="text-7xl font-black tracking-tighter tabular-nums  bg-gradient-to-br from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
          {minedTokens.toFixed(3)}
        </h1>
        <div className="flex items-center gap-1.5 opacity-60 mb-4">
        <span className="text-sm font-medium text-white/80">≈</span>
        <span className="text-sm font-bold text-white tracking-wide">
          {/* Replace '0.01' with your actual conversion rate */}
          {(Number(user.total_balance ?? 0) * config?.coinPriceTON).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </span>
        <span className="text-[10px] font-black text-white/50">GRAM</span>
      </div>
        <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-brand-500 animate-bounce" />
            <div className="w-1 h-1 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]" />
            <div className="w-1 h-1 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]" />
          </div>
          
          <span className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.15em]">
            {user.mining_speed} PPH <span className="text-neutral-500 mx-1">|</span>
            <span className={`${isActuallyMining ? "text-[#50C878] animate-pulse" : "text-[#ffe000]"}`}>
               {/* USDT Value - Added Section */}
      
  <span className={isActuallyMining ? "text-[#50C878] animate-pulse" : "text-[#ffe000]"}>
  {isActuallyMining ? "Mining Live" : "Mining Stopped"}
</span>
</span>
          </span>
        </div>
      </div>

      {/* Telemetry Grid - Color Transitions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "CORE", val: `${cpuLoad}%`, icon: Cpu, grad: "from-brand-500/20 to-transparent", border: "border-brand-500/20" },
          { label: "HEAT", val: `${temp}°C`, icon: Thermometer, grad: "from-brand-500/20 to-transparent", border: "border-orange-500/20" },
          { label: "BEAM", val: isActuallyMining ? `${ping}ms` : "---", icon: Signal, grad: "from-brand-500/20 to-transparent", border: "border-brand-500/20" }
        ]?.map((stat, i) => (
          <div key={i} className={`bg-[#171b22] border ${stat.border} rounded-2xl p-4 flex flex-col items-center gap-2 relative overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-b ${stat.grad} pointer-events-none`} />
            <stat.icon size={16} className="text-white relative z-10" />
            <p className="text-[7px] font-black text-neutral-500 uppercase tracking-widest relative z-10">{stat.label}</p>
            <p className="text-xs font-black text-white tabular-nums relative z-10">{stat.val}</p>
          </div>
        ))}
      </div>

       <div className="grid grid-cols-1 gap-3">
          {!user.mining_started_at ? (
            <button 
              onClick={startMining} 
              className="group relative w-full h-14 rounded-2xl overflow-hidden font-black text-[#000] text-sm uppercase tracking-[0.2em] transition-all active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-600 to-brand-600 animate-gradient-x" />
              <span className="relative z-10 text-white flex items-center justify-center gap-2">
                <Sparkles className="text-[#000]" size={16} /> <span className="text-[#000]">Start Mining</span>
              </span>
            </button>
          ) : (
            <button 
              disabled={!isMiningFinished || isLoading} 
              onClick={claimMining} 
              className={`w-full h-14 rounded-2xl font-black text-sm transition-all active:scale-95 uppercase tracking-[0.2em] border ${
                isMiningFinished 
                ? 'bg-white text-black border-transparent shadow-xl' 
                : 'bg-white/5 text-neutral-500 border-white/10'
              }`}
            >
              {isLoading ? 'Syncing...' : isMiningFinished ? 'Claim' : 'Mining...'}
            </button>
          )}

        <div className="space-y-6 pt-4">

  <div className="space-y-6 pt-4">
      
  <CPULoadGraph isMining={isActuallyMining} cpuLoad={Number(cpuLoad)} />

</div>
  {/* MINING PROGRESS */}
  <div className="w-full space-y-3">
    <div className="flex justify-between items-end px-2">
      <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
        Mining Progress
      </p>

      <p className="text-sm font-black bg-gradient-to-r from-brand-400 to-brand-400 bg-clip-text text-transparent tracking-tighter tabular-nums">
        {miningTime}
      </p>
    </div>

    <div className="w-full h-3 bg-neutral-900 rounded-full overflow-hidden border border-white/5 p-[2px]">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${miningProgress}%` }}
        className="h-full bg-gradient-to-r from-brand-500 via-brand-500 to-brand-500 rounded-full shadow-[0_0_20px_rgba(255,224,0,0.4)]"
      />
    </div>
  </div>

</div>
          
          <button 
            onClick={() => { setBoostType('mining'); setShowBoostSheet(true); }} 
            className="w-full bg-[#171b22] border border-white/10 h-14 rounded-2xl font-black flex items-center justify-center gap-3 text-neutral-300 text-xs uppercase tracking-widest active:scale-95 transition-all hover:border-brand-500/50"
          >
            <Zap size={16} className="text-yellow-400 fill-yellow-400" />
            Upgrade Machine
          </button>
        </div>

      {/* Rainbow Terminal */}
      <div className="bg-[#101318] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-brand-500/10 via-brand-500/10 to-brand-500/10 px-4 py-2 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            <TerminalIcon size={12} className="text-brand-400" />
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{config?.coin_ticker}_Analysis.log</span>
          </div>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
          </div>
        </div>
            <div className="relative h-56 overflow-hidden">
  <div className="absolute inset-0 p-4 font-mono text-[9px] space-y-2 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-900/10 via-transparent to-transparent">
    
    <AnimatePresence mode="popLayout">
      {logs?.map((log, idx) => (
        <motion.p
          key={`${idx}-${log}`}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className={`truncate ${
            log.includes("[+]")
              ? "text-brand-400 font-bold"
              : "text-neutral-500"
          }`}
        >
          <span className="opacity-50 mr-2">{">"}</span>
          {log}
        </motion.p>
      ))}
    </AnimatePresence>

  </div>
</div>
      </div>



      <BoostSheet />
    </motion.div>
  );
};

export default Mining;
