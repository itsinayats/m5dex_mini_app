import React, { useState } from "react";
import axios from "axios";
import { useAppContext } from "../context/AppContext";
import { Send, Wallet, Coins, CheckCircle, AlertCircle, Loader2, Cpu } from "lucide-react";

const AdminFakeWithdrawal: React.FC = () => {
  const [formData, setFormData] = useState({
    amount_ton: "",
    walletAddress: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; msg: string }>({
    type: null,
    msg: "",
  });

  const { adminToken } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, msg: "" });

    try {
      const response = await axios.post("/api/admin/addFakeWithdrawal", formData, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (response.data.success) {
        setStatus({
          type: "success",
          msg: `ENTRY LOGGED: User ID ${response.data.data.user_id}`,
        });
        setFormData({ amount_ton: "", walletAddress: "" });
      }
    } catch (error: any) {
      setStatus({
        type: "error",
        msg: error.response?.data?.message || "TRANSACTION_FAILED",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatedVisa = Number(formData.amount_ton) / 0.0001 || 0;

  return (
    <div className="min-h-screen bg-[#0a0c10] p-6 flex items-center justify-center font-sans selection:bg-cyan-500/30">
      <div className="w-full max-w-md bg-[#161b22] rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0d1117] border-b border-gray-800 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-500" />
              Ghost Protocol
            </h2>
            <p className="text-gray-500 text-xs mt-1 font-mono uppercase tracking-widest">Admin Withdrawal Injection</p>
          </div>
          <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-2">
              <Coins className="w-3.5 h-3.5" />
              Injection Amount (GRAM)
            </label>
            <div className="relative group">
              <input
                type="number"
                step="any"
                value={formData.amount_ton}
                onChange={(e) => setFormData({ ...formData, amount_ton: e.target.value })}
                className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-xl text-cyan-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-gray-600 font-mono"
                placeholder="0.00"
                required
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-gray-800 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                Asset: GRAM
              </div>
            </div>
            
            {/* Calculation Preview Box */}
            <div className="mt-2 p-3 bg-cyan-950/20 border border-cyan-900/30 rounded-lg">
              <div className="flex justify-between text-[11px] font-mono text-cyan-600/80 uppercase">
                <span>Visa Equivalent</span>
                <span className="text-cyan-400 font-bold">{calculatedVisa.toLocaleString()} VISA</span>
              </div>
            </div>
          </div>

          {/* Wallet Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5" />
              Destination Address
            </label>
            <input
              type="text"
              value={formData.walletAddress}
              onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
              className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-xl text-gray-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-gray-600 font-mono text-sm"
              placeholder="Destination hash..."
              required
            />
          </div>

          {/* Status Alert */}
          {status.type && (
            <div className={`flex items-center gap-3 p-4 rounded-xl text-xs font-mono border ${
              status.type === "success" 
                ? "bg-green-500/10 text-green-400 border-green-500/20" 
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}>
              {status.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span className="uppercase tracking-tight">{status.msg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 
              ${loading 
                ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                : "bg-cyan-600 hover:bg-cyan-500 text-black shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_25px_rgba(8,145,178,0.5)] active:scale-95"}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Executing...
              </>
            ) : (
              "Initialize Injection"
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="bg-[#0d1117] px-6 py-4 border-t border-gray-800 flex justify-center gap-6">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> PENDING
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> FAKE_TAG
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFakeWithdrawal;