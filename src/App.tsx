import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Mining from "./pages/Mining";
import Friends from "./pages/Friends";
import Leaders from "./pages/Leaders";
import Wallet from "./pages/Wallet";
import Withdrawal from "./pages/Withdrawal";
import WithdrawalPartner from "./pages/WithdrawalPartner";

import AdminWithdrawal from "./pages/AdminWithdrawal";
import AdminUsers from "./pages/AdminUsers";
import AdminTransactions from "./pages/AdminTransactions";
import AdminFakeWithdrawal from "./pages/AdminFakeWithdrawal";
import AdminVerifyWithdrawal from "./pages/AdminVerifyWithdrawal";
import AdminChannelPosts from "./pages/AdminChannelPosts";

import AdminDashboard from "./pages/AdminDashboard";
import CelebrationOverlay from "./components/CelebrationOverlay";
import { useAppContext } from "./context/AppContext";
import AdminLogin from "./components/AdminLogin";
import Tasks from "./pages/Tasks";
import AdminConfiguration from "./pages/AdminConfiguration";
import AdminTaskSetup from "./pages/AdminTaskSetup";
import StakingProtocol from "./pages/StakingProtocol.tsx"
import WelcomeSlider from "./components/WelcomeSlider";
import WithdrawGram from "./pages/WithdrawGram";

const BannedScreen = () => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center space-y-6">
    <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center border border-red-500/20">
      <div className="text-red-500 text-6xl font-black">!</div>
    </div>
    <div className="space-y-2">
      <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Access Denied</h1>
      <p className="text-neutral-400 text-sm max-w-xs">Your account has been permanently banned for violating our terms of service.</p>
    </div>
    <div className="pt-4">
      <p className="text-[10px] text-neutral-600 uppercase font-black tracking-widest">Contact support if you believe this is a mistake.</p>
    </div>
  </div>
);

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

function AppContent() {
  const { isBanned,welcomeSlider,disableWelcomeSlider } = useAppContext();

  if (isBanned) return <BannedScreen />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="mine" element={<Mining />} />
          <Route path="friends" element={<Friends />} />
          <Route path="leaders" element={<Leaders />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="withdrawal" element={<Withdrawal />} />
           <Route path="tasks" element={<Tasks />} />
          <Route path="partnerWithdrawal" element={<WithdrawalPartner />} />
          <Route path="staking" element={<StakingProtocol />} />
          <Route path="withdraw" element={<WithdrawGram />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/login" element={<AdminLogin />}></Route>
        <Route path="/admin" element={<AdminDashboard />}>
          <Route path="withdrawal" element={<AdminWithdrawal />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="fakewithdrawal" element={<AdminFakeWithdrawal />} />
          <Route path="verifywithdrawal" element={<AdminVerifyWithdrawal />} />
          <Route path="configuration" element={<AdminConfiguration />} />
          <Route path="tasksetup" element={<AdminTaskSetup />} />
          <Route path="channelposts" element={<AdminChannelPosts />} />
          
          
        </Route>
      </Routes>
      <CelebrationOverlay />
       { welcomeSlider && <WelcomeSlider  onComplete={() => {
          disableWelcomeSlider();
  }} /> }
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </BrowserRouter>
  );
}
