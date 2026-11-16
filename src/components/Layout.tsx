import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion ,AnimatePresence} from "framer-motion";
import { 
  LayoutGrid, 
  Activity, 
  UserPlus, 
  BarChart3, 
  Wallet2, 
  Shield, 
  LogOut, 
  Copy, 
  CopyCheck, 
  HeartHandshake, 
  UserCheck, 
  CheckSquare, 
  LayoutDashboard, 
  Cpu, 
  Orbit,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

const Layout: React.FC = () => {
  const { user, isImpersonating, logoutImpersonation, profilePhotoUrl, isBanned,config } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isTipVisible, setIsTipVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.id)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch((err) => console.error("Copy failed", err));
  };

  if (!user && !isBanned) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#07090c] text-white">
        <div className="relative">
          {/* Rainbow Loading Spinner */}
          <div className="w-20 h-20 border-4 border-transparent border-t-brand-500 border-r-brand-500 border-b-brand-500 rounded-full animate-spin"></div>
          <Orbit size={28} className="absolute inset-0 m-auto text-brand-400 animate-pulse" />
        </div>
        <p className="mt-8 text-transparent bg-gradient-to-r from-brand-400 via-brand-400 to-brand-400 bg-clip-text text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
          Initializing {config?.coin_ticker} Layer
        </p>
      </div>
    );
  }

  const handleLogoutImpersonation = () => {
    logoutImpersonation();
    navigate("/");
  };

  const tabs = [
    { id: "home", icon: LayoutGrid, label: "Home", path: "/" },
    { id: "mine", icon: Orbit, label: "Mining", path: "/mine" },
    { id: "tasks", icon: Sparkles, label: "Tasks", path: "/tasks" },
    { id: "friends", icon: UserPlus, label: "Friends", path: "/friends" },
    { id: "leaders", icon: BarChart3, label: "Leaderboard", path: "/leaders" },
    { id: "wallet", icon: Wallet2, label: "Wallet", path: "/wallet" },
  ];

  const activeTab = tabs.find(tab => tab.path === location.pathname)?.id || "home";

  return (
    <div className="app-shell min-h-screen text-neutral-200 font-sans pb-32 overflow-x-hidden selection:bg-brand-500/30">
      
      {/* Impersonation Banner - Rainbow Alert */}
      {isImpersonating && (
        <div className="bg-gradient-to-r from-brand-500 via-brand-600 to-brand-500 text-white px-6 py-2.5 flex justify-between items-center sticky top-0 z-[100] shadow-xl font-black">
          <div className="flex items-center gap-2">
            <Shield size={16} className="animate-pulse" />
            <span className="text-[10px] uppercase tracking-tighter">Prism Override: {user?.username}</span>
          </div>
          <button 
            onClick={handleLogoutImpersonation}
            className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-lg backdrop-blur-md border border-white/20"
          >
            <LogOut size={12} />
            <span className="text-[9px] uppercase">Exit</span>
          </button>
        </div>
      )}

      {/* Header - Glassmorphism Profile */}
      <header className="p-6 flex justify-between items-center bg-[#0c0f13]/90 backdrop-blur-xl sticky top-0 z-40 border-b border-white/[0.05]">
        <div className="flex items-center gap-4">
          <div className="relative group">
            {/* Animated Profile Border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 via-brand-500 to-brand-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
            <div className="relative w-12 h-12 rounded-2xl bg-[#171b22] p-0.5 border border-white/10 overflow-hidden">
              <img src={profilePhotoUrl || ""} className="w-full h-full object-cover rounded-[0.9rem]" alt="profile" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#07090c] rounded-full flex items-center justify-center border border-white/10">
                <div className="w-2 h-2 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(255,224,0,1)]" />
            </div>
          </div>
          
       <div className="space-y-1">
  {/* Header: Username and Industrial Account Badge */}
  <div className="flex items-center gap-3">
    <h2 className="font-black text-sm tracking-tighter text-white uppercase   bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
      {user?.username}
    </h2>
    
    <div className="relative flex items-center">

   {/* Mechanical Tooltip - Positioned Below */}
      <AnimatePresence>
        {isTipVisible && (
          <motion.div 
            initial={{ opacity: 0, y: -5, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.9 }}
            className="absolute top-full left-0 mt-3 px-3 py-1.5 bg-[#171b22] border border-neutral-700 text-white text-[8px] font-black rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.8)] z-50 uppercase tracking-[0.2em] whitespace-nowrap"
          >
            {/* Prismatic Top Rail (Mechanical Accent) */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-brand-500 via-brand-500 to-brand-500" />
            
            
            {/* Tooltip Arrow (Industrial Notch - Now at the Top) */}
            <div className="absolute bottom-[95%] left-2 w-2 h-2 bg-[#171b22] border-l border-t border-neutral-700 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>

  {/* Footer: ID and Copy Action */}
  <div className="flex items-center gap-2.5">
    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/40 border border-neutral-800 rounded-md">
      <span className="text-[8px] font-black text-neutral-600 tracking-[0.1em] uppercase">UID</span>
      <span className="text-[9px] font-black text-neutral-400 tracking-widest uppercase tabular-nums">
        {user?.id}
      </span>
    </div>
    
    <button 
      onClick={handleCopy} 
      className="p-1.5 rounded-lg bg-neutral-900/50 border border-neutral-800 hover:border-brand-500/50 group transition-all active:scale-90"
    >
      {copied ? (
        <CopyCheck size={10} className="text-brand-400 shadow-[0_0_8px_rgba(255,224,0,0.4)]" />
      ) : (
        <Copy size={10} className="text-neutral-600 group-hover:text-neutral-300" />
      )}
    </button>
  </div>
</div>
        </div>

        {user?.role === 'admin' ? (
          <button 
            onClick={() => navigate("/admin/users")} 
            className="p-2.5 bg-white/5 text-white rounded-2xl border border-white/10 hover:border-brand-500/50 transition-all shadow-lg"
          >
            <LayoutDashboard size={18} className="text-brand-400" />
          </button>
        ) : (
          <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse shadow-[0_0_8px_rgba(255,224,0,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Online</span>
          </div>
        )}
      </header>

    
       {/* Partner Identity Badge */}
      {config?.maintain === true && (
        <div className="mx-6 mb-4 px-4 py-2 bg-gradient-to-r from-brand-500/10 to-transparent border-l-2 border-brand-500 rounded-r-xl flex items-center gap-2">
           <AlertTriangle size={40} className="text-brand-400" />
           <span className="text-[13px] font-black  text-red-400 ml-2">{config?.maintain_message} </span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="relative z-10">
        <Outlet />
      </main>

      {/* Floating Rainbow Navigation */}
 <nav className="fixed bottom-0 left-0 right-0 bg-[#171b22]/90 backdrop-blur-2xl border-t border-white/[0.08] px-6 pt-3 pb-8 z-50 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
  <div className="max-w-md mx-auto flex justify-between items-center">

    {tabs?.map((tab) => {
      const isActive = activeTab === tab.id;

      return (
        <button
          key={tab.id}
          onClick={() => navigate(tab.path)}
          className="relative flex flex-col items-center"
        >

          {/* TOP INDICATOR */}
          {isActive && (
            <motion.div
              layoutId="nav-indicator"
              className="absolute -top-3 w-10 h-1 bg-gradient-to-r from-brand-500 via-brand-500 to-brand-500 rounded-full shadow-[0_0_15px_rgba(255,224,0,0.5)]"
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30
              }}
            />
          )}

          {/* ICON */}
          <motion.div
            whileTap={{ scale: 0.92 }}
            animate={{
              scale: isActive ? 1.2 : 1,
              y: isActive ? -2 : 0
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 18
            }}
            className={`
              p-2 rounded-2xl border
              transition-colors duration-200
              ${
                isActive
                  ? "bg-gradient-to-br from-brand-500/15 to-brand-500/5 border-brand-500/25"
                  : "bg-transparent border-transparent"
              }
            `}
          >
            <tab.icon
              size={20}
              strokeWidth={isActive ? 2.5 : 2}
              className={
                isActive
                  ? "text-brand-500 drop-shadow-[0_0_8px_rgba(255,224,0,0.25)]"
                  : "text-neutral-500"
              }
            />
          </motion.div>

          {/* LABEL */}
          <span
            className={`text-[8px] font-black uppercase mt-1.5 transition-colors duration-200 ${
              isActive
                ? "text-brand-500"
                : "text-neutral-500"
            }`}
          >
            {tab.label}
          </span>

        </button>
      );
    })}

  </div>
</nav>

      {/* Global Background Glows */}
      <div className="fixed top-[-15%] left-[-15%] w-[50%] h-[50%] bg-brand-500/[0.03] blur-[150px] pointer-events-none -z-10" />
      <div className="fixed top-[20%] right-[-10%] w-[40%] h-[40%] bg-brand-500/[0.03] blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-500/[0.03] blur-[150px] pointer-events-none -z-10" />
    </div>
  );
};

export default Layout;
