import React from "react";
import { motion } from "framer-motion";
import { LayoutGrid, ClipboardCheck, Sparkles, Orbit } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import TaskItem from "../components/TaskItem";
import TonTaskModal from "../components/TonTaskModal";

const Tasks: React.FC = () => {

  const { user, tasks, handleTaskComplete,config } = useAppContext();
  if (!user) return null;

  const allTasks = tasks || [];
  const pendingCount = allTasks.filter((t) => !t.completed_at).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-6 space-y-8 pb-24 text-white selection:bg-brand-500/30"
    >
      {/* Page Header */}
      <div className="pt-6 text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-500/10 via-brand-500/10 to-brand-500/10 px-3 py-1 rounded-full border border-white/10 mb-2">
            <Orbit size={12} className="text-brand-400 animate-spin-slow" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-brand-400 via-brand-400 to-brand-400 bg-clip-text text-transparent">
                {config?.coin_ticker}  Network
            </span>
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase bg-gradient-to-r from-brand-400 via-brand-300 via-brand-400 to-brand-400 bg-clip-text text-transparent">
            Task & Earn
        </h1>
        <p className="text-neutral-500 text-[9px] uppercase  font-black">
          Earn Free <span className="bg-gradient-to-r from-brand-400 via-brand-400 to-brand-400 bg-clip-text text-transparent">{config?.coin_ticker} </span> completing simple tasks
        </p>
      </div>

      {/* Rainbow Summary Card */}
      <div className="group relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-br from-brand-500 via-brand-500 to-brand-500 animate-gradient-xy shadow-2xl shadow-brand-500/20">
        <div className="relative z-10 bg-[#171b22]/95 backdrop-blur-2xl rounded-[23px] p-5">
            {/* Decorative Background Glows */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand-600/20 blur-[40px] rounded-full" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-600/20 blur-[40px] rounded-full" />
            
            <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Uncompleted Tasks</h3>
                    <p className="text-xl font-black text-white uppercase tracking-tight">
                        {pendingCount} <span className="text-sm font-medium bg-gradient-to-r from-brand-400 to-brand-400 bg-clip-text text-transparent ml-3"> Pending Tasks</span>
                    </p>
                </div>
                <div className="bg-gradient-to-br from-brand-500 via-brand-600 to-brand-500 p-3 rounded-2xl shadow-[0_0_20px_rgba(255,224,0,0.4)]">
                    <ClipboardCheck size={20} className="text-neutral-950" />
                </div>
            </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <LayoutGrid size={14} className="text-brand-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Complete Tasks to Earn rewards</h2>
          </div>
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
        </div>

        <div className="space-y-3">
          {allTasks.length > 0 ? (
            allTasks?.map((task) => (
              <div key={task.id} className="relative group">
                {/* Full spectrum hover border */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 via-brand-500 to-brand-500 rounded-2xl opacity-0 group-hover:opacity-20 transition duration-700 blur-sm" />
                
                <TaskItem 
                  task={task} 
                  onComplete={task.completed_at ? () => {} : handleTaskComplete} 
                />
              </div>
            ))
          ) : (
            <div className="relative overflow-hidden group text-center py-12 bg-[#171b22]/50 rounded-3xl border border-dashed border-white/10 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 via-brand-500/5 to-brand-500/5" />
              <Sparkles size={24} className="mx-auto mb-2 text-yellow-400 opacity-60 animate-bounce" />
              <p className="relative z-10 text-neutral-500 text-[10px] font-black uppercase tracking-widest">
                Spectrum Fully Synchronized
              </p>
            </div>
          )}
        </div>
      </div>

      <TonTaskModal />
    </motion.div>
  );
};

export default Tasks;
