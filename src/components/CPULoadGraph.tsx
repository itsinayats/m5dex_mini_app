import React, { useEffect, useRef, useState } from "react";

interface CPULoadGraphProps {
  isMining?: boolean;
  cpuLoad: number;
}

// Helper to generate mock historical data for initial page load if already mining
const generateInitialHistory = (baseLoad: number): number[] => {
  const target = baseLoad > 0 ? baseLoad : 80;
  let current = target;

  return Array.from({ length: 80 }, () => {
    const variation = (Math.random() - 0.5) * 10;
    current = Math.max(10, Math.min(100, current + variation));
    return Number(current.toFixed(1));
  });
};

const CPULoadGraph: React.FC<CPULoadGraphProps> = ({
  isMining = false,
  cpuLoad,
}) => {
  // If already mining on initial mount (e.g. page refresh), pre-populate.
  // Otherwise, start with all zeros.
  const [history, setHistory] = useState<number[]>(() =>
    isMining ? generateInitialHistory(cpuLoad) : Array(80).fill(0)
  );

  const historyRef = useRef<number[]>(history);
  const prevIsMiningRef = useRef<boolean>(isMining);
  const isInitialMount = useRef<boolean>(true);

  useEffect(() => {
    // Skip on initial mount since useState initializer handles it
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // 1. Mining stopped: reset graph to zeros
    if (!isMining) {
      historyRef.current = Array(80).fill(0);
      setHistory([...historyRef.current]);
      prevIsMiningRef.current = false;
      return;
    }

    // 2. Mining JUST STARTED (transitioned from false to true): start from 0
    if (!prevIsMiningRef.current && isMining) {
      historyRef.current = [...Array(79).fill(0), cpuLoad];
      setHistory([...historyRef.current]);
      prevIsMiningRef.current = true;
      return;
    }

    // 3. Ongoing mining updates: push new telemetry values into the graph
    historyRef.current = [...historyRef.current.slice(1), cpuLoad];
    setHistory([...historyRef.current]);
    prevIsMiningRef.current = true;
  }, [cpuLoad, isMining]);

  // Create graph path
  const width = 800;
  const height = 100;

  const linePoints = history.map((value, index) => {
    const x = (index / (history.length - 1)) * width;
    const y = height - (value / 100) * height;
    return `${x},${y}`;
  });

  const linePath = `M ${linePoints.join(" L ")}`;

  const areaPath = `
    ${linePath}
    L ${width},${height}
    L 0,${height}
    Z
  `;

  return (
    <div className="relative w-full h-24 overflow-hidden rounded-2xl bg-black border border-slate-800/80 mb-5">
      

     

      {/* Graph */}
      <svg
        viewBox="0 0 800 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id="cpuArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.02" />
          </linearGradient>

          <linearGradient id="cpuLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>

        {/* Horizontal grid */}
        <line
          x1="0"
          y1="25"
          x2="800"
          y2="25"
          stroke="rgba(148,163,184,0.08)"
        />
        <line
          x1="0"
          y1="50"
          x2="800"
          y2="50"
          stroke="rgba(148,163,184,0.08)"
        />
        <line
          x1="0"
          y1="75"
          x2="800"
          y2="75"
          stroke="rgba(148,163,184,0.08)"
        />

        {/* Filled area */}
        <path d={areaPath} fill="url(#cpuArea)" />

        {/* CPU line */}
        <path
          d={linePath}
          fill="none"
          stroke="url(#cpuLine)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: "drop-shadow(0 0 4px rgba(34,211,238,0.8))",
          }}
        />
      </svg>

      {/* Bottom labels */}
      <div className="absolute bottom-2 left-4 text-[7px] font-bold tracking-widest text-slate-200">
        GPU LOAD
      </div>

      <div className="absolute bottom-2 right-3 text-[7px] text-slate-200">
        {cpuLoad.toFixed(1)}%
      </div>
    </div>
  );
};

export default CPULoadGraph;