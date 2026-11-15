import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, Task, Friend, Withdrawal, LeaderboardData, Transaction } from "../types";
import confetti from "canvas-confetti";
import WebApp from '@twa-dev/sdk'
import { decodeURIToJSON } from "../helper/utility";
import { response } from "express";
import { Coins } from "lucide-react";

interface AppConfig {
  twitter: any;
  milestoneAchievements: any;
  tierAchievements:any;
  referralAchievements:any;
  telegramChannel:any;
  miningPlans:any;
  rankPlans:any;
  friends_commission_percentage_coin:any;
  friends_commission_percentage_ton:any;
  age_rewards_multiplier:any;
  premium_rewards:any;
  joining_bonus:any;
  referral_joining_bonus:any;
  withdrawal_duration_days:any;
  coinPriceTON:any;
  telegram_bot_link:any;
  staking_monthly_roi:any;
  staking_duration_days:any;
  coin_ticker:any;
  coinPriceNextTON:any;
  website:any;
  withdrawtimes:any;
  maintain:boolean;
  maintain_message:string;


}
interface Stake {
  _id: string;
  amount: number;
  roi: number;
  timestamp: string;
  status: string;
}

interface AppContextType {
  user: User | null;
  profilePhotoUrl:string | null;
  tasks: Task[];
  friends: Friend[];
  withdrawals: Withdrawal[];
  transactions: Transaction[];
  leaderboard: LeaderboardData;
  setLeaderboard: React.Dispatch<React.SetStateAction<LeaderboardData>>;
  initUser: () => Promise<void>;
  handleCheckin: () => Promise<void>;
  handleTaskComplete: (taskId: string) => Promise<void>;
  executeTaskCompletion: (taskId: string,hash:string,amount:number,walletAddress:string) => Promise<void>;
  startMining: () => Promise<void>;
  claimMining: () => Promise<void>;
  claimStake: (stakeId:string) =>Promise<void>;
  boostMining: (multiplier: number,hash:string,walletAddress:string) => Promise<void>;
  boostRank: (visaAmount: number, tonAmount: number,hash:string,walletAddress:string) => Promise<void>;
  handleWithdraw: (amount: number) => Promise<void>;
  fetchLeaderboard: (userId?: string) => Promise<void>;
  fetchWithdrawals: (userId: string) => Promise<void>;
  selectExchange: (exchange: string) => Promise<void>;
  banUser: (targetUserId: string, isBanned: boolean) => Promise<void>;
  changeUserRole: (targetUserId: string, role: 'user' | 'admin') => Promise<void>;
  claimReferralAchievement: (target: number) => Promise<void>;
  claimTierAchievement: (tier: string) => Promise<void>;
  claimMilestoneAchievement: (target: number) => Promise<void>;
  loginAs: (userId: string) => void;
  logoutImpersonation: () => void;
  updateWallet: (walletAddress:string) => void;
  isImpersonating: boolean;
  showCelebration: boolean;
  celebrationContent: { title: string; message: string, amount: number };
  setShowCelebration: (show: boolean) => void;
  showBoostSheet: boolean;
  setShowBoostSheet: (show: boolean) => void;
  boostType: 'mining' | 'rank';
  setBoostType: (type: 'mining' | 'rank') => void;
  showCheckinModal: boolean;
  setShowCheckinModal: (show: boolean) => void;
  showTonTaskModal: string | null;
  setShowTonTaskModal: (taskId: string | null) => void;
  isProcessingTon: boolean;
  setIsProcessingTon: (processing: boolean) => void;
  setAdminToken: string | null;
  isLoading: boolean;
  setIsLoading: (status: boolean) => void;
  config: AppConfig | null;
  fetchConfig: () => Promise<void>;
  stakingHistory: Stake[];
  welcomeSlider: boolean;
  setWelcomeSlider: (value: boolean) => void;
  isBanned: boolean;
  disableWelcomeSlider: () => void;
  adminToken: string | null;
  initdata: string | null;
  checkChatMember: (userId: string) => Promise<boolean>;
  handleWithdrawPartner: (amount: number) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>({ totalLeaders: [], miningLeaders: [], totalRank: 0, miningRank: 0 });
  
  const [showBoostSheet, setShowBoostSheet] = useState(false);
  const [boostType, setBoostType] = useState<'mining' | 'rank'>('mining');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationContent, setCelebrationContent] = useState({ title: "SUCCESS!", message: "Action completed successfully" ,amount:0});
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showTonTaskModal, setShowTonTaskModal] = useState<string | null>(null);
  const [isProcessingTon, setIsProcessingTon] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const isInitializing = React.useRef(false);
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [isBanned, setIsBanned] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [stakingHistory, setStakingHistory] = useState<Stake[]>([]);
  const [welcomeSlider, setWelcomeSlider] = useState(false);

  const getHeaders = () => {
    const headers: any = { "Content-Type": "application/json" };
    if (initdata) {
      headers["x-telegram-init-data"] = initdata;
    }
    if (adminToken) {
      headers["Authorization"] = `Bearer ${adminToken}`;
    }
    return headers;
  };

  const [impersonatedId, setImpersonatedId] = useState<string | null>(() => {
    try {
      const id = localStorage.getItem('impersonatedId');
      if (id === "null" || id === "undefined") return null;
      return id;
    } catch (e) {
      return null;
    }
  });


  // let telegramUser = WebApp.initDataUnsafe?.user;
  let initdata = WebApp.initData;

  // let telegramUser = decodeURIToJSON(initdata).user;
  //initdata = 'query_id=AAERwXNFAAAAABHBc0V4mIil&user=%7B%22id%22%3A1165213969%2C%22first_name%22%3A%22Inayat%22%2C%22last_name%22%3A%22Hussain%22%2C%22username%22%3A%22itsinayat%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FiUHZ1sh1sknoFZhs4q0_ghxTbhp20EoHjiMZgn5MiTQ.svg%22%7D&auth_date=1788348362&signature=pnP3OnZEuG4Nv25enV6-B_-96w8OMAnWJbOzc803vfSv9HM5IgysfwN89W1Krq4jP9PRIHddc9xTKgibysxpAA&hash=c81c20b560b9c1b2c660e8993e83850eee4538f0ba32d8828598c7528f6bd8fb'
  initdata ='query_id=AAERwXNFAAAAABHBc0W8BgeO&user=%7B%22id%22%3A1165213969%2C%22first_name%22%3A%22Inayat%22%2C%22last_name%22%3A%22Hussain%22%2C%22username%22%3A%22itsinayat%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FiUHZ1sh1sknoFZhs4q0_ghxTbhp20EoHjiMZgn5MiTQ.svg%22%7D&auth_date=1794749499&signature=D98AUJM5GtSXIHJg9zPV7a48GkidSh5slBXZnBMclhE4tQxsmcplbUovB24EHkM4x-s4arnAqNssQdvbFdo_AA&hash=411cac8bb361c70a8eca96843d7959b3e662629e5cf75ff545a0de03196d9e32';
  useEffect(() => {
  WebApp.expand();
  WebApp.setHeaderColor("#030515");
  WebApp.disableVerticalSwipes();
  WebApp.HapticFeedback.impactOccurred('light');
}, []);




  // const tgUser = { id: telegramUser.id, username: telegramUser.username, ageDays: 365 };

  const fetchTasks = async (userId: string) => {
    const res = await fetch(`/api/tasks?userId=${userId}`, {headers: getHeaders()});
    const t = await res.json();
    setTasks(t);
  };

  const fetchFriends = async (userId: string) => {
    const res = await fetch(`/api/friends?userId=${userId}`,  {headers: getHeaders()});
    setFriends(await res.json());
  };

  const fetchLeaderboard = useCallback(async (userId?: string) => {
    const id = userId || user?.id;
    if (!id) return;
    const res = await fetch(`/api/leaderboard?userId=${id}`,  {headers: getHeaders()});
    const data = await res.json();
    setLeaderboard(prev => ({ ...prev, ...data }));
  }, [user?.id]);

  const fetchWithdrawals = async (userId: string) => {
    const res = await fetch(`/api/user/withdrawals?userId=${userId}`,  {headers: getHeaders()});
    setWithdrawals(await res.json());
  };

  const fetchTransactions = async (userId: string) => {
    const res = await fetch(`/api/user/transactions?userId=${userId}`,  {headers: getHeaders()});
    setTransactions(await res.json());
  };


const initUser = useCallback(async (force = false) => {
  console.log("initializing user",localStorage.getItem('user'))
  if(adminToken && !impersonatedId) return;
  if (!force && isInitializing.current) return;
    isInitializing.current = true;
  try {
        console.log("initdata","initdata")
    if(!initdata) return;

    const telegramUser = decodeURIToJSON(initdata)?.user;
    console.log(telegramUser)

    const res = await fetch("/api/user/init", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({})
    });
    
    if (res.ok) {
      const data = await res.json();
   
      
      // Update these only if they've actually changed to prevent render loops
      setProfilePhotoUrl(telegramUser.photo_url);

      setUser(data);

      // Consolidate these into a single "fetchAllData" if possible
      fetchTasks(data.id);
      fetchFriends(data.id);
      fetchLeaderboard(data.id);
      fetchWithdrawals(data.id);
      fetchTransactions(data.id);
      fetchStakingHistory();
      setWelcomeSlider(data.welcomeSlider);
    }else if (res.status ==403){
       setIsBanned(true)
    }
  } catch (error) {
    console.error("initUser error:", error);
   
  }finally{
    setIsLoading(false)
  }
}, [fetchLeaderboard]);


const fetchConfig = useCallback(async () => {
  try {

    setIsLoading(true);
    const res = await fetch("/api/loadConfig");
    const data = await res.json();
    setConfig(data);
  } catch (err) {
    console.error("Config fetch error:", err);
  } finally {
    setIsLoading(false);
  }
}, []);

useEffect(() => {
  if (!config || Object.keys(config).length === 0) {
    fetchConfig();
  }
}, [config, fetchConfig]);


useEffect(() => {
  initUser();
}, []); 

const handleCheckin = async () => {
  if (!user) return;

  try {
    const res = await fetch("/api/user/checkin", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ userId: user.id })
    });

    const data = await res.json();

    if (res.ok) {
      // Refresh user data (balance, etc.)
      initUser(true);

      // Set Popup Content
      setCelebrationContent({
        title: data.isReset ? "STREAK RESET ⚠️" : "DAILY CHECK-IN! 🎉", 
        message: data.message,
        amount:data.reward
      });

      setShowCelebration(true);

      // Trigger visual effects
      confetti({
        particleCount: data.isReset ? 50 : 150, // Less confetti for a reset
        spread: 70,
        origin: { y: 0.6 },
        colors: data.isReset ? ['#ff4444', '#ffffff'] : ['#2563eb', '#3b82f6', '#ffffff']
      });

      // Close celebration after 3 seconds
      setTimeout(() => setShowCelebration(false), 5000);

    } else {
      // Handle "Already checked in" or other errors
      alert(data.error || "Check-in failed");
    }
  } catch (err) {
    console.error("Fetch error:", err);
    alert("Network error, please try again.");
  }
};

  const executeTaskCompletion = async (taskId: string,hash:string,amount:number,walletAddress:string) => {
    console.log("taskId",taskId);
    console.log("amount",amount);

    if (!user) return;
    const res = await fetch("/api/tasks/complete", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({taskId, hash, amount, walletAddress })
    });
    if (res.ok) {
       const data = await res.json();
      initUser(true);
      setCelebrationContent({ 
        title: "TASK COMPLETED!", 
        message: "Your reward has been added to your balance!" ,
        amount:data.reward
      });
      setShowCelebration(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#ffffff', '#fbbf24']
      });
      setTimeout(() => setShowCelebration(false), 5000);
    } else {
      const data = await res.json();
      alert(data.error || "Failed to complete task");
    }
  };

  const handleTaskComplete = async (task: any) => { 
    if (!user) return;
    const tsk = tasks.find(t => t.id === task.id);
    if (tsk?.type=="ton") {
      setShowTonTaskModal(task);
      return;
    }
    await executeTaskCompletion(task.id,"",0,"");
  };

  const startMining = async () => {
    if (!user) return;
    await fetch("/api/mining/start", {
      method: "POST",
      headers: {"x-telegram-init-data":initdata},
      body: JSON.stringify({ userId: user.id })
    });
    initUser(true);
  };

  const claimMining = async () => {
    try{
    setIsLoading(true);
    if (!user) return;
    const res = await fetch("/api/mining/claim", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ userId: user.id })
    });
    const data = await res.json();
    setCelebrationContent({ 
      title: "MINING CLAIMED!", 
      message: `Successfully claimed ${data.earned.toFixed(2)} ${config?.coin_ticker}!` ,
      amount:data.earned
    });
    setShowCelebration(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#ffffff', '#fbbf24']
    });
    setTimeout(() => setShowCelebration(false), 5000);
    initUser(true);
  }catch(e){
    console.log(e)
  }finally{
      setIsLoading(false);
  }
    
  };


    const updateWallet = async (walletAddress: string) => {
    if (!user) return;
     await fetch("/api/user/updateWallet", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ userId: user.id, walletAddress: walletAddress })
    });
  };

   const disableWelcomeSlider = async () => {
    if (!user) return;
     await fetch("/api/user/disableWelcomeSlider", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ userId: user.id})
    });
    setWelcomeSlider(false);
  };


  

  const boostMining = async (multiplier: number,hash:string,walletAddress:string) => {
    if (!user) return;
    await fetch("/api/mining/boost", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ userId: user.id, multiplier,hash,walletAddress })
    });
    setShowBoostSheet(false);
    setCelebrationContent({ 
      title: "MINING BOOSTED!", 
      message: `Your mining speed is now ${multiplier}x faster!` ,
      amount:0
    });
    setShowCelebration(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#ffffff', '#fbbf24']
    });
    setTimeout(() => setShowCelebration(false), 5000);
    initUser(true);
  };

  const boostRank = async (visaAmount: number, tonAmount: number,hash:string,walletAddress:string) => {
    if (!user) return;
    await fetch("/api/user/boost-rank", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ userId: user.id, visaAmount, tonAmount,hash ,walletAddress})
    });
    setShowBoostSheet(false);
    setCelebrationContent({ 
      title: "RANK BOOSTED!", 
      message: `Successfully added ${visaAmount.toLocaleString()} ${config?.coin_ticker} to your balance!`,
      amount:0
    });
    setShowCelebration(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#ffffff', '#fbbf24']
    });
    setTimeout(() => setShowCelebration(false), 5000);
    initUser(true);
    fetchLeaderboard();
  };

  const handleWithdraw = async (amountTon: number) => {
    if (!user) return;
    setIsLoading(true)

    const res = await fetch("/api/user/withdraw", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ userId: user.id, amountTon: amountTon })
    });
    
    if (res.ok) {
      setCelebrationContent({ 
        title: "WITHDRAWAL SENT!", 
        message: "Your request is pending and will be processed soon.",
        amount: 0
      });
      setShowCelebration(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#ffffff', '#fbbf24']
      });
      setTimeout(() => setShowCelebration(false), 5000);
      initUser(true);
      fetchWithdrawals(user.id);
      fetchTransactions(user.id);
    } else {
      const data = await res.json();
      alert(data.error || "Withdrawal failed");
    }
    setIsLoading(false)
  };


  const handleWithdrawPartner = async (amount: number) => {
    if (!user) return;
    setIsLoading(true)
    try{
    const res = await fetch("/api/user/withdrawPartner", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ userId: user.id, amount: amount })
    });
    
    if (res.ok) {
      setCelebrationContent({ 
        title: "WITHDRAWAL SENT!", 
        message: "Your request is pending and will be processed soon." ,
        amount: amount
      });
      setShowCelebration(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#ffffff', '#fbbf24']
      });
      setTimeout(() => setShowCelebration(false), 5000);
      initUser(true);
      fetchWithdrawals(user.id);
      fetchTransactions(user.id);
    } else {
      if(res){
 const data = await res.json();
      alert(data.error || "Withdrawal failed");
      }else{
alert("Withdrawal failed");
      }
      
     
    }
  }catch(e){
    console.log(e)
  }finally{
      setIsLoading(false)
  }
  
  };


  

  const selectExchange = async (exchange: string) => {
    if (!user) return;
    const res = await fetch("/api/user/select-exchange", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ userId: user.id, exchange })
    });
    if (res.ok) {
      initUser(true);
    }
  };

  const banUser = async (targetUserId: string, isBanned: boolean) => {
    console.log("targetUserId",targetUserId)
    const res = await fetch("/api/admin/users/ban", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ targetUserId, isBanned })
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to ban/unban user");
    }
  };

    const changeAccountType = async (targetUserId: string, accountType: string) => {
    const res = await fetch("/api/admin/users/changeAccountType", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ targetUserId, accountType })
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to ban/unban user");
    }
  };

  

  const changeUserRole = async (targetUserId: string, role: 'user' | 'admin') => {
    const res = await fetch("/api/admin/users/role", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ targetUserId, role })
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to change user role");
    }
  };

  const claimReferralAchievement = async (target: number) => {
    if (!user) return;
    const res = await fetch("/api/achievements/claim-referral", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ userId: user.id, target })
    });
    if (res.ok) {
      const data = await res.json();
      initUser(true);
      setCelebrationContent({
        title: "ACHIEVEMENT UNLOCKED!", 
        message: `You've claimed ${data.reward.toLocaleString()} ${config?.coin_ticker} for ${target} referrals!`,
        amount:data.reward
      });
      setShowCelebration(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#ffffff', '#fbbf24']
      });
      setTimeout(() => setShowCelebration(false), 5000);
    } else {
      const data = await res.json();
      alert(data.error || "Failed to claim reward");
    }
  };

  const claimTierAchievement = async (tier: string) => {
    if (!user) return;
    const res = await fetch("/api/achievements/claim-tier", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ userId: user.id, tier })
    });
    if (res.ok) {
      const data = await res.json();
      initUser(true);
      setCelebrationContent({ 
        title: "TIER REACHED!", 
        message: `You've claimed ${data.reward.toLocaleString()} ${config?.coin_ticker} for reaching ${tier} tier!`,
        amount: data.reward
      });
      setShowCelebration(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#ffffff', '#fbbf24']
      });
      setTimeout(() => setShowCelebration(false), 5000);
    } else {
      const data = await res.json();
      alert(data.error || "Failed to claim reward");
    }
  };

  const loginAs = async(userId: string) => {
    console.log("Logging as ",userId)
    try {
      localStorage.setItem('impersonatedId', userId);
    } catch (e) {
      console.error("Failed to set impersonatedId in localStorage", e);
    }

    const res = await fetch("/api/admin/loginAs", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ userId: userId})
    });
    const data = await res.json()
    setUser(data);
    setImpersonatedId(data);
  };


  const claimMilestoneAchievement = async (target: number) => {
    if (!user) return;
    const res = await fetch("/api/achievements/claim-milestone", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ userId: user.id, target })
    });
    if (res.ok) {
      const data = await res.json();
      initUser();
      setCelebrationContent({ 
        title: "MILESTONE REACHED!", 
        message: `You've claimed ${data.reward.toLocaleString()} ${config?.coin_ticker} for reaching ${target.toLocaleString()} balance!`,
        amount:data.reward
      });
      setShowCelebration(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#ffffff', '#fbbf24']
      });
      setTimeout(() => setShowCelebration(false), 3000);
      initUser(true);
    } else {
      const data = await res.json();
      alert(data.error || "Failed to claim reward");
    }
  };



const checkChatMember = async (telegramId:string) => {
  try {
    const url = `/api/user/getChatMember?user_id=${telegramId}`;

    const response = await fetch(url, {
      method: "POST", 
        headers: getHeaders(),
    });

    const result = await response.json();
    console.log(result)

    if (!response.ok) {
      throw new Error(result.error || "Failed to fetch chat member status");
    }
    return result.data;
  } catch (error) {
    console.error("Error checking chat member:", error);
    return null;
  }
};
  

  const logoutImpersonation = () => {
    try {
      localStorage.removeItem('impersonatedId');
    } catch (e) {
      console.error("Failed to remove impersonatedId from localStorage", e);
    }
    setImpersonatedId(null);
  };


  const adminLogin = async (username: string, password: string) => {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      const data = await res.json();
      setAdminToken(data.token);
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('user', data.user);
      window.location.href = "/admin"
    } else {
      const data = await res.json();
      throw new Error(data.error || "Login failed");
    }
  };

  const adminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('adminToken');
    setImpersonatedId(null);
    localStorage.removeItem('impersonatedId');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = "/login"
  };


  const loadAdmin = ()=> {
    if(initdata) return;
  }

  useEffect(() => {
  loadAdmin();
}, []); 




/**
   * 1. Fetch Staking History (Separate Model)
   */
  const fetchStakingHistory = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/stake/history?userId=${user.id}`, {
        method: "GET",
        headers: getHeaders(),
      });
      const data = await response.json();
      setStakingHistory(data);
    } catch (error) {
      console.error("Error fetching staking history:", error);
    }
  };

  /**
   * 2. Handle New Stake Deployment
   */
  const handleStake = async (amount: number): Promise<boolean> => {
    if (!user) return false;
    setIsLoading(true);
    try {
      const response = await fetch("/api/stake/new", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ userId: user.id, amount }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update user balance globally
        setUser((prev: any) => ({ ...prev, total_balance: data.newBalance }));
        // Add new stake to the top of the history list immediately
        setStakingHistory((prev) => [data.newStake, ...prev]);
        

        setCelebrationContent({ 
        title: "STAKING STARTED!", 
        message: "Congratulation! Your Staking has been started .",
        amount:amount
      });
      setShowCelebration(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#ffffff', '#fbbf24']
      });
      setTimeout(() => setShowCelebration(false), 5000);






        return true;
      }
      return false;
    } catch (error) {
      console.error("Staking error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };



  const claimStake = async (stakeId: string) => {
    try {
      setIsLoading(true);
      if (!user) return;

      const res = await fetch("/api/stake/claim", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ 
          stakeId: stakeId 
        })
      });

      const data = await res.json();

      if (data.success) {
        // Set content for your success modal
        setCelebrationContent({ 
          title: "STAKE RELEASED!", 
          message: `Successfully claimed ${parseFloat(data.payout).toFixed(4)} GRAM back to your balance!`,
          amount:Number(data.payout)
        });
        
        setShowCelebration(true);

        // Rainbow Confetti to match the Prism Theme
        confetti({
          particleCount: 200,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
        });

        // Auto-hide celebration and refresh data
        setTimeout(() => setShowCelebration(false), 5000);
        
        // Refresh user data and staking list
        initUser(true); 
        fetchStakingHistory(); 
      } else {
        console.error("Claim failed:", data.message);
      }
    } catch (e) {
      console.log("Error claiming stake:", e);
    } finally {
      setIsLoading(false); // Fixed: should be false in finally
    }
  };


  return (
    <AppContext.Provider value={{
      user,config,profilePhotoUrl, tasks, friends, withdrawals, leaderboard, setLeaderboard,isBanned,handleWithdrawPartner,
      initUser, handleCheckin, handleTaskComplete, executeTaskCompletion,changeAccountType,
      startMining, claimMining, boostMining, boostRank, handleWithdraw,
      fetchLeaderboard, fetchWithdrawals, selectExchange, banUser, changeUserRole,
      claimReferralAchievement, claimTierAchievement,
      loginAs, logoutImpersonation,updateWallet,disableWelcomeSlider,checkChatMember,claimMilestoneAchievement, isImpersonating: !!impersonatedId,
      transactions,initdata,adminLogin,adminToken,adminLogout,
      showCelebration, celebrationContent, setShowCelebration,
      showBoostSheet, setShowBoostSheet, boostType, setBoostType,
      showCheckinModal, setShowCheckinModal,
      showTonTaskModal, setShowTonTaskModal,
      isProcessingTon, setIsProcessingTon,setIsLoading,isLoading,stakingHistory,
        fetchStakingHistory,
        handleStake,claimStake,
        welcomeSlider,setWelcomeSlider
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
