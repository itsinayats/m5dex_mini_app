import React, { useState } from "react";
import {
  Twitter,
  Wallet,
  Zap,
  Loader2,
  ShieldCheck,
  Send,
  Users,
  Cpu,
  Play,
  Gift,
  Instagram,
  Youtube,
  ExternalLink,
  CircleCheck,
} from "lucide-react";

import { Task } from "../types";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import YouTubeTaskModal from "./YouTubeTaskModal";

interface TaskItemProps {
  task: Task;
  onComplete: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete }) => {
  const [loading, setLoading] = useState(false);

  // youtube
  const [showYT, setShowYT] = useState(false);
  const [ytVerified, setYtVerified] = useState(false);

  // completed task but reward not claimed yet
  const [taskReadyToClaim, setTaskReadyToClaim] = useState(false);

  const navigate = useNavigate();

  const {
    user,
    checkChatMember,
    config,
    setShowTonTaskModal,
    friends
  } = useAppContext();

  // ================= ICON =================
  const getTaskIcon = () => {
    const t = (task as any).type;

    if (t === "youtube") return <Youtube size={18} />;
    if (t === "twitter") return <Twitter size={18} />;
    if (t === "telegram") return <Send size={18} />;
    if (t === "ton") return <Wallet size={18} />;
    if (t === "instagram") return <Instagram size={18} />;
    if (t === "external") return <Cpu size={18} />;
    if (t === "referral") return <Users size={18} />;

    return <Users size={18} />;
  };

  // ================= BUTTON ICON =================
  const getButtonIcon = () => {
    // COMPLETED
    if (task.completed_at) {
      return <CircleCheck size={18} />;
    }

    // LOADING
    if (loading) {
      return <Loader2 size={18} className="animate-spin" />;
    }

    // READY TO CLAIM
    if (taskReadyToClaim) {
      return <Gift size={18} />;
    }

    // DEFAULT
    return <ExternalLink size={18} />;
  };

  // ================= BUTTON STYLE =================
  const getButtonClass = () => {
    if (task.completed_at) {
      return "bg-emerald-600 text-white";
    }

    if (taskReadyToClaim) {
      return "bg-yellow-600 text-white";
    }

    return "bg-white text-black";
  };


  // ================= MAIN ACTION =================
  const handleAction = async () => {
    if (task.completed_at || loading) return;

    const taskData = task as any;
    setLoading(true);

    try {
      // ================= REFERRAL =================
      if (taskData.type === "referral") {
        if(!taskReadyToClaim){
        const required = taskData.referral_count
       const have =  friends.length
        if(have >=required){
           setTimeout(() => {
            setTaskReadyToClaim(true);
            setLoading(false);
          }, 1500);
        }else{
             navigate("/friends");
             setLoading(false);
        }
        return;
      }else{ // CLAIM
        onComplete(task);
        setLoading(false);
        return;
      }
      }

      // ================= TELEGRAM =================
    if (taskData.type === "telegram") {

  // ============================================================
  // FIRST CLICK → OPEN TELEGRAM CHANNEL
  // ============================================================

  if (!taskReadyToClaim) {

    openTelegramChannel(taskData.link);

    // IMPORTANT:
    // Do NOT immediately mark it claimable.
    //
    // User must return to the Mini App and click the button again.
    setTaskReadyToClaim(true);

    setLoading(false);

    return;
  }

  // ============================================================
  // SECOND CLICK → VERIFY MEMBERSHIP
  // ============================================================

  try {
    setLoading(true);

    const res = await checkChatMember(user?.id || "");

    console.log(
      "Telegram membership verification:",
      res
    );

    const status =
      res?.result?.status;

    const isMember = [
      "member",
      "administrator",
      "creator",
    ].includes(status);

    if (isMember) {
      await onComplete(task);
    } else {
      alert(
        "Please join the Telegram channel first, then try again."
      );
    }

  } catch (error) {
    console.error(
      "Telegram verification error:",
      error
    );

    alert(
      "Unable to verify Telegram membership. Please try again."
    );

  } finally {
    setLoading(false);
  }

  return;
}
      // ================= TWITTER =================
      if (taskData.type === "twitter") {
        if (!taskReadyToClaim) {
          openLink(taskData.link);

          setTimeout(() => {
            setTaskReadyToClaim(true);
            setLoading(false);
          }, 1500);

          return;
        }

        // CLAIM
        await onComplete(task);
        setLoading(false);
        return;
      }

      // ================= INSTAGRAM =================
      if (taskData.type === "instagram") {
        if (!taskReadyToClaim) {
          openLink(taskData.link);

          setTimeout(() => {
            setTaskReadyToClaim(true);
            setLoading(false);
          }, 1500);

          return;
        }

        // CLAIM
        await onComplete(task);
        setLoading(false);
        return;
      }

      // ================= EXTERNAL =================
      if (taskData.type === "external") {
        // FIRST CLICK
        if (!taskReadyToClaim) {
          openLink(taskData.link);

          setTimeout(() => {
            setTaskReadyToClaim(true);
            setLoading(false);
          }, 1500);

          return;
        }

        // CLAIM
        await onComplete(task);
        setLoading(false);
        return;
      }

      // ================= YOUTUBE =================
      if (taskData.type === "youtube") {
        // FIRST CLICK
        if (!taskReadyToClaim) {
          setShowYT(true);
          setLoading(false);
          return;
        }

        // CLAIM
        if (ytVerified) {
          await onComplete(task);
        } else {
          alert("Watch at least 80% of video first");
        }
        setLoading(false);
        return;
      }

      // ================= GRAM =================
      if (taskData.type === "ton") {
        if (!taskReadyToClaim) {
          setShowTonTaskModal(task);
          setLoading(false);
          return;
        }

        // CLAIM
        await onComplete(task);
        setLoading(false);
        return;
      }

      // DEFAULT
      await onComplete(task);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const playVideo = ()=>{
          setShowYT(true);
          setLoading(false);
          return;
  }



  const openLink = (link?: string) => {
  if (!link) return;

  if (window.Telegram?.WebApp?.openLink) {
    window.Telegram.WebApp.openLink(link);
  } else {
    window.open(link, "_blank");
  }
};

const openTelegramChannel = (link?: string) => {
  if (!link) return;

  // Make sure it's a Telegram URL
  let telegramLink = link.trim();

  if (telegramLink.startsWith("@")) {
    telegramLink = `https://t.me/${telegramLink.substring(1)}`;
  }

  if (
    telegramLink.startsWith("t.me/") ||
    telegramLink.startsWith("www.t.me/")
  ) {
    telegramLink = `https://${telegramLink}`;
  }

  if (
    window.Telegram?.WebApp?.openTelegramLink
  ) {
    window.Telegram.WebApp.openTelegramLink(
      telegramLink
    );
  } else {
    window.open(
      telegramLink,
      "_blank"
    );
  }
};

  return (
    <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 overflow-hidden">

      <div className="bg-[#0F172A] rounded-2xl p-4 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-white">
            {getTaskIcon()}
          </div>

          <div>
            <h4 className="text-white text-xs font-bold">
              {task.title}
            </h4>

            <p className="text-cyan-400 text-xs mt-1">
              +{task.reward.toLocaleString()} {config?.coin_ticker}
            </p>
            
            {task.type=="youtube" && <button className="text-slate-600 text-sm"  onClick={playVideo}>Watch this video Again</button>}
            
            
          </div>
        </div>

        {/* ACTION BUTTON */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleAction}
          disabled={loading}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${getButtonClass()}`}
        >
          {getButtonIcon()}
        </motion.button>
      </div>

      {/* ================= YOUTUBE MODAL ================= */}
      {showYT && (
        <YouTubeTaskModal
          videoId={
            task.link
          }
          onClose={() => setShowYT(false)}
          onComplete={() => {
            // user watched 80%
            setYtVerified(true);

            // show claim button
            setTaskReadyToClaim(true);

            // close modal
            setShowYT(false);
          }}
        />
      )}
    </div>
  );
};

export default TaskItem;