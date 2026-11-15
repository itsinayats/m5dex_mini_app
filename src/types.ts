import { LucideIcon } from "lucide-react";

export interface User {
  id: string;
  username: string;
  total_balance: number;
  mining_balance: number;
  task_balance: number;
  referral_balance: number;
  checkin_balance: number;
  age_reward: number;
  mining_speed: number;
  last_checkin: string | null;
  checkin_streak: number;
  mining_started_at: string | null;
  referred_by: string | null;
  last_withdrawal_at: string | null;
  tontaskamount: number;
  totalrankboostamount: number;
  friends_ton_tasks_total: number;
  friends_boost_rank_total: number;
  card_number?: string;
  role: 'user' | 'admin';
  is_banned: boolean;
  selected_exchange: string | null;
  ton_transaction_completed: boolean;
  referral_count: number;
  claimed_referral_achievements: number[];
  claimed_tier_achievements: string[];
  claimed_milestone_achievements: number[];
  created_at?: string;
  seasonOneBalance?:number
  partner_balance:  number;
  partner_withdrawn: number;
  partner_withdrawn_ton: number;  
}

export interface Task {
  id: string;
  title: string;
  reward: number;
  completed_at: number | null;
  type: 'youtube' | 'twitter' | 'telegram' | 'ton' | 'instagram' | 'external' | 'referral';
}

export interface Friend {
  id: string;
  username: string;
  total_balance: number;
}

export interface Withdrawal {
  _id: string;
  user_id: string;
  username: string;
  amount_visa: number;
  amount_ton: number;
  status: 'pending' | 'approved' | 'rejected';
  hash?: string;
  created_at: string;
}

export interface Transaction {
  _id: string;
  user_id: string;
  username?: string;
  type: 'withdrawal' | 'ton_task' | 'boost_rank' | 'checkin' | 'mining' | 'task' | 'age_reward' | 'mining_boost' | 'referral_commission' | 'referral_reward' | 'joining_bonus' | 'mining_boost' | 'withdrawal_partner' ;
  amount_visa: number;
  amount_ton: number;
  status: 'pending' | 'completed' | 'rejected';
  description: string;
  hash?: string;
  created_at: string;
}

export interface LeaderboardData {
  totalLeaders: any[];
  miningLeaders: any[];
  totalRank: number;
  miningRank: number;
  current?: string;
}

export interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
  path: string;
}


