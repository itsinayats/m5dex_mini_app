import express from "express";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import dotenv, { config } from "dotenv";
import crypto from "crypto";
import axios from "axios"
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Cell } from '@ton/core';
import cors from 'cors';
import { sendMessage, sendMessage1,sendMessage2 } from "./src/helper/TelegramBot";
import fs from "fs";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
});


dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONGODB_URI = process.env.MONGODB_URI
  const SERVER_PORT = Number(process.env.PORT)
  const CHAT_ID = process.env.VITE_CHAT_ID
  const MAINTAIN = process.env.MAINTAINANCE
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const apiUrl = `https://api.telegram.org/bot${botToken}/`;
  const APP_URL = process.env.APP_URL
  const APP_NAME = process.env.APP_NAME

  
  

  const JWT_SECRET = process.env.JWT_SECRET

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // Don't exit, let the app try to run or fail gracefully on requests
  }
};

// =====================================================
// GLOBAL ERROR HANDLERS
// =====================================================

// Catch synchronous exceptions that were not handled
process.on("uncaughtException", (error) => {
  console.error("=================================");
  console.error("UNCAUGHT EXCEPTION");
  console.error("=================================");
  console.error(error?.stack || error);
  console.error("=================================");

  writeLog(
    error?.stack || String(error),
    "UNCAUGHT_EXCEPTION"
  );

  // IMPORTANT:
  // Do NOT process.exit() here if your requirement
  // is to keep the server alive.
});


// Catch rejected promises that were not handled
process.on(
  "unhandledRejection",
  (reason, promise) => {
    console.error("=================================");
    console.error("UNHANDLED REJECTION");
    console.error("=================================");
    console.error(reason);
    console.error("=================================");

    writeLog(
      reason?.stack ||
        String(reason),
      "UNHANDLED_REJECTION"
    );
  }
);

// Schemas
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  fullName: { type: String},
  username: { type: String, sparse: true },
  firstName: { type: String},
  lastName: { type: String},
  total_balance: { type: Number, default: 0 },
  mining_balance: { type: Number, default: 0 },
  task_balance: { type: Number, default: 0 },
  total_withdrawal: { type: Number, default: 0 },
  referral_balance: { type: Number, default: 0 },
  checkin_balance: { type: Number, default: 0 },
  age_reward: { type: Number, default: 0 },
  mining_speed: { type: Number, default: 100 },
  last_checkin: Date,
  checkin_streak: { type: Number, default: 0 },
  mining_started_at: Date,
  mining_claimed_at: Date,
  last_withdrawal_at: Date,
  last_partner_withdrawal_at:Date,
  tontaskamount: { type: Number, default: 0 },
  totalrankboostamount: { type: Number, default: 0 },
  totalminingboostamount: { type: Number, default: 0 },
  friends_ton_tasks_total: { type: Number, default: 0 },
  friends_boost_rank_total: { type: Number, default: 0 },
  friends_boost_mining_total: { type: Number, default: 0 },
  referred_by: String, // referrer's id
  card_number: String, // format: 4532 **** 89
  role: { type: String, enum: ["user", "admin"], default: "user" },
  is_banned: { type: Boolean, default: false },
  welcomeUser: { type: Boolean, default: true },
  welcomeSlider: { type: Boolean, default: true },
  isPremium: { type: Boolean, default: false },
  premiumReward: { type: Number, default: 0 },
  joining_bonus: { type: Number, default: 0 },
  selected_exchange: { type: String, default: null },
  ton_transaction_completed: { type: Boolean, default: false },
  referral_count: { type: Number, default: 0 },
  claimed_referral_achievements: { type: [Number], default: [] },
  claimed_tier_achievements: { type: [String], default: [] },
  claimed_milestone_achievements: { type: [Number], default: [] },
  created_at: { type: Date, default: Date.now },
  walletAddress:{ type: String, default: null },
  allWallets: { type: [String], default: [] },
  password: { type: String },
  seasonOneBalance:{ type: Number, default: 0 },
  partner_balance:{ type: Number, default: 0 },
  total_deposit:{ type: Number, default: 0 },
  accountType:{
    type: String,
    enum: ["PARTNER", "USER"],
    default: "USER",
  },
});

const taskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  reward: Number,
  link:String,
  ton_price: { type: Number, default: 0 },
  type: String,
  chat_id: String,
  referral_count:Number
});

const userTaskSchema = new mongoose.Schema({
  user_id: String,
  task_id: String,
  completed_at: { type: Number, default: Date.now },
});


const StakeSchema = new mongoose.Schema({
  userId: { 
    type: String,
    required: true, 
    index: true 
  },
  amount: { type: Number, required: true },
  durationDays:{ type: Number, required: true },
  roi: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Completed'], default: 'Active' },
  earnedRoi:{ type: Number },
  lastClaimedAt: { type: Date,default: Date.now },
  claimedAmount: { type: Number, default: 0 },
});

const whitelistSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);


const configSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  { timestamps: true }
);

const withdrawalSchema = new mongoose.Schema({
  user_id: String,
  username: String,
  amount: Number,
  amount_ton: Number,
  walletAddress: String,
  comment:String,
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  wtype: {
    type: String,
    enum: ["REFERRAL", "USER"],
    default: "USER",
  },
  hash: String,
  created_at: { type: Date, default: Date.now },
});

const transactionSchema = new mongoose.Schema({
  user_id: String,
  username: String, // Added for easier searching in admin
  type: {
    type: String,
    enum: [
      "withdrawal",
      "ton_task",
      "boost_rank",
      "checkin",
      "mining",
      "task",
      "age_reward",
      "premium_reward",
      "referral_reward",
      "joining_bonus",
      "mining_boost",
      "withdrawal_partner",
      "referral_commission",
    ],
  },
  amount: Number,
  amount_ton: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["pending", "completed", "rejected"],
    default: "completed",
  },
  description: String,
  hash: String,
  withdrawalId: String,
  walletAddress:String,
  verified:Boolean,
  fromUserId:String,
  created_at: { type: Date, default: Date.now },
});

userTaskSchema.index({ user_id: 1, task_id: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
const Task = mongoose.model("Task", taskSchema);
const UserTask = mongoose.model("UserTask", userTaskSchema);
const WhiteList = mongoose.model("Whitelist", whitelistSchema);
const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);
const Config = mongoose.model("Config", configSchema);
const Stake = mongoose.model("Stake", StakeSchema);



// Seed initial tasks
const seedTasks = async () => {
  const defaultTasks = [
    {
      id: "t1",
      title: "Perform TON Task",
      reward: 5000,
      type: "ton",
      link:"",
      ton_price: 5.0,
    },
    {
      id: "t2",
      title: "Refer 1 Friend",
      reward: 5000,
      type: "referral",
      link:"",
      ton_price: 0,
    },
    {
      id: "t3",
      title: "Follow on Twitter",
      reward: 5000,
      type: "social",
      link:"https://x.com/notycoin",
      ton_price: 0,
    },
    {
      id: "t4",
      title: "Join Telegram Channel",
      reward: 5000,
      type: "channel",
      link:"https://t.me/naughtycoin_channel",
      ton_price: 0,
    },
    { id: "t5",
      title: "Like/Comment/Retweet", 
      reward: 5000, 
      link:"https://x.com/notycoin/status/2024423126805914061",
      type: "social", 
      ton_price: 0 
    },
    { id: "t6",
      title: "Follow NOTY Card on X", 
      reward: 5000, 
      link:"https://x.com/NotyCard",
      type: "social", 
      ton_price: 0 
    },
  ];

  for (const taskData of defaultTasks) {
    await Task.findOneAndUpdate(
      { id: taskData.id },
      { $set: taskData },
      { upsert: true, new: true },
    );
  }
  console.log("Tasks seeded/updated");
};



const seedConfig = async () => {
  const configs = [
    {
  "key": "referralAchievements",
  "value": [
    {
      "target": 1,
      "reward": 5000
    },
    {
      "target": 5,
      "reward": 10000
    },
    {
      "target": 10,
      "reward": 15000
    },
    {
      "target": 20,
      "reward": 20000
    },
    {
      "target": 50,
      "reward": 60000
    },
    {
      "target": 100,
      "reward": 1000000
    }
  ]
},
{
  "key": "tierAchievements",
  "value": [
    {
      "tier": "Silver",
      "target": 50000,
      "reward": 50000
    },
    {
      "tier": "Gold",
      "target": 250000,
      "reward": 250000
    },
    {
      "tier": "Platinum",
      "target": 1000000,
      "reward": 1000000
    },
    {
      "tier": "Diamond",
      "target": 5000000,
      "reward": 5000000
    }
  ]
},
{
  "key": "milestoneAchievements",
  "value": [
    {
      "target": 20000,
      "reward": 2000
    },
    {
      "target": 50000,
      "reward": 5000
    },
    {
      "target": 100000,
      "reward": 10000
    },
    {
      "target": 500000,
      "reward": 50000
    },
    {
      "target": 1000000,
      "reward": 100000
    }
  ]
},
{
  "key": "twitter",
  "value": "https://x.com/tonwonpro"
},
{
  "key": "telegramChannel",
  "value": "https://t.me/tonwon_announcements"
},
{
  "key": "miningPlans",
  "value": [
    {
      "mult": 2,
      "price": "2.0 GRAM",
      "ton": 2,
      "pph": 200,
      "color": "from-pink-500 to-rose-500"
    },
    {
      "mult": 3,
      "price": "2.9 GRAM",
      "ton": 2.9,
      "pph": 300,
      "color": "from-pink-500 to-rose-500"
    },
    {
      "mult": 5,
      "price": "4.0 GRAM",
      "ton": 4,
      "pph": 500,
      "color": "from-purple-500 to-indigo-500"
    },
    {
      "mult": 10,
      "price": "8.0 GRAM",
      "ton": 8,
      "pph": 1000,
      "color": "from-blue-500 to-cyan-500"
    },
    {
      "mult": 15,
      "price": "14.0 GRAM",
      "ton": 14,
      "pph": 1500,
      "color": "from-cyan-500 to-teal-500"
    },
    {
      "mult": 20,
      "price": "30.0 GRAM",
      "ton": 30,
      "pph": 2000,
      "color": "from-emerald-500 to-green-500"
    },
    {
      "mult": 50,
      "price": "50.0 GRAM",
      "ton": 50,
      "pph": 5000,
      "color": "from-yellow-500 to-orange-500"
    },
    {
      "mult": 100,
      "price": "100.0 GRAM",
      "ton": 100,
      "pph": 10000,
      "color": "from-orange-500 to-red-500"
    }
  ]
},
{
  "key": "rankPlans",
  "value": [
    {
      "amount": 1000,
      "price": "20 TON",
      "ton": 20,
      "desc": "Standard Flux"
    },
    {
      "amount": 300000,
      "price": "25 TON",
      "ton": 25,
      "desc": "High Density"
    },
    {
      "amount": 750000,
      "price": "50 TON",
      "ton": 50,
      "desc": "Ultra Refraction"
    },
    {
      "amount": 1800000,
      "price": "100 TON",
      "ton": 100,
      "desc": "Super-Massive"
    },
    {
      "amount": 4750000,
      "price": "250 TON",
      "ton": 250,
      "desc": "Galactic Beam"
    },
    {
      "amount": 6000000,
      "price": "300 TON",
      "ton": 300,
      "desc": "Singularity Point"
    },
    {
      "amount": 10000000,
      "price": "500 TON",
      "ton": 500,
      "desc": "Omniverse Rank"
    }
  ]
},
{
  "key": "friends_commission_percentage_coin",
  "value": 50
},
{
  "key": "age_rewards_multiplier",
  "value": 1000
},
{
  "key": "premium_rewards",
  "value": 5000
},
{
  "key": "joining_bonus",
  "value": 5000
},
{
  "key": "referral_joining_bonus",
  "value": 5000
},
{
  "key": "withdrawal_duration_days",
  "value": 1
},
{
  "key": "coinPriceTON",
  "value": 0.001
},
{
  "key": "telegram_bot_link",
  "value": "https://t.me/tonwonpro_bot"
},
{
  "key": "staking_monthly_roi",
  "value": 11
},
{
  "key": "staking_duration_days",
  "value": 180
},
{
  "key": "coin_ticker",
  "value": "TWON"
},
{
  "key": "coinPriceNextTON",
  "value": 0.005
},
{
  "key": "website",
  "value": "https://tonwon.xyz"
},
{
  "key": "friends_commission_percentage_ton",
  "value": 20
},
{
  "key": "withdrawtimes",
  "value": 2
}]


  for (const config of configs) {
    await Config.updateOne(
      { key: config.key },
      { $set: { value: config.value } },
      { upsert: true }
    );
  }

  console.log("✅ Fully flattened config seeded");
};

// Seed some mock users for leaderboard
const seedUsers = async () => {
  try{
  console.log("seeding user...")
 
    const mockUsers = [
      // { id: "m1", username: "CryptoWhale", total_balance: 1500000, mining_balance: 500000, task_balance: 200000, referral_balance: 800000, referral_code: "WHALE", role: 'user', referral_count: 50, claimed_referral_achievements: [5, 10, 25, 50], claimed_tier_achievements: ["Silver", "Gold"], referred_by:"1165213969" },
      // { id: "m2", username: "TonMaster", total_balance: 1200000, mining_balance: 450000, task_balance: 150000, referral_balance: 600000, referral_code: "MASTER", role: 'user', referral_count: 30, claimed_referral_achievements: [5, 10, 25], claimed_tier_achievements: ["Silver", "Gold"], referred_by:"1165213969" },
      // { id: "m3", username: "VisaKing", total_balance: 950000, mining_balance: 300000, task_balance: 100000, referral_balance: 550000, referral_code: "KING", role: 'user', referral_count: 20, claimed_referral_achievements: [5, 10], claimed_tier_achievements: ["Silver", "Gold"], referred_by:"1165213969" },
      // { id: "m4", username: "EarlyAdopter", total_balance: 800000, mining_balance: 250000, task_balance: 80000, referral_balance: 470000, referral_code: "EARLY", role: 'user', referral_count: 15, claimed_referral_achievements: [5, 10], claimed_tier_achievements: ["Silver"], referred_by:"1165213969" },
      // { id: "m5", username: "MiningPro", total_balance: 750000, mining_balance: 600000, task_balance: 50000, referral_balance: 100000, referral_code: "PRO", role: 'user', referral_count: 5, claimed_referral_achievements: [5], claimed_tier_achievements: ["Silver", "Gold"] , referred_by:"1165213969"},
      //{ id: "inay", username: "ReferralGod", total_balance: 2000000, mining_balance: 100000, task_balance: 100000, referral_balance: 1800000, referral_code: "GOD", role: 'user', referral_count: 150, claimed_referral_achievements: [5, 10, 25, 50, 100], claimed_tier_achievements: ["Silver"], referred_by:"1165213969" },
    ];
    for (const u of mockUsers) {
      await User.findOneAndUpdate({ id: u.id }, { $set: u }, { upsert: true });
    }
}catch(e){
  console.log(e)
}
};



const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', true);
app.use(express.json({
    limit: '8mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString('utf8');
    }
  }));

const ALLOWED_ORIGINS = [
   APP_URL,
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      callback(null, true); // Success: Origin is allowed
    } else {
      callback(new Error('Not allowed by CORS')); // Reject: Origin not in list
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));


// Middleware to check admin role
const isAdmin = async (req: any, res: any, next: any) => {

  const userId = req.adminUser?.id || req.telegramUser?.id?.toString() || req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  
  const user = await User.findOne({ id: userId });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
  next();
};





// Middleware to authenticate Admin JWT (for desktop panel)
const authenticateAdminJWT = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.adminUser = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// Combined middleware for admin routes (supports JWT or Telegram)
const authenticateAdmin = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authenticateAdminJWT(req, res, next);
  }
};


const ALLOWED_IPS = ['127.0.0.1'];

const verifyIP = (req: any, res: any, next: any) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(clientIp)

  const ipToCheck = Array.isArray(clientIp)
    ? clientIp[0] 
    : clientIp?.split(',')[0].trim();

  if (ALLOWED_IPS.includes(ipToCheck)) {
    next();
  } else {
    res.status(403).json({
      message: "Access denied: Your IP address is not authorized."
    });
  }
};




// Middleware to authenticate Telegram initData
const authenticateTelegram = (req: any, res: any, next: any) => {
  const initData = req.headers["x-telegram-init-data"];


  if (!botToken) {
    console.warn(
      "TELEGRAM_BOT_TOKEN is not set or is placeholder. Skipping authentication.",
    );
    return next();
  }

  // if (!initData) {
  //   if (process.env.NODE_ENV !== "production") {
  //     console.warn(
  //       "Missing Telegram initData in development. Skipping authentication.",
  //     );
  //     return next();
  //   }
  //   return res.status(401).json({ error: "Missing Telegram initData" });
  // }

  try {
    const urlParams = new URLSearchParams(initData);

    const hash = urlParams.get("hash");
    urlParams.delete("hash");

    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      ?.map(([key, value]) => `${key}=${value}`)
      .join("\n");

    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();

    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    
    if (calculatedHash !== hash) {
      return res.status(401).json({ error: "Invalid Telegram initData" });
    }



    // Optionally parse user data and attach to request
    const userStr = urlParams.get("user");
    if (userStr) {
      var user = JSON.parse(userStr);
      // user.id = 999999;
      // console.log("Authenticated Telegram user:", user);
      req.telegramUser = user;
    }

    next();
  } catch (error) {
    console.error("Telegram auth error:", error);
    return res.status(401).json({ error: "Authentication failed" });
  }
};

// API Routes
// Helper to distribute referral commission
const distributeCommission = async (
  userId: string,
  amount: number,
  amountTon: number = 0,
  walletAddress:string="",
  hash:string="",
  type?: "ton_task" | "boost_rank" | "boost_mining",

) => {
  const user = await User.findOne({ id: userId });
  const config = await loadConfig();
    const friendsCommissionPercentage = config?.friends_commission_percentage_coin;
    const friendsCommissionPercentageTON = config?.friends_commission_percentage_ton;
    console.log(amount)
     console.log(typeof(amountTon))
  if (user && user.referred_by) {
    const commission = amount * (friendsCommissionPercentage/100);
    const commissionTON = Number(amountTon) > 0? Number(amountTon) * (friendsCommissionPercentageTON/100):0;
    
    const update: any = {
      $inc: {
        referral_balance: commission,
        total_balance: commission,
        partner_balance: commissionTON,
      },
    };

    if (type === "ton_task") {
      update.$inc.friends_ton_tasks_total = amountTon;
    } else if (type === "boost_rank") {
      update.$inc.friends_boost_rank_total = amountTon;
    }else if (type === "boost_mining") {
      update.$inc.friends_boost_mining_total = amountTon;
    }


    const referralUser = await User.findOneAndUpdate(
      { id: user.referred_by },
      update,
      { returnDocument: 'after' },
    );

    const transactionType = (type === "ton_task" || type === "boost_rank" || type === "boost_mining") ? "referral_commission" : "referral_reward";

    if(referralUser !=null){
        await new Transaction({
          user_id: referralUser.id,
          username: referralUser.username,
          type: transactionType,
          amount: type === "boost_mining" ? 0 : commission,
          hash: hash,
          fromUserId:userId,
          walletAddress: walletAddress,
          amount_ton:commissionTON,
          description: `Direct Commission from ${user.username || "Friend"} (${type === "ton_task" ? "GRAM Task" : type === "boost_rank" ? "Rank Boost" : type === "boost_mining" ? "Mining Boost" : "Activity"})`,
      }).save();
    }
    
  }
};

// Helper to estimate Telegram account age in years
const estimateAgeSimple = (telegramId: number) => {
  const currentYear = 2026;
  const startYear = 2013;
  const growthRatePerYear = 1200000000;
  const estimatedJoinYear = startYear + telegramId / growthRatePerYear;
  const age = currentYear - estimatedJoinYear;
  return Math.max(1, Math.round(age));
};

app.post(
  "/api/achievements/claim-referral",
  authenticateTelegram,
  async (req: any, res) => {
    const userId = req.telegramUser?.id?.toString() || req.body.userId;
    const { target } = req.body;
    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.referral_count < target) {
      return res.status(400).json({ error: "Target not reached" });
    }

    if ((user as any).claimed_referral_achievements.includes(target)) {
      return res.status(400).json({ error: "Reward already claimed" });
    }


    const result = await loadConfig();
    const rewards = result.referralAchievements;
    const rewardObj = rewards.find(r => r.target === target);
    const reward = rewardObj?.reward || 0;
    if (!reward) return res.status(400).json({ error: "Invalid target" });

    user.total_balance += reward;
    user.referral_balance += reward;
    (user as any).claimed_referral_achievements.push(target);
    await user.save();

    // await new Transaction({
    //   user_id: userId,
    //   username: user.username,
    //   type: "task",
    //   amount_visa: reward,
    //   description: `Referral Achievement: ${target} Friends`,
    // }).save();

    //provide referral bonnnus


      if(user.referred_by){
    //  const refereeuser =  await User.findOneAndUpdate({"id":user.referred_by}, {
    //         $inc: { total_balance: reward*0.1,referral_balance:reward*0.1},
    //     });

        // await new Transaction({
        //   user_id:refereeuser.id,
        //   username: refereeuser.username,
        //   type: "referral_reward",
        //   amount_visa: reward*0.1,
        //   description: `Referral Bonus-Claim Referral`,
        // }).save();
          await distributeCommission(userId, reward);
      }


    res.json({ success: true, reward });
  },
);

app.post(
  "/api/achievements/claim-tier",
  authenticateTelegram,
  async (req: any, res) => {
    const userId = req.telegramUser?.id?.toString() || req.body.userId;
    const { tier } = req.body;
    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: "User not found" })

   const result = await loadConfig();
    const rewards = result.tierAchievements;
    const tierData = rewards.find(r => r.tier === tier);
    if (!tierData) return res.status(400).json({ error: "Invalid tier" });

    if (user.mining_balance < tierData.target) {
      return res.status(400).json({ error: "Target balance not reached" });
    }

    if ((user as any).claimed_tier_achievements.includes(tier)) {
      return res.status(400).json({ error: "Reward already claimed" });
    }

    user.total_balance += tierData.reward;
    user.mining_balance += tierData.reward;
    (user as any).claimed_tier_achievements.push(tier);
    await user.save();

     if(user.referred_by){
         await distributeCommission(userId, tierData.reward);
    //  const refereeuser =  await User.findOneAndUpdate({"id":user.referred_by}, {
    //         $inc: { total_balance: tierData.reward*0.1,referral_balance:tierData.reward*0.1},
    //     });

      }

    res.json({ success: true, reward: tierData.reward });
  },
);

app.post("/api/user/init", authenticateTelegram, async (req: any, res) => {
  const id = req.telegramUser?.id?.toString()
  console.log("Initializing user with ID:", id);  
  const config = await loadConfig();
  try {
    const telegramId = parseInt(id);
    const ageYears = estimateAgeSimple(isNaN(telegramId) ? 0 : telegramId);
    const AGE_REWARDS = ageYears * config.age_rewards_multiplier ;
    const PREMIUM_REWARD = config.premium_rewards;
    const SINGLE_JOINING_BONUS= config.joining_bonus;
    const REFERRAL_JOINING_BONUS= config.referral_joining_bonus;
    const REFER_FRIEND_BONUS= SINGLE_JOINING_BONUS+REFERRAL_JOINING_BONUS;
    let totalReward = AGE_REWARDS;
    let user = await User.findOne({ id });
    console.log("User found:", id);

    if (user.welcomeUser) {
      //award premium reward
      if (user.isPremium) {
        totalReward += PREMIUM_REWARD;
      }
      if(user.referred_by){
        totalReward += REFER_FRIEND_BONUS
      }else{
        totalReward += SINGLE_JOINING_BONUS
      }
  

      user.age_reward = AGE_REWARDS;
      user.premiumReward = user.isPremium?PREMIUM_REWARD:0;
      user.welcomeUser = false;
      user.total_balance += totalReward;
      user.joining_bonus = user.referred_by?REFER_FRIEND_BONUS:SINGLE_JOINING_BONUS
      await user.save();

      //get rewards if joind using referral link
      if(user.referred_by){

        //pay 10k to referee reward bonus and increase count
        const refereeuser =  await User.findOneAndUpdate(
          {"id":user.referred_by}, 
          {$inc: { referral_count: 1, total_balance: REFERRAL_JOINING_BONUS,referral_balance:REFERRAL_JOINING_BONUS}},
          { returnDocument: 'after' }
        );
     
        if (refereeuser) {
        // await new Transaction({
        //   user_id: user.referred_by,
        //   username: refereeuser.username,
        //   type: "referral_reward",
        //   amount_visa: REFER_FRIEND_BONUS,
        //   description: `Referral Bonus`,
        // }).save();
      }

      }else{
        //  await new Transaction({
        //   user_id: id,
        //   username: user.username,
        //   type: "joining_bonus",
        //   amount_visa: SINGLE_JOINING_BONUS,
        //   description: `Joining Bonus`,
        // }).save();
      }

      // Record age reward transaction
      // await new Transaction({
      //   user_id: id,
      //   username: user.username,
      //   type: "age_reward",
      //   amount_visa: AGE_REWARDS,
      //   description: `Account Age Reward (${ageYears} years)`,
      // }).save();

      // Record premium reward transaction
      if (user.isPremium) {
        // await new Transaction({
        //   user_id: id,
        //   username: user.username,
        //   type: "premium_reward",
        //   amount_visa: PREMIUM_REWARD,
        //   description: `Premium Account Reward`,
        // }).save();
      }

      // Distribute commission for joining
      // await distributeCommission(id, totalReward);
    } else {
      if (user.is_banned) {
        return res
          .status(403)
          .json({
            error: "USER_BANNED",
            message: "Your account has been banned.",
          });
      }

      // Ensure referral_count is accurate
      const actualReferralCount = await User.countDocuments({
        referred_by: id,
      });
      if (user.referral_count !== actualReferralCount) {
        user.referral_count = actualReferralCount;
        await user.save();
      }

    }
    res.json(user);
  } catch (error: any) {
    console.error("Init user error:", error);
    res.status(500).json({ error: "Failed to initialize user" });
  }
});


app.post("/api/admin/loginAs", authenticateAdmin, async (req: any, res) => {
    const userId =req.body.userId;
    const user = await User.findOne({ id: userId });
  try {
    res.json(user);
  } catch (error: any) {
    console.error("admin init user error:", error);
    res.status(500).json({ error: "Failed to initialize admin user" });
  }
});

// WhiteList

app.post("/api/user/whitelist", async (req: any, res) => {
    const {userId} =req.body;
    if (!userId) {
      return res.json({"error":"userId required"});
    }

    const user = await User.findOne({ id: userId });
    if(!user){
      return res.json({"error":"user not found"});
    }
    const config = await loadConfig();

    if(user.total_balance<config.minimum_coin_required_for_whitelist){
      return res.json({"error":"Please Mine atleast 100,000 to be eligible for whitelist"});
    }

    const existingEntry = await WhiteList.findOne({ userId: userId });
    if (existingEntry) {
        return res.json({"error":"Already Whitelisted"});
    }


    await new WhiteList({ userId: userId }).save();

    return res.status(201).json({
      message: "User Added to Whitelist",
      statusCode: 201,
      data: {"success":true},
    });
});





app.post("/api/user/checkin", authenticateTelegram, async (req: any, res) => {
  try {
    const userId = req.telegramUser?.id?.toString() || req.body.userId;
    const user = await User.findOne({ id: userId });
    
    if (!user) return res.status(404).json({ error: "User not found" });

    const now = new Date();
    const todayStart = new Date(now).setHours(0, 0, 0, 0);
    const yesterdayStart = todayStart - (24 * 60 * 60 * 1000);

    const lastCheckinDate = user.last_checkin ? new Date(user.last_checkin).setHours(0, 0, 0, 0) : 0;

    // 1. Prevent double check-in on the same calendar day
    if (lastCheckinDate === todayStart) {
      return res.status(400).json({ 
        error: "Already checked in today", 
        nextCheckin: new Date(todayStart + 24 * 60 * 60 * 1000) 
      });
    }

    // 2. Logic for Streak and Missed Day Message
    let streak = 1;
    let isReset = false;
    let message = "Welcome to your first check-in!";

    if (lastCheckinDate === yesterdayStart) {
      // Success: Checked in yesterday, so increment streak
      streak = (user.checkin_streak || 0) + 1;
      message = `Great job! You're on a ${streak} day streak!`;
    } else if (user.last_checkin) {
      // Missed Day: Had a previous check-in but NOT yesterday
      streak = 1;
      isReset = true;
      message = "Oh no! You missed a day. Your streak has been reset to Day 1.";
    }

    // 3. Cap or Reset at 60 days
    if (streak > 60) streak = 1;
    const reward = 100 * streak;

    // 4. Save to Database
    user.checkin_balance += reward;
    user.total_balance += reward;
    user.last_checkin = now;
    user.checkin_streak = streak;
    await user.save();

    // 5. Audit Trail
    // await new Transaction({
    //   user_id: userId,
    //   username: user.username,
    //   type: "checkin",
    //   amount_visa: reward,
    //   description: `Daily Check-in (Day ${streak})`,
    // }).save();


    // 6. Referral Commission
    if (typeof distributeCommission === 'function') {
      await distributeCommission(userId, reward);
    }

    res.json({ 
      success: true,
      reward, 
      streak, 
      isReset,
      message, 
      nextCheckin: "Tomorrow" 
    });

  } catch (error) {
    console.error("Check-in Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/mining/start", authenticateTelegram, async (req: any, res) => {
  const userId = req.telegramUser?.id?.toString() || req.body.userId;
  await User.findOneAndUpdate(
    { id: userId },
    { mining_started_at: new Date() },
  );
  res.json({ success: true });
});

app.post("/api/mining/claim", authenticateTelegram, async (req: any, res) => {
  const userId = req.telegramUser?.id?.toString() || req.body.userId;
  const user = await User.findOne({ id: userId });

  if (!user || !user.mining_started_at)
    return res.status(400).json({ error: "Mining not started" });

  const elapsed = Date.now() - user.mining_started_at.getTime();
  const MINING_DURATION = 3 * 60 * 60 * 1000;

  if (elapsed < MINING_DURATION) {
    return res
      .status(400)
      .json({
        error:
          "Mining still in progress. Please wait until 3 hours are complete.",
      });
  }

  // Reward is fixed for 3 hours of work
  const earned = 3 * user.mining_speed;

  user.mining_balance += earned;
  user.total_balance += earned;
  user.mining_started_at = null; // Reset mining state
  user.mining_claimed_at = new Date();
  await user.save();

  // Record mining transaction
  // await new Transaction({
  //   user_id: userId,
  //   username: user.username,
  //   type: "mining",
  //   amount_visa: earned,
  //   description: `Mining Claim (${user.mining_speed} PPH)`,
  // }).save();

  // Distribute commission
  await distributeCommission(userId, earned);

  res.json({ earned });
});

app.post("/api/mining/boost", authenticateTelegram, async (req: any, res) => {
  const userId = req.telegramUser?.id?.toString() || req.body.userId;
  const { multiplier,hash,walletAddress } = req.body;
  const user = await User.findOne({ id: userId });
  if (!user) return res.status(404).json({ error: "User not found" });

  try{
  const newSpeed = 100 * multiplier;
  if (newSpeed <= user.mining_speed) {
    return res
      .status(400)
      .json({ error: "You can only upgrade to a higher mining speed" });
  }

  const config = await loadConfig();


  const miningPlans = config.miningPlans;
  const plan =  miningPlans.find(plan => plan.mult === multiplier);

  const tonAmount = plan.ton;
  user.mining_speed = newSpeed;
  user.total_deposit = (user.total_deposit || 0) + (tonAmount || 0);
  user.totalminingboostamount = (user.totalminingboostamount || 0) + (tonAmount || 0);

  await user.save();

  // Record mining boost transaction
 const result =  await new Transaction({
    user_id: userId,
    username: user.username,
    type: "mining_boost",
    amount: 0,
    amount_ton: tonAmount,
    walletAddress: walletAddress,
    description: `Mining Speed Boost (${multiplier}x)`,
    hash: hash,
  }).save();

  // const referralUser = await User.findOne({id:user.referred_by})


  // if(referralUser){
  //   await User.findOneAndUpdate(
  //     { id: user.referred_by },
  //     { $inc: { partner_balance: tonAmount * (config.friends_commission_percentage_ton/100) } },
  //   );

  //  await new Transaction({
  //   user_id: referralUser.id,
  //   username: referralUser.username,
  //   type: "referral_commission",
  //   fromUserId:user.id,
  //   amount: 0,
  //   amount_ton: tonAmount * (config.friends_commission_percentage_ton/100),
  //   walletAddress: referralUser.walletAddress,
  //   description: `Direct Commission from ${user.username || "Friend"}  (Mining Boost)`,
  //   hash: hash,
  // }).save();
//}

      await distributeCommission(userId, 0,tonAmount,walletAddress,hash, "boost_mining");

  


  res.json({ newSpeed });
}catch(e){
  console.log(e)
   return res
        .status(400)
        .json({ error: e});
}
});




app.post(
  "/api/user/boost-rank",
  authenticateTelegram,
  async (req: any, res) => {
    const userId = req.telegramUser?.id?.toString() || req.body.userId;
    const { visaAmount, tonAmount,hash,walletAddress } = req.body;
    const user = await User.findOneAndUpdate(
      { id: userId },
      { $inc: { total_balance: visaAmount, totalrankboostamount: tonAmount,total_deposit:tonAmount } },
      { returnDocument: 'after' },
    );

    // Record boost rank transaction
    await new Transaction({
      user_id: userId,
      username: user.username,
      type: "boost_rank",
      amount: visaAmount,
      amount_ton: tonAmount,
      walletAddress:walletAddress,
      description: `Rank Boost (${tonAmount} GRAM)`,
      hash: hash, // Mock hash for now
    }).save();

    // Distribute commission for rank boost
    await distributeCommission(userId, visaAmount,tonAmount,walletAddress,hash, "boost_rank");

    res.json(user);
  },
);

app.get("/api/tasks", authenticateTelegram, async (req: any, res) => {
  const userId = req.telegramUser?.id?.toString() || req.query.userId;
  const tasks = await Task.find();
  const userTasks = await UserTask.find({ user_id: userId });

  const tasksWithStatus = tasks?.map((t) => {
    const completed = userTasks.find((ut) => ut.task_id === t.id);
    return {
      ...t.toObject(),
      completed_at: completed ? completed.completed_at : null,
    };
  });

  res.json(tasksWithStatus);
});
// taskId, hash, amount, walletAddress
app.post("/api/tasks/complete", authenticateTelegram, async (req: any, res) => {
  const userId = req.telegramUser?.id?.toString() || req.body.userId;
  const { taskId,hash,amount,walletAddress } = req.body;
  const quantity = Number(amount)

  const task = await Task.findOne({ id: taskId });
  if (!task) return res.status(404).json({ error: "Task not found" });

  try {
    await new UserTask({ user_id: userId, task_id: taskId }).save();

    const update: any = {
      $inc: {
        task_balance: task.reward,
        total_balance: task.reward,
      },
    };
    
  const myUser = await User.findOne({ id: userId });
    if (task.type === "ton") {
      update.$inc.tontaskamount = quantity || 0;
      // update.$inc.total_deposit = quantity || 0;
      update.$set = { ton_transaction_completed: true };
    }

    await User.findOneAndUpdate({ id: userId }, update);
  

    if(task.type === "ton"){
    // Record task transaction
    await new Transaction({
      user_id: userId,
      username: myUser?.username,
      type: task.type === "ton" ? "ton_task" : "task",
      amount: task.reward,
      walletAddress:walletAddress,
      amount_ton: task.type === "ton" ? quantity : 0,
      description: task.type === "ton" ? "Perform GRAM Task":task.title,
      hash:
        task.type === "ton"
          ? `${hash}`
          : undefined,
    }).save();
  }

    // Distribute commission
    await distributeCommission(
      userId,
      task.reward,
      task.type === "ton" ? quantity : 0,
      walletAddress,
      hash,
      task.type === "ton" ? "ton_task" : undefined,
    );

    res.json({ success: true, reward: task.reward });
  } catch (e) {
    res.status(400).json({ error: e});
  }
});


app.post("/api/user/withdraw", authenticateTelegram, async (req: any, res) => {
  const userId = req.telegramUser?.id?.toString() || req.body.userId;
  const { amountTon } = req.body;
  const user = await User.findOne({ id: userId });
  if (!user) return res.status(404).json({ error: "User not found" });
 const config = await loadConfig();

const totalDeposit = user.total_deposit || 0;
const totalbalance = user.total_balance || 0;
const totalWithdrawn = user.total_withdrawal || 0;
const amountToWithdraw = Number(amountTon);

const amountCoinToWithdraw = Number(amountToWithdraw) / config.coinPriceTON;

// Calculate the 2x limit and the remaining "allowance"
const maxAllowedWithdrawal = totalDeposit * config.withdrawtimes;
const remainingLimit = maxAllowedWithdrawal - totalWithdrawn;

if (amountCoinToWithdraw > totalbalance) {
  return res.status(400).json({ 
    error: "Insufficient Balance",
    details: `Your balance is not sufficient to withdraw ${amountToWithdraw} GRAM.`,
    totalBalance: totalbalance
  });
}

if (amountToWithdraw > remainingLimit) {
  return res.status(400).json({ 
    error: "Withdrawal limit exceeded",
    details: `You can only withdraw up to 2x your total deposits. Your remaining limit is ${remainingLimit.toFixed(2)}.`,
    remainingLimit: remainingLimit
  });
}

  // Check last withdrawal
if (user.last_withdrawal_at) {
  const lastWithdrawal = new Date(user.last_withdrawal_at).getTime();
  const durationInMs = config.withdrawal_duration_days * 1 * 60 * 60 * 1000;
  const cooldownEnd = lastWithdrawal + durationInMs;
  const currentTime = Date.now();

  if (currentTime < cooldownEnd) {
    // Calculate how many hours/days are actually left for a better error message
    const hoursLeft = Math.ceil((cooldownEnd - currentTime) / (1000 * 60 * 60));
    return res.status(400).json({ 
      error: `Withdrawal locked. Please wait ${hoursLeft} more hour(s).`,
      cooldown_end: new Date(cooldownEnd)
    });
  }
}

  // Perform withdrawal request
  const withdrawal = new Withdrawal({
    user_id: userId,
    username: user.username,
    walletAddress: user.walletAddress,
    amount: amountCoinToWithdraw,
    amount_ton: amountToWithdraw,
    status: "pending",
  });

  const w= await withdrawal.save();

  await User.findOneAndUpdate(
    { id: userId },
    {
      $inc: { total_balance: - amountCoinToWithdraw, total_withdrawal:amountToWithdraw},
      $set: { last_withdrawal_at: new Date() },
    },
  );

  // Record withdrawal transaction
  await new Transaction({
    user_id: userId,
    username: user.username,
    type: "withdrawal",
    amount: amountCoinToWithdraw,
    amount_ton: amountToWithdraw,
    status: "pending",
    description: `Withdrawal Request`,
    withdrawalId: w._id
  }).save();

  res.json({ success: true });
});


app.post("/api/user/withdrawPartner", authenticateTelegram, async (req: any, res) => {
  const userId = req.telegramUser?.id?.toString() || req.body.userId;
  const { amount } = req.body;
  const user = await User.findOne({ id: userId });
  if (!user) return res.status(404).json({ error: "User not found" });
  if(user.partner_balance <amount) return res.status(404).json({ error: "Insufficient balance" });
    const config = await loadConfig();
   console.log(typeof(amount))



  const totalTOken = (amount/config.coinPriceTON);
  if(totalTOken>user.total_balance){
      return res.status(400).json({ error: "Insufficient balance" });
  }

  const withdrawals = await Withdrawal.find({user_id:userId,wtype:"PARTNER",status:"pending"})
  if(withdrawals.length>0){
     return res.status(400).json({ error: "Previous Withdrawal still in process" });
  }
  // Perform withdrawal request
  const withdrawal = new Withdrawal({
    user_id: userId,
    username: user.username,
    walletAddress: user.walletAddress,
    amount: totalTOken,
    amount_ton: amount,
    comment:"Withdrawal Of Commission",
    status: "pending",
    wtype:"REFERRAL"
  });
  const w= await withdrawal.save();

  await User.findOneAndUpdate(
    { id: userId },
    {
      $inc: { partner_balance: -amount },
      $set: { last_partner_withdrawal_at: new Date() },
    },
  );

  // Record withdrawal transaction
  await new Transaction({
    user_id: userId,
    username: user.username,
    type: "withdrawal_partner",
    amount: totalTOken,
    amount_ton: amount,
    status: "pending",
    description: `Withdrawal GRAM`,
    withdrawalId: w._id
  }).save();
  res.json({ success: true });
});



app.get(
  "/api/user/withdrawals",
  authenticateTelegram,
  async (req: any, res) => {
    const userId = req.telegramUser?.id?.toString() || req.query.userId;
    const withdrawals = await Withdrawal.find({ user_id: userId }).sort({
      created_at: -1,
    });
    res.json(withdrawals);
  },
);

app.get(
  "/api/user/transactions",
  authenticateTelegram,
  async (req: any, res) => {
    const userId = req.telegramUser?.id?.toString() || req.query.userId;
    const transactions = await Transaction.find({ user_id: userId }).sort({
      created_at: -1,
    });
    res.json(transactions);
  },
);

app.get(
  "/api/admin/withdrawals",
  authenticateAdmin,
  isAdmin,
  async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const total = await Withdrawal.countDocuments();
    const withdrawals = await Withdrawal.find({status:"pending"})
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: withdrawals,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  },
);


app.post(
  "/api/admin/telegram/channel-message",
  authenticateAdmin,
  isAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        channelId,
        message,
        parseMode,
        buttons,
      } = req.body;

      // ============================================================
      // VALIDATION
      // ============================================================

      if (!channelId || !String(channelId).trim()) {
        return res.status(400).json({
          error: "Channel username or chat ID is required.",
        });
      }

      if (!message || !String(message).trim()) {
        return res.status(400).json({
          error: "Message text is required.",
        });
      }

      const botToken = process.env.TELEGRAM_BOT_TOKEN;

      if (!botToken) {
        return res.status(400).json({
          error: "Telegram Bot Token is not configured.",
        });
      }

      // ============================================================
      // CHANNEL ID
      // ============================================================

      let targetChannelId = String(channelId).trim();

      if (
        !targetChannelId.startsWith("-") &&
        !targetChannelId.startsWith("@")
      ) {
        targetChannelId = `@${targetChannelId}`;
      }

      // ============================================================
      // PARSE BUTTONS
      // ============================================================

      let parsedButtons: any[] = [];

      try {
        parsedButtons = buttons
          ? JSON.parse(buttons)
          : [];
      } catch (error) {
        console.error("Button JSON parse error:", error);

        return res.status(400).json({
          error: "Invalid buttons data.",
        });
      }

      // ============================================================
      // BUILD INLINE KEYBOARD
      // ============================================================

      const inlineKeyboard = Array.isArray(parsedButtons)
        ? parsedButtons
            .map((button: any) => ({
              text: String(button?.text || "").trim(),
              url: String(button?.url || "").trim(),
            }))
            .filter(
              (button: any) =>
                button.text && button.url
            )
        : [];

      // ============================================================
      // VALIDATE BUTTON URLS
      // ============================================================

      for (const button of inlineKeyboard) {
        try {
          const url = new URL(button.url);

          if (
            !["http:", "https:", "tg:"].includes(
              url.protocol
            )
          ) {
            return res.status(400).json({
              error:
                `Invalid button link protocol for "${button.text}".`,
            });
          }
        } catch {
          return res.status(400).json({
            error:
              `Invalid button link for "${button.text}".`,
          });
        }
      }

      // ============================================================
      // REPLY MARKUP
      // ============================================================

      const replyMarkup =
        inlineKeyboard.length > 0
          ? {
              inline_keyboard:
                inlineKeyboard.map(
                  (button: any) => [button]
                ),
            }
          : undefined;

      // ============================================================
      // PARSE MODE
      // ============================================================

      const allowedParseModes = new Set([
        "Markdown",
        "MarkdownV2",
        "HTML",
      ]);

      const normalizedParseMode =
        allowedParseModes.has(parseMode)
          ? parseMode
          : undefined;

      // ============================================================
      // DEBUG
      // ============================================================

      // console.log("Telegram channel post:", {
      //   channelId: targetChannelId,
      //   parseMode: normalizedParseMode,
      //   hasImage: !!req.file,
      //   imageName: req.file?.originalname,
      //   imageType: req.file?.mimetype,
      //   imageSize: req.file?.size,
      //   buttons: inlineKeyboard.length,
      // });

      // ============================================================
      // NO IMAGE
      // ============================================================

      if (!req.file) {
        const payload: any = {
          chat_id: targetChannelId,
          text: String(message).trim(),
        };

        if (normalizedParseMode) {
          payload.parse_mode = normalizedParseMode;
        }

        if (replyMarkup) {
          payload.reply_markup = replyMarkup;
        }

        const telegramRes = await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const telegramData =
          await telegramRes.json() as any;

        // console.log(
        //   "Telegram sendMessage response:",
        //   telegramData
        // );

        if (!telegramData.ok) {
          return res.status(400).json({
            error:
              telegramData.description ||
              "Telegram rejected the channel message.",
          });
        }

        return res.json({
          success: true,
          result: telegramData.result,
        });
      }

      // ============================================================
      // IMAGE VALIDATION
      // ============================================================

      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (
        !allowedMimeTypes.includes(
          req.file.mimetype
        )
      ) {
        return res.status(400).json({
          error:
            "Picture upload supports JPG, PNG or WebP images only.",
        });
      }

      // ============================================================
      // IMAGE SIZE
      // ============================================================

      const maxImageSize = 8 * 1024 * 1024;

      if (req.file.size > maxImageSize) {
        return res.status(400).json({
          error: "Image size must be less than 8MB.",
        });
      }

      // ============================================================
      // TELEGRAM MULTIPART FORM
      //
      // IMPORTANT:
      // Explicitly use Node's native Web API implementation.
      //
      // DO NOT:
      // import FormData from "form-data"
      //
      // DO NOT:
      // use formData.getHeaders()
      // ============================================================

      const telegramForm =
        new globalThis.FormData();

      telegramForm.append(
        "chat_id",
        targetChannelId
      );

      const photoBlob =
        new globalThis.Blob(
          [new Uint8Array(req.file.buffer)],
          {
            type: req.file.mimetype,
          }
        );

      telegramForm.append(
        "photo",
        photoBlob,
        req.file.originalname
      );

      telegramForm.append(
        "caption",
        String(message).trim()
      );

      if (normalizedParseMode) {
        telegramForm.append(
          "parse_mode",
          normalizedParseMode
        );
      }

      if (replyMarkup) {
        telegramForm.append(
          "reply_markup",
          JSON.stringify(replyMarkup)
        );
      }

      console.log(
        "Sending photo to Telegram:",
        {
          channel: targetChannelId,
          filename: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
        }
      );

      // ============================================================
      // SEND TO TELEGRAM
      // ============================================================

      const telegramRes = await fetch(
        `https://api.telegram.org/bot${botToken}/sendPhoto`,
        {
          method: "POST",
          body: telegramForm,
        }
      );

      const telegramData =
        await telegramRes.json() as any;

      console.log(
        "Telegram sendPhoto response:",
        telegramData
      );

      // ============================================================
      // TELEGRAM ERROR
      // ============================================================

      if (!telegramData.ok) {
        console.error(
          "Telegram rejected photo:",
          telegramData
        );

        return res.status(400).json({
          error:
            telegramData.description ||
            "Telegram rejected the photo.",
        });
      }

      // ============================================================
      // SUCCESS
      // ============================================================

      return res.json({
        success: true,
        result: telegramData.result,
      });

    } catch (error: any) {
      console.error(
        "Channel message error:",
        error
      );

      return res.status(500).json({
        error:
          error?.message ||
          "Failed to send channel message.",
      });
    }
  }
);

app.post(
  "/api/admin/withdrawals/action",
  authenticateAdmin,
  isAdmin,
  async (req, res) => {
    const { withdrawalId, action,hash,reason } = req.body; // action: 'approve' | 'reject'

    console.log("Withdrawal action request:", {
      withdrawalId,
      action,
      hash,
    });

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal)
      return res.status(404).json({ error: "Withdrawal not found" });
    if (withdrawal.status !== "pending")
      return res.status(400).json({ error: "Withdrawal already processed" });

    if (action === "approve") {
      withdrawal.status = "approved";
      (withdrawal as any).hash = hash;
      await withdrawal.save();
      // Update transaction status
      await Transaction.findOneAndUpdate(
        { withdrawalId: withdrawal._id.toString() }, // Ensure this field is in your Schema!
        { 
          $set: { 
            status: "completed", 
            hash: hash 
          } 
        }
      );
    } else if (action === "reject") {
      withdrawal.status = "rejected";
      withdrawal.comment = reason || "Rejected by admin";
      await withdrawal.save();
      // Update transaction status
      await Transaction.findOneAndUpdate(
      { withdrawalId: withdrawal._id.toString() },
      { 
      $set: { 
        status: "rejected" 
      } 
      }
      );

      
        // Refund user
      await User.findOneAndUpdate(
        { id: withdrawal.user_id },
        { $inc: { total_balance: withdrawal.amount, total_withdrawal: - withdrawal.amount_ton} },
      );
      
      
    }

    res.json({ success: true });
  },
);


app.get(
  "/api/admin/transactions",
  authenticateAdmin,
  isAdmin,
  async (req, res) => {
    try {
      const query = String(req.query.query || "").trim();
      const page = Math.max(1, parseInt(String(req.query.page)) || 1);
      const limit = Math.min(
        100,
        Math.max(1, parseInt(String(req.query.limit)) || 10)
      );

      const skip = (page - 1) * limit;

      let filter: any = {};

      if (query) {
        // Escape special regex characters
        const escapedQuery = query.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

        filter.$or = [
          { user_id: { $regex: escapedQuery, $options: "i" } },
          { username: { $regex: escapedQuery, $options: "i" } },
          { hash: { $regex: escapedQuery, $options: "i" } },
          { description: { $regex: escapedQuery, $options: "i" } },
        ];

        // Search MongoDB _id only if the query is a valid ObjectId
        if (/^[0-9a-fA-F]{24}$/.test(query)) {
          filter.$or.push({ _id: query });
        }
      }

      const [transactions, total] = await Promise.all([
        Transaction.find(filter)
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        Transaction.countDocuments(filter),
      ]);

      res.json({
        data: transactions,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("Admin transactions error:", error);
      res.status(500).json({
        message: "Failed to fetch transactions",
      });
    }
  }
);

app.get("/api/admin/stats", authenticateAdmin, isAdmin, async (req, res) => {
  const totalUsers = await User.countDocuments();
  const pendingWithdrawals = await Withdrawal.countDocuments({
    status: "pending",
  });
  const totalVisaMined = await User.aggregate([
    { $group: { _id: null, total: { $sum: "$total_balance" } } },
  ]);

  res.json({
    totalUsers,
    pendingWithdrawals,
    totalVisaMined: totalVisaMined[0]?.total || 0,
  });
});

app.get("/api/admin/users", authenticateAdmin, isAdmin, async (req, res) => {
  const { query } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  let filter = {};
  if (query) {
    filter = {
      $or: [
        { id: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
      ],
    };
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    data: users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});



app.post(
  "/api/user/getHashFromBoc",
  authenticateTelegram,
  async (req, res) => {
    const { hash } = req.body;
    const hashs = Cell.fromBase64(hash).hash().toString('hex');
    res.json({ hash: hashs});
  }
);



app.post(
  "/api/admin/getHashFromBoc",
  authenticateAdmin,
  isAdmin,
  async (req, res) => {
    const { hash } = req.body;
    try{
    const hashs = Cell.fromBase64(hash).hash().toString('hex');
    res.json({ hash: hashs});
    }catch(e){
      return res.status(404).json({ error: e});
    }
  }
);


app.post(
  "/api/admin/users/ban",
  authenticateAdmin,
  isAdmin,
  async (req, res) => {
    const { targetUserId, isBanned } = req.body;
    const user = await User.findOneAndUpdate(
      { id: targetUserId },
      { is_banned: isBanned },
      { returnDocument: 'after' },
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, is_banned: user.is_banned });
  },
);




app.post(
  "/api/admin/users/changeAccountType",
  authenticateAdmin,
  isAdmin,
  async (req, res) => {
    const { targetUserId, accountType } = req.body;
    const user = await User.findOneAndUpdate(
      { id: targetUserId },
      { accountType: accountType },
      { returnDocument: 'after' },
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, accountType: user.accountType });
  },
);

app.post(
  "/api/admin/users/role",
  authenticateAdmin,
  isAdmin,
  async (req, res) => {
    const { targetUserId, role } = req.body;
    const user = await User.findOneAndUpdate(
      { id: targetUserId },
      { role },
      { returnDocument: 'after' },
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, role: user.role });
  },
);

app.post(
  "/api/user/select-exchange",
  authenticateTelegram,
  async (req: any, res) => {
    const userId = req.telegramUser?.id?.toString() || req.body.userId;
    const { exchange } = req.body;
    const user = await User.findOneAndUpdate(
      { id: userId },
      { selected_exchange: exchange },
      { returnDocument: 'after' },
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  },
);

app.get("/api/friends", authenticateTelegram, async (req: any, res) => {
  const userId = req.telegramUser?.id?.toString() || req.query.userId;
  const friends = await User.find(
    { referred_by: userId },
    "id username total_balance",
  ).sort({ total_balance: -1 });
  res.json(friends);
});



app.get("/api/leaderboard", authenticateTelegram, async (req: any, res) => {
  const userId = req.telegramUser?.id?.toString() || req.query.userId;
  const totalLeaders = await User.find()
    .sort({ total_balance: -1 })
    .limit(20)
    .select("username total_balance");
  const miningLeaders = await User.find()
    .sort({ mining_balance: -1 })
    .limit(20)
    .select("username mining_balance");

  let totalRank = 0;
  let miningRank = 0;
  if (userId) {
    const user = await User.findOne({ id: userId });
    if (user) {
      totalRank =
        (await User.countDocuments({
          total_balance: { $gt: user.total_balance },
        })) + 1;
      miningRank =
        (await User.countDocuments({
          mining_balance: { $gt: user.mining_balance },
        })) + 1;
    }
  }

  res.json({ totalLeaders, miningLeaders, totalRank, miningRank });
});



app.post("/api/user/updateWallet",authenticateTelegram, async (req, res) => {
  const { walletAddress, userId } = req.body;
  
  try {
    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: "User not found" });
    user.walletAddress = walletAddress;
    if (!user.allWallets.includes(walletAddress)) {
      user.allWallets.push(walletAddress);
    }
    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/user/disableWelcomeSlider",authenticateTelegram, async (req, res) => {
  const { userId } = req.body;
  
  try {
    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: "User not found" });
    user.welcomeSlider =false;
    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});





app.post("/api/user/getChatMember",authenticateTelegram, async (req, res) => {
 try {
    const {user_id } = req.query;
    var url =  `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${CHAT_ID}&user_id=${user_id}`

    const response = await axios.get(url);

    res.status(200).json({
        success: true,
        data: response.data,
      });
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
  }
});






app.post("/api/achievements/claim-milestone", authenticateTelegram, async (req: any, res) => {
  const userId = req.telegramUser?.id?.toString() || req.body.userId;
  const { target } = req.body;
  const user = await User.findOne({ id: userId });
  if (!user) return res.status(404).json({ error: "User not found" });

   const result = await loadConfig();
    const rewards = result.milestoneAchievements;
    const rewardObj = rewards.find(r => r.target === target);
    const reward = rewardObj?.reward || 0;

  if (!reward) return res.status(400).json({ error: "Invalid milestone" });

  if (user.total_balance < target) {
    return res.status(400).json({ error: "Target balance not reached" });
  }

  if ((user as any).claimed_milestone_achievements.includes(target)) {
    return res.status(400).json({ error: "Reward already claimed" });
  }

  user.total_balance += reward;
  (user as any).claimed_milestone_achievements.push(target);
  await user.save();


   await distributeCommission(userId, reward);

  // await new Transaction({
  //   user_id: userId,
  //   username: user.username,
  //   type: 'task',
  //   amount_visa: reward,
  //   description: `Milestone Achievement: ${target.toLocaleString()}`
  // }).save();

  res.json({ success: true, reward });
});



app.post("/api/admin/sendTelegramNotification",authenticateAdmin,isAdmin, async (req, res) => {
  const { id, message,platform,trHash} = req.body;
  if(id){
  const user = await User.findOne({ id:id });
    if (!user) {
    return res.status(401).json({ error: "user Not found" });
  }
  }

  try{
  if(platform==="channel"){
    await sendMessage1(
      CHAT_ID,
      message,
      trHash
    );
  }

  if(platform==="chat" && trHash !==null && trHash !==""){
    await sendMessage(
    id,
    message,
    trHash
    );
  }else{
    await sendMessage2(
      id,
      message
    );
  }
}catch(e){
  return res.status(400).json({ error: e });
}
   return res.status(200).json({ message: "Success" });
});


app.post("/api/admin/verifyTransactionLimit", authenticateAdmin, isAdmin, async (req, res) => {

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Query for specific types as requested
    const transactions = await Transaction.find({
      user_id: userId,
      type: { $in: ["boost_rank", "ton_task", "referral_commission","mining_boost"] }
    }).sort({ created_at: -1 });


     const user = await User.findOne({
      id: userId,
    })




    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
      user:user
    });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});




app.post("/api/admin/addFakeWithdrawal", authenticateAdmin, isAdmin, async (req, res) => {
  try {
    const { amount_ton, walletAddress } = req.body;

    if (!amount_ton || !walletAddress) {
      return res.status(400).json({ message: "Amount and Wallet Address are required." });
    }

    // Generate random 10-digit user_id
    const randomUserId = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    const newWithdrawal = new Withdrawal({
      user_id: randomUserId,
      username: randomUserId,
      amount_ton: parseFloat(amount_ton),
      amount: parseFloat(amount_ton) / config.coinPriceTON,
      walletAddress,
      status: "pending",
      comment: "FAKE",
    });

    await newWithdrawal.save();

    res.status(201).json({
      success: true,
      message: "Fake withdrawal added successfully",
      data: newWithdrawal
    });
  } catch (error) {
    console.error("Error adding fake withdrawal:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.post("/api/admin/verify/transaction", authenticateAdmin, isAdmin, async (req, res) => {
  try {
    const { id, verified } = req.body; // verified is a boolean

    if (!id) {
      return res.status(400).json({ message: "Transaction ID is required" });
    }

    const updatedTx = await Transaction.findByIdAndUpdate(
      id,
      { verified: verified },
      { new: true }
    );

    if (!updatedTx) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: `Transaction ${verified ? 'verified' : 'unverified'}`,
      data: updatedTx 
    });
  } catch (error) {
    console.error("Verification Toggle Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.post("/api/admin/create-hash", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required in the request body" });
    }

    // Generate the salt and hash
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    res.json({
      success: true,
      inputPassword: password, // Showing what was hashed
      hashedPassword: hashedPassword,
      note: "Copy the 'hashedPassword' and paste it into your MongoDB 'password' field."
    });

  } catch (error) {
    console.error("Hashing Error:", error);
    res.status(500).json({ error: "Internal server error during hashing" });
  }
});



app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const user = await User.findOne({ username, role: 'admin' });
  if (!user || !user.password) {
    return res.status(401).json({ error: "Invalid credentials1" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid credentials2" });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "24000d" });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

async function loadConfig(){
 const configs = await Config.find().lean();

    const result = {};
    configs.forEach((c) => {
      result[c.key] = c.value;
    });
    return result;
    
}

app.get("/api/loadConfig", async (req, res) => {
  try {
    const result =  await loadConfig()
    res.json(result);

  } catch (err) {
    res.status(500).json({ error: "Failed to load config" });
  }
});

app.post("/api/admin/config", authenticateAdmin, async (req, res) => {
  try {
    const { key, value } = req.body;

    if (!key) return res.status(400).json({ error: "Key required" });

    const config = await Config.findOneAndUpdate(
      { key },
      { value },
       { returnDocument: 'after',upsert: true },
    );

    res.json({ success: true, config });
  } catch (err) {
    res.status(500).json({ error: "Save failed" });
  }
});


app.delete("/api/admin/config/:key", authenticateAdmin, async (req, res) => {
  try {
    await Config.deleteOne({ key: req.params.key });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});


app.post("/api/admin/tasks", authenticateAdmin, async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.json(task);
  } catch (e) {
    res.status(500).json({ error: "Create failed" });
  }
});

app.get("/api/admin/tasks", authenticateAdmin, async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
});

app.put("/api/admin/tasks/:id", authenticateAdmin, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, returnDocument: "after" }
    );

    res.json(task);
  } catch (e) {
    res.status(500).json({ error: "Update failed" });
  }
});


app.delete("/api/admin/tasks/:id", authenticateAdmin, async (req, res) => {
  await Task.deleteOne({ id: req.params.id });
  res.json({ success: true });
});




// POST: Create a new stake
app.post("/api/stake/new", authenticateTelegram, async (req:any, res) => {
  try {
      const userId = req.telegramUser?.id?.toString() || req.body.userId;
    const { amount } = req.body;

    const user = await User.findOne({ id: userId });
    if (!user || user.total_balance < amount) {
      return res.status(400).json({ error: "Insufficient Balance" });
    }

    // 1. Deduct from User Balance
    user.total_balance -= parseFloat(amount);
    await user.save();

    const config = await loadConfig();

    // 2. Create Separate Stake Record
    const newStake = await Stake.create({
      userId,
      amount: parseFloat(amount),
      roi: config.staking_monthly_roi,
      durationDays: config.staking_duration_days,
      status: 'Active'
    });
    res.json({ success: true, newBalance: user.total_balance, newStake });
  } catch (err) {
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// GET: Fetch Staking History
app.get("/api/stake/history", authenticateTelegram, async (req:any, res) => {
  try {
    const userId = req.telegramUser?.id?.toString() || req.body.userId;
    const history = await Stake.find({ userId }).sort({ timestamp: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "FETCH_ERROR" });
  }
});

app.post(
  "/api/stake/claim",
  authenticateTelegram,
  async (req, res) => {
    try {
      const userId =
        req.telegramUser?.id?.toString() ||
        req.body.userId;

      const { stakeId } = req.body;

      console.log("=================================");
      console.log("Claim stake:", stakeId);
      console.log("User:", userId);
      console.log("=================================");

      // =====================================================
      // 1. VALIDATE STAKE ID
      // =====================================================

      if (!stakeId) {
        return res.status(400).json({
          success: false,
          message: "Stake ID is required",
        });
      }

      // =====================================================
      // 2. FIND ACTIVE STAKE
      // =====================================================

      const stake = await Stake.findOne({
        _id: stakeId,
        userId,
        status: "Active",
      });

      if (!stake) {
        return res.status(404).json({
          success: false,
          message: "Active stake not found",
        });
      }

      // =====================================================
      // 3. CONSTANTS
      // =====================================================

      const ONE_DAY_MS =
        24 * 60 * 60 * 1000;

      const now = Date.now();

      // =====================================================
      // 4. STAKE TIME
      // =====================================================

      const startTime =
        new Date(
          stake.timestamp
        ).getTime();

      const durationDays =
        Number(
          stake.durationDays || 30
        );

      const durationMs =
        durationDays *
        ONE_DAY_MS;

      const endTime =
        startTime +
        durationMs;

      const isMatured =
        now >= endTime;

      // =====================================================
      // 5. STAKE AMOUNT
      // =====================================================

      const amount =
        Number(
          stake.amount || 0
        );

      const roi =
        Number(
          stake.roi || 0
        );

      // =====================================================
      // 6. MONTHLY ROI
      //
      // roi = percentage per month
      //
      // Example:
      // amount = 100
      // roi = 30
      //
      // monthlyInterest = 30
      // =====================================================

      const monthlyInterest =
        (amount * roi) / 100;

      // =====================================================
      // 7. DAILY ROI
      //
      // 30-day month
      // =====================================================

      const dailyInterest =
        monthlyInterest / 30;

      // =====================================================
      // 8. TOTAL ROI POSSIBLE
      // =====================================================

      const totalRoiPossible =
        dailyInterest *
        durationDays;

      // =====================================================
      // 9. ALREADY CLAIMED ROI
      // =====================================================

      const alreadyClaimed =
        Number(
          stake.claimedAmount || 0
        );

      // =====================================================
      // 10. ELAPSED TIME FROM ORIGINAL STAKE
      //
      // IMPORTANT:
      // lastClaimedAt is NOT used here.
      //
      // ROI is always calculated from the
      // original stake timestamp.
      // =====================================================

      const elapsedFromStartMs =
        Math.max(
          0,
          Math.min(
            now - startTime,
            durationMs
          )
        );

      // =====================================================
      // 11. COMPLETED DAYS
      // =====================================================

      const completedDaysSinceStart =
        Math.floor(
          elapsedFromStartMs /
            ONE_DAY_MS
        );

      // =====================================================
      // 12. TOTAL GENERATED ROI
      //
      // Only completed 24-hour periods count.
      // =====================================================

      const totalGeneratedInterest =
        Math.min(
          totalRoiPossible,
          completedDaysSinceStart *
            dailyInterest
        );

      // =====================================================
      // 13. REMAINING ROI
      // =====================================================

      const remainingRoi =
        Math.max(
          0,
          totalRoiPossible -
            alreadyClaimed
        );

      // =====================================================
      // 14. CLAIMABLE ROI
      //
      // Before maturity:
      //
      // generated ROI - already claimed ROI
      //
      // At maturity:
      //
      // all remaining ROI
      // =====================================================

      let claimAmount =
        Math.max(
          0,
          totalGeneratedInterest -
            alreadyClaimed
        );

      if (isMatured) {
        claimAmount =
          remainingRoi;
      }

      // =====================================================
      // 15. SAFETY LIMIT
      // =====================================================

      claimAmount =
        Math.min(
          claimAmount,
          remainingRoi
        );

      claimAmount =
        Math.max(
          0,
          claimAmount
        );

      // =====================================================
      // 16. NO CLAIM AVAILABLE
      //
      // IMPORTANT:
      //
      // At maturity, claimAmount can be ZERO if the
      // user already claimed all ROI previously.
      //
      // We MUST still allow the request because the
      // principal needs to be returned.
      //
      // Therefore this check only blocks BEFORE maturity.
      // =====================================================

      if (
        claimAmount <= 0.000001 &&
        !isMatured
      ) {
        const nextGeneratedTime =
          startTime +
          (
            completedDaysSinceStart +
            1
          ) *
            ONE_DAY_MS;

        const remainingMs =
          Math.max(
            0,
            Math.min(
              nextGeneratedTime -
                now,
              endTime -
                now
            )
          );

        const remainingSeconds =
          Math.ceil(
            remainingMs / 1000
          );

        const hours =
          Math.floor(
            remainingSeconds /
              3600
          );

        const minutes =
          Math.floor(
            (
              remainingSeconds %
              3600
            ) / 60
          );

        const seconds =
          remainingSeconds %
          60;

        return res.status(400).json({
          success: false,

          message:
            "No completed 24-hour ROI available",

          cooldown: {
            hours,
            minutes,
            seconds,
            remainingMs,
          },

          nextClaimAt:
            new Date(
              nextGeneratedTime
            ).toISOString(),

          dailyInterest:
            dailyInterest.toFixed(6),

          generatedRoi:
            totalGeneratedInterest.toFixed(
              6
            ),

          alreadyClaimed:
            alreadyClaimed.toFixed(
              6
            ),

          claimableInterest:
            "0.000000",
        });
      }

      // =====================================================
      // 17. NEW TOTAL CLAIMED ROI
      // =====================================================

      const newClaimedAmount =
        alreadyClaimed +
        claimAmount;

      // =====================================================
      // 18. PRINCIPAL RETURN
      //
      // Before maturity:
      // principalReturned = 0
      //
      // At maturity:
      // principalReturned = original stake amount
      // =====================================================

      const principalReturned =
        isMatured
          ? amount
          : 0;

      // =====================================================
      // 19. TOTAL PAYOUT
      //
      // Before maturity:
      // ROI only
      //
      // At maturity:
      // ROI + principal
      // =====================================================

      const totalPayout =
        claimAmount +
        principalReturned;

      // =====================================================
      // 20. UPDATE USER BALANCE
      // =====================================================

      const updatedUser =
        await User.findOneAndUpdate(
          {
            id: userId,
          },
          {
            $inc: {
              total_balance:
                totalPayout,
            },
          },
          {
            new: true,
          }
        );

      // =====================================================
      // 21. USER NOT FOUND
      // =====================================================

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      // =====================================================
      // 22. STAKE UPDATE
      //
      // THIS WAS MISSING IN YOUR CODE
      // =====================================================

      const stakeUpdate = {
        claimedAmount:
          newClaimedAmount,

        earnedRoi:
          newClaimedAmount,

        lastClaimedAt:
          new Date(),
      };

      // =====================================================
      // 23. COMPLETE STAKE AT MATURITY
      // =====================================================

      if (isMatured) {
        stakeUpdate.status =
          "Completed";
      }

      // =====================================================
      // 24. UPDATE STAKE
      // =====================================================

      await Stake.findByIdAndUpdate(
        stakeId,
        {
          $set: stakeUpdate,
        },
        {
          new: true,
        }
      );

      // =====================================================
      // 25. REMAINING ROI
      // =====================================================

      const remainingRoiAfterClaim =
        Math.max(
          0,
          totalRoiPossible -
            newClaimedAmount
        );

      // =====================================================
      // 26. ALL ROI CLAIMED?
      // =====================================================

      const allRoiClaimed =
        remainingRoiAfterClaim <=
        0.000001;

      // =====================================================
      // 27. NEXT CLAIM TIME
      // =====================================================

      let nextClaimAt =
        null;

      if (
        !isMatured &&
        !allRoiClaimed
      ) {
        const nextGeneratedTime =
          startTime +
          (
            completedDaysSinceStart +
            1
          ) *
            ONE_DAY_MS;

        nextClaimAt =
          new Date(
            nextGeneratedTime
          ).toISOString();
      }

      // =====================================================
      // 28. LOG
      // =====================================================

      console.log(
        "================================="
      );

      console.log(
        "CLAIM SUCCESSFUL"
      );

      console.log(
        "Stake ID:",
        stakeId
      );

      console.log(
        "User ID:",
        userId
      );

      console.log(
        "Stake amount:",
        amount
      );

      console.log(
        "Monthly ROI %:",
        roi
      );

      console.log(
        "Monthly interest:",
        monthlyInterest
      );

      console.log(
        "Daily interest:",
        dailyInterest
      );

      console.log(
        "Duration days:",
        durationDays
      );

      console.log(
        "Completed days:",
        completedDaysSinceStart
      );

      console.log(
        "Total generated ROI:",
        totalGeneratedInterest
      );

      console.log(
        "Previous claimed ROI:",
        alreadyClaimed
      );

      console.log(
        "Current ROI claim:",
        claimAmount
      );

      console.log(
        "Total claimed ROI:",
        newClaimedAmount
      );

      console.log(
        "Principal returned:",
        principalReturned
      );

      console.log(
        "Total payout:",
        totalPayout
      );

      console.log(
        "Remaining ROI:",
        remainingRoiAfterClaim
      );

      console.log(
        "Matured:",
        isMatured
      );

      console.log(
        "All ROI claimed:",
        allRoiClaimed
      );

      console.log(
        "Next claim:",
        nextClaimAt
      );

      console.log(
        "New user balance:",
        updatedUser.total_balance
      );

      console.log(
        "================================="
      );

      // =====================================================
      // 29. RESPONSE
      // =====================================================

      return res.json({
        success: true,

        // Amount added to user balance
        payout:
          totalPayout.toFixed(6),

        // ROI paid in this transaction
        roiEarned:
          claimAmount.toFixed(6),

        // Principal returned
        principalReturned:
          principalReturned.toFixed(6),

        // ROI + principal
        totalPayout:
          totalPayout.toFixed(6),

        // Total ROI claimed so far
        totalClaimed:
          newClaimedAmount.toFixed(6),

        monthlyInterest:
          monthlyInterest.toFixed(6),

        dailyInterest:
          dailyInterest.toFixed(6),

        totalRoi:
          totalRoiPossible.toFixed(6),

        generatedRoi:
          totalGeneratedInterest.toFixed(6),

        remainingRoi:
          remainingRoiAfterClaim.toFixed(6),

        daysSinceStart:
          completedDaysSinceStart,

        matured:
          isMatured,

        // true when principal has been returned
        unstaked:
          isMatured,

        stakeStatus:
          isMatured
            ? "Completed"
            : "Active",

        allRoiClaimed,

        nextClaimAt,

        newBalance:
          updatedUser.total_balance,
      });

    } catch (error) {
      console.error(
        "Staking Claim Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Internal server error",
      });
    }
  }
);
app.post(
  "/api/stake/claim",
  authenticateTelegram,
  async (req, res) => {
    try {
      const userId =
        req.telegramUser?.id?.toString() ||
        req.body.userId;

      const { stakeId } = req.body;

      console.log("=================================");
      console.log("Claim / Unstake stake:", stakeId);
      console.log("User:", userId);
      console.log("=================================");

      // =====================================================
      // 1. VALIDATE
      // =====================================================

      if (!stakeId) {
        return res.status(400).json({
          success: false,
          message: "Stake ID is required",
        });
      }

      // =====================================================
      // 2. FIND ACTIVE STAKE
      // =====================================================

      const stake = await Stake.findOne({
        _id: stakeId,
        userId,
        status: "Active",
      });

      if (!stake) {
        return res.status(404).json({
          success: false,
          message: "Active stake not found",
        });
      }

      // =====================================================
      // 3. CONSTANTS
      // =====================================================

      const ONE_DAY_MS =
        24 * 60 * 60 * 1000;

      const now = Date.now();

      // =====================================================
      // 4. STAKE TIMING
      // =====================================================

      const startTime =
        new Date(stake.timestamp).getTime();

      const durationDays =
        Number(stake.durationDays || 30);

      const durationMs =
        durationDays * ONE_DAY_MS;

      const endTime =
        startTime + durationMs;

      const isMatured =
        now >= endTime;

      // =====================================================
      // 5. STAKE DATA
      // =====================================================

      const amount =
        Number(stake.amount || 0);

      const roi =
        Number(stake.roi || 0);

      // =====================================================
      // 6. MONTHLY ROI
      // =====================================================

      const monthlyInterest =
        (amount * roi) / 100;

      // =====================================================
      // 7. DAILY ROI
      // =====================================================

      const dailyInterest =
        monthlyInterest / 30;

      // =====================================================
      // 8. TOTAL ROI POSSIBLE
      // =====================================================

      const totalRoiPossible =
        dailyInterest * durationDays;

      // =====================================================
      // 9. ALREADY CLAIMED ROI
      // =====================================================

      const alreadyClaimed =
        Number(stake.claimedAmount || 0);

      // =====================================================
      // 10. ELAPSED TIME FROM ORIGINAL STAKE
      // =====================================================

      const elapsedFromStartMs =
        Math.max(
          0,
          Math.min(
            now - startTime,
            durationMs
          )
        );

      // =====================================================
      // 11. COMPLETED DAYS
      // =====================================================

      const completedDaysSinceStart =
        Math.floor(
          elapsedFromStartMs /
            ONE_DAY_MS
        );

      // =====================================================
      // 12. TOTAL GENERATED ROI
      // =====================================================

      const totalGeneratedInterest =
        Math.min(
          totalRoiPossible,
          completedDaysSinceStart *
            dailyInterest
        );

      // =====================================================
      // 13. REMAINING ROI
      // =====================================================

      const remainingRoi =
        Math.max(
          0,
          totalRoiPossible -
            alreadyClaimed
        );

      // =====================================================
      // 14. CLAIMABLE ROI
      // =====================================================

      let claimAmount =
        Math.max(
          0,
          totalGeneratedInterest -
            alreadyClaimed
        );

      // =====================================================
      // 15. MATURITY
      //
      // At maturity:
      // User can claim ALL remaining ROI
      // AND unstake principal.
      // =====================================================

      if (isMatured) {
        claimAmount =
          remainingRoi;
      }

      // =====================================================
      // 16. SAFETY LIMIT
      // =====================================================

      claimAmount =
        Math.min(
          claimAmount,
          remainingRoi
        );

      claimAmount =
        Math.max(
          0,
          claimAmount
        );

      // =====================================================
      // 17. NO ROI AVAILABLE BEFORE MATURITY
      // =====================================================

      if (
        claimAmount <=
          0.000001 &&
        !isMatured
      ) {
        const nextGeneratedTime =
          startTime +
          (
            completedDaysSinceStart + 1
          ) *
            ONE_DAY_MS;

        const remainingMs =
          Math.max(
            0,
            Math.min(
              nextGeneratedTime - now,
              endTime - now
            )
          );

        const remainingSeconds =
          Math.ceil(
            remainingMs / 1000
          );

        const hours =
          Math.floor(
            remainingSeconds / 3600
          );

        const minutes =
          Math.floor(
            (
              remainingSeconds % 3600
            ) / 60
          );

        const seconds =
          remainingSeconds % 60;

        return res.status(400).json({
          success: false,

          message:
            "No completed 24-hour ROI available",

          cooldown: {
            hours,
            minutes,
            seconds,
            remainingMs,
          },

          nextClaimAt:
            new Date(
              nextGeneratedTime
            ).toISOString(),

          dailyInterest:
            dailyInterest.toFixed(6),

          generatedRoi:
            totalGeneratedInterest.toFixed(6),

          alreadyClaimed:
            alreadyClaimed.toFixed(6),

          claimableInterest:
            "0.000000",
        });
      }

      // =====================================================
      // 18. MATURITY PAYOUT
      // =====================================================
      //
      // At maturity:
      //
      // Principal + remaining ROI
      //
      // Example:
      //
      // Principal = 100
      // Remaining ROI = 177
      //
      // User receives:
      //
      // 100 + 177 = 277 TWON
      //
      // Stake is then CLOSED.
      // =====================================================

  

      if (isMatured) {
        principalReturned = amount;

        totalPayout =
          principalReturned +
          claimAmount;
      }

      // =====================================================
      // 19. NEW CLAIMED ROI
      // =====================================================

      const newClaimedAmount =
        alreadyClaimed +
        claimAmount;

      // =====================================================
      // 20. UPDATE USER BALANCE
      // =====================================================
      //
      // Before maturity:
      //
      // Only ROI is added.
      //
      // At maturity:
      //
      // ROI + PRINCIPAL is added.
      // =====================================================

      const principalReturned = isMatured
  ? amount
  : 0;

const totalPayout =
  claimAmount +
  principalReturned;

  const updatedUser =
  await User.findOneAndUpdate(
    {
      id: userId,
    },
    {
      $inc: {
        total_balance:
          totalPayout,
      },
    },
    {
      new: true,
    }
  );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // =====================================================
      // 21. UPDATE STAKE
      // =====================================================

      const stakeUpdate = {
        claimedAmount:
          newClaimedAmount,

        lastClaimedAt:
          new Date(),

        earnedRoi:
          newClaimedAmount,
      };

      // =====================================================
      // 22. CLOSE STAKE AT MATURITY
      // =====================================================

      if (isMatured) {
        stakeUpdate.status =
          "Completed";
      }

      await Stake.findByIdAndUpdate(
        stakeId,
        {
          $set: stakeUpdate,
        }
      );

      // =====================================================
      // 23. REMAINING ROI
      // =====================================================

      const remainingRoiAfterClaim =
        Math.max(
          0,
          totalRoiPossible -
            newClaimedAmount
        );

      // =====================================================
      // 24. ALL ROI CLAIMED
      // =====================================================

      const allRoiClaimed =
        remainingRoiAfterClaim <=
        0.000001;

      // =====================================================
      // 25. NEXT CLAIM
      // =====================================================

      let nextClaimAt = null;

      if (
        !isMatured &&
        !allRoiClaimed
      ) {
        const nextGeneratedTime =
          startTime +
          (
            completedDaysSinceStart + 1
          ) *
            ONE_DAY_MS;

        nextClaimAt =
          new Date(
            nextGeneratedTime
          ).toISOString();
      }

      // =====================================================
      // 26. LOG
      // =====================================================

      console.log(
        "================================="
      );

      console.log(
        "STAKE CLAIM SUCCESSFUL"
      );

      console.log(
        "Stake ID:",
        stakeId
      );

      console.log(
        "User ID:",
        userId
      );

      console.log(
        "Principal:",
        amount
      );

      console.log(
        "Monthly ROI %:",
        roi
      );

      console.log(
        "Monthly Interest:",
        monthlyInterest
      );

      console.log(
        "Daily Interest:",
        dailyInterest
      );

      console.log(
        "Duration:",
        durationDays
      );

      console.log(
        "Completed Days:",
        completedDaysSinceStart
      );

      console.log(
        "Generated ROI:",
        totalGeneratedInterest
      );

      console.log(
        "Previous Claimed ROI:",
        alreadyClaimed
      );

      console.log(
        "Current ROI Claim:",
        claimAmount
      );

      console.log(
        "Principal Returned:",
        principalReturned
      );

      console.log(
        "Total Payout:",
        totalPayout
      );

      console.log(
        "Total ROI Claimed:",
        newClaimedAmount
      );

      console.log(
        "Remaining ROI:",
        remainingRoiAfterClaim
      );

      console.log(
        "Matured:",
        isMatured
      );

      console.log(
        "Stake Status:",
        isMatured
          ? "Completed"
          : "Active"
      );

      console.log(
        "New Balance:",
        updatedUser.total_balance
      );

      console.log(
        "================================="
      );

      // =====================================================
      // 27. RESPONSE
      // =====================================================

      return res.json({
        success: true,

        // ROI paid in this transaction
        payout:
          totalPayout.toFixed(6),

        roiEarned:
          claimAmount.toFixed(6),

        // Principal returned at maturity
        principalReturned:
          principalReturned.toFixed(6),

        // Total money added to balance
        totalPayout:
          totalPayout.toFixed(6),

        // Total ROI claimed
        totalClaimed:
          newClaimedAmount.toFixed(6),

        monthlyInterest:
          monthlyInterest.toFixed(6),

        dailyInterest:
          dailyInterest.toFixed(6),

        totalRoi:
          totalRoiPossible.toFixed(6),

        generatedRoi:
          totalGeneratedInterest.toFixed(6),

        remainingRoi:
          remainingRoiAfterClaim.toFixed(6),

        daysSinceStart:
          completedDaysSinceStart,

        matured:
          isMatured,

        unstaked:
          isMatured,

        stakeStatus:
          isMatured
            ? "Completed"
            : "Active",

        allRoiClaimed,

        nextClaimAt,

        newBalance:
          updatedUser.total_balance,
      });

    } catch (error) {
      console.error(
        "Staking Claim Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Internal server error",
      });
    }
  }
);

// ================= LOGGER =================
function writeLog(message, type = "INFO") {
  if (process.env.DEBUG !== "true") return;
  console.log(`[${new Date().toISOString()}][${type}]`, message);
}


// ================= TELEGRAM =================
async function sendTelegramMessage(chatId:string, text:string) {
  try {
    writeLog(`Sending message to ${chatId}`, "TG");
    await axios.get(apiUrl + "sendMessage", {
      params: {
        chat_id: chatId,
        text,
        parse_mode: "HTML"
      }
    });
  } catch (err) {
    writeLog(JSON.stringify(err.response?.data || err.message), "ERROR");
  }
}


async function sendTelegramPhoto(chatId, photoPath, caption, keyboard = []) {
  try {
    writeLog(`Sending photo to ${chatId}`, "TG");
    writeLog(`Photo path: ${photoPath}`, "TG");

    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("photo", fs.createReadStream(photoPath));
    form.append("caption", caption);
    form.append("parse_mode", "HTML");
    form.append(
      "reply_markup",
      JSON.stringify({ inline_keyboard: keyboard })
    );

    await axios.post(apiUrl + "sendPhoto", form, {
      headers: form.getHeaders()
    });

    writeLog("Photo sent successfully", "TG");
  } catch (err) {
    writeLog(JSON.stringify(err.response?.data || err.message), "ERROR");
  }
}


// ================= WEBHOOK =================
app.post("/webhook", async (req, res) => {
  try {
    writeLog("Webhook triggered", "WEBHOOK");
    writeLog(req.body, "RAW");

    const update = req.body;
    if (!update?.message) return res.sendStatus(200);

    const message = update.message;

    const chatId = message?.chat?.id;
    const text = message?.text;
    const userId = message?.from?.id;
    const firstName = message?.from?.first_name || "";
    const lastName = message?.from?.last_name || "";
    const username = message?.from?.username || "";
    const isPremium = message?.from?.is_premium || false;
    const chatType = message?.chat?.type;

    writeLog({ chatId, text, userId, chatType }, "MESSAGE");

 if (MAINTAIN) {
  await sendTelegramMessage(
    chatId,
    "System under maintenance."
  );

  return res.sendStatus(200);
}

    if (chatType !== "private" || !chatId || !text) {
      return res.sendStatus(200);
    }

    // ================= START =================
    if (text.startsWith("/start")) {
      writeLog("START command detected", "START");

      let referrerId = null;
      let source = "direct";

      const payload = text.replace("/start", "").trim();
      const parts = payload.split("_");

      if (parts[0]) referrerId = parts[0].replace("r", "");
      if (parts[1]) source = parts[1];

      writeLog({ referrerId, source }, "REF");

      if (referrerId === String(userId)) {
        return await sendTelegramMessage(chatId, "You can't refer yourself.");
      }

      let referrerData = null;

      if (referrerId) {
        writeLog(`Checking referrer: ${referrerId}`, "REF");
        referrerData = await User.findOne({"id":referrerId});

        writeLog(`Referrer exists: ${!!referrerData}`, "REF");

        if (!referrerData) {
          await sendTelegramMessage(chatId, "Invalid referral link.");
          referrerId = null;
        }
      }

      writeLog(`Checking existing user: ${userId}`, "DB");
      const existingUser = await User.findOne({"id":userId});
      writeLog(`Existing user found: ${!!existingUser}`, "DB");

      if (!existingUser) {
        writeLog("User not found → inserting", "FLOW");
      await new User({
        id: userId,
        fullName: `${firstName} ${lastName}`,
        username: username,
        firstName: firstName,
        lastName: lastName,
        total_balance:0,
        referred_by:referrerId,
        isPremium:isPremium,
        source:source,
      }).save();

        if (referrerId) {
          const notifyName = username || `${firstName} ${lastName}`;
          writeLog(`Notifying referrer: ${referrerId}`, "REF");

          await sendTelegramMessage(
            referrerId,
            `🎉 Congrats! Your friend ${notifyName} joined using your referral link!`
          );
        }
      }

      const referralLink = `${APP_URL}?ref=${userId}`;
      const caption = `👋 Welcome to ${APP_NAME}`;

      const keyboard = [
        [
          {
            text: "⛏️ Start Mining Now",
            web_app: { url: referralLink }
          }
        ]
      ];

      await sendTelegramPhoto(
        chatId,
        "./public/banner.jpg",
        caption,
        keyboard
      );
    }

    res.sendStatus(200);
  } catch (err) {
    writeLog(err.stack || err, "FATAL");
    res.sendStatus(200);
  }
});





async function startServer() {
  try {
    await connectDB();
     

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },

      });
      app.use(vite.middlewares);
    } else {
      app.use(express.static(path.join(__dirname, "dist")));
      app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "dist", "index.html"));
      });
    }




    app.listen(SERVER_PORT, "0.0.0.0", async () => {
      console.log(`Server running on Port ${SERVER_PORT}`);
       //await seedConfig();
      // Seed initial data after connection is established
      // await seedTasks();
      // await seedUsers();
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

startServer();
