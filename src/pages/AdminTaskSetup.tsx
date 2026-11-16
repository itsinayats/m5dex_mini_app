import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, Save, Globe, Zap, Coins, Hash } from "lucide-react";
import { useAppContext } from "../context/AppContext";
export default function AdminTaskSetup() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [form, setForm] = useState({
    id: "",
    title: "",
    reward: "",
    link: "",
    ton_price: "",
    type: "",
    referral_count:"",
    chat_id:""
  });

    const { config } = useAppContext();
  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : "";

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  const loadTasks = async () => {
    try {
      const res = await fetch("/api/admin/tasks", { headers });
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks", err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const saveTask = async () => {
    const method = tasks.find(t => t.id === form.id) ? "PUT" : "POST";
    const url = method === "PUT"
      ? `/api/admin/tasks/${form.id}`
      : "/api/admin/tasks";

    await fetch(url, {
      method,
      headers,
      body: JSON.stringify({
        ...form,
        reward: Number(form.reward),
        ton_price: Number(form.ton_price)
      })
    });

    setForm({ id: "", title: "", reward: "", link: "", ton_price: "", type: "" ,referral_count:"",chat_id:""});
    loadTasks();
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/admin/tasks/${id}`, { method: "DELETE", headers });
    loadTasks();
  };

  return (
    <div className="min-h-screen bg-[#07090c] text-neutral-200 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <span className="bg-brand-500/20 text-brand-400 p-2 rounded-xl border border-brand-500/30">
              <Zap size={24} />
            </span>
            Task Engine
          </h1>
          <p className="text-neutral-500 text-sm">Create and distribute earning opportunities for users.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Editor Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-10 bg-neutral-900/50 backdrop-blur-md border border-white/5 rounded-[2rem] p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Plus size={18} className="text-brand-400" />
                {form.id ? "Update Task" : "New Task"}
              </h2>

              <div className="space-y-4">
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1 mb-1 block group-focus-within:text-brand-400 transition-colors">Task ID</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-2.5 text-neutral-600" size={16} />
                    <input className="w-full bg-neutral-950/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-brand-500/50 outline-none transition-all"
                      placeholder="e.g. 1,2,3..."
                      value={form.id}
                      onChange={e => setForm({ ...form, id: e.target.value })}
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1 mb-1 block group-focus-within:text-brand-400 transition-colors">Task Title</label>
                  <input className="w-full bg-neutral-950/50 border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-brand-500/50 outline-none transition-all"
                    placeholder="Join our Telegram"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1 mb-1 block group-focus-within:text-brand-400 transition-colors">Reward</label>
                    <input className="w-full bg-neutral-950/50 border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-brand-500/50 outline-none transition-all"
                      placeholder="5000"
                      value={form.reward}
                      onChange={e => setForm({ ...form, reward: e.target.value })}
                    />
                  </div>
                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1 mb-1 block group-focus-within:text-brand-400 transition-colors">Type</label>
                    <select className="w-full bg-neutral-950/50 border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-brand-500/50 outline-none transition-all appearance-none cursor-pointer"
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value })}
                    >
                      <option value="">Select Type</option>
                      <option value="telegram">Telegram Channel</option>
                      <option value="twitter">Twitter</option>
                      <option value="external">External Link</option>
                      <option value="referral">Referral</option>
                      <option value="ton">GRAM</option>
                       <option value="youtube">Youtube</option>
                       <option value="instagram">Instagram</option>
                      
                    </select>
                  </div>
                </div>

                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1 mb-1 block group-focus-within:text-brand-400 transition-colors">Link / URL</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 text-neutral-600" size={16} />
                    <input className="w-full bg-neutral-950/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-brand-500/50 outline-none transition-all"
                      placeholder="https://t.me/..."
                      value={form.link}
                      onChange={e => setForm({ ...form, link: e.target.value })}
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1 mb-1 block group-focus-within:text-brand-400 transition-colors">CHAT ID (For channels Only)</label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-2.5 text-neutral-600" size={16} />
                    <input className="w-full bg-neutral-950/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-brand-500/50 outline-none transition-all"
                      placeholder="0.5"
                      value={form.chat_id}
                      onChange={e => setForm({ ...form, chat_id: e.target.value })}
                    />
                  </div>
                </div>


                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1 mb-1 block group-focus-within:text-brand-400 transition-colors">Entry Price (GRAM)</label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-2.5 text-neutral-600" size={16} />
                    <input className="w-full bg-neutral-950/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-brand-500/50 outline-none transition-all"
                      placeholder="0.5"
                      value={form.ton_price}
                      onChange={e => setForm({ ...form, ton_price: e.target.value })}
                    />
                  </div>
                </div>

                 <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1 mb-1 block group-focus-within:text-brand-400 transition-colors">Referral Required (only for referral type)</label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-2.5 text-neutral-600" size={16} />
                    <input className="w-full bg-neutral-950/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-brand-500/50 outline-none transition-all"
                      placeholder="0.5"
                      value={form.referral_count}
                      onChange={e => setForm({ ...form, referral_count: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  onClick={saveTask}
                  className="w-full mt-4 bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(255,224,0,0.3)] flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save Task
                </button>
              </div>
            </div>
          </div>

          {/* Task List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-4 mb-2">
               <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">Live Tasks ({tasks.length})</span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {tasks.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem]">
                  <p className="text-neutral-500">No tasks created yet.</p>
                </div>
              )}
              {tasks?.map(task => (
                <div key={task.id} className="group relative overflow-hidden bg-neutral-900/40 border border-white/5 hover:border-brand-500/30 rounded-2xl p-5 transition-all">
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-400 border border-brand-500/20">
                        {task.type === 'social' ? <Globe size={20}/> : <Zap size={20}/>}
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-brand-300 transition-colors">{task.id} : {task.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-green-500/10 text-green-400 rounded-md border border-green-500/20">
                            +{task.reward} {config?.coin_ticker}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-neutral-800 text-neutral-400 rounded-md border border-white/5 uppercase tracking-tighter">
                            {task.type}
                          </span>
                          {task.ton_price > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-500/10 text-brand-400 rounded-md border border-brand-500/20">
                              {task.ton_price} GRAM
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setForm(task);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="p-2 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                      >
                        <Edit3 size={18} />
                      </button>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
