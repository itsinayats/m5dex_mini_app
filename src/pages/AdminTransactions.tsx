import React, { useState, useEffect } from "react";
import { Transaction } from "../types";
import { useAppContext } from "../context/AppContext";
import { History, Search, X, ExternalLink, ArrowUpRight, ArrowDownLeft, Pickaxe, Users, Trophy, CheckCircle2, Gift } from "lucide-react";

const AdminTransactions: React.FC = () => {
  const [adminTransactions, setAdminTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { adminToken,config } = useAppContext();



const fetchAdminTransactions = async (
  page = 1,
  query = "",
  signal?: AbortSignal
) => {
  try {
    const res = await fetch(
      `/api/admin/transactions?page=${page}&query=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        signal,
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch transactions: ${res.status}`);
    }

    const result = await res.json();

    setAdminTransactions(result.data || []);
    setTotalPages(result.totalPages || 1);
    setCurrentPage(result.page || 1);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return;
    }

    console.error("Error fetching admin transactions:", error);
    setAdminTransactions([]);
  }
};

useEffect(() => {
  if (!adminToken) return;

  const controller = new AbortController();

  // Debounce search requests by 300ms.
  const timeoutId = setTimeout(() => {
    fetchAdminTransactions(currentPage, searchQuery.trim(), controller.signal);
  }, 300);

  return () => {
    clearTimeout(timeoutId);
    controller.abort();
  };
}, [adminToken, currentPage, searchQuery]);





  const getIcon = (type: string) => {
    switch (type) {
      case 'mining': return <Pickaxe size={14} />;
      case 'task': return <CheckCircle2 size={14} />;
      case 'ton_task': return <ArrowUpRight size={14} />;
      case 'boost_rank': return <Trophy size={14} />;
      case 'referral': return <Users size={14} />;
      case 'checkin': return <Gift size={14} />;
      case 'withdrawal': return <ArrowDownLeft size={14} />;
      default: return <History size={14} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mining': return 'text-blue-400';
      case 'task': return 'text-green-400';
      case 'ton_task': return 'text-purple-400';
      case 'boost_rank': return 'text-yellow-400';
      case 'withdrawal': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <History className="text-blue-500" size={32} />
          <h1 className="text-3xl font-black uppercase tracking-tighter">Transaction Logs</h1>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
         <input
  type="text"
  placeholder="Search by name, ID, or hash..."
  value={searchQuery}
  onChange={(e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }}
  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-10 text-xs font-bold focus:outline-none focus:border-blue-500 transition-colors"
/>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase font-black text-gray-500 border-b border-white/5">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Hash (Trash)</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {adminTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 uppercase text-xs font-bold tracking-widest">
                    {searchQuery ? "No transactions match your search" : "No transactions found"}
                  </td>
                </tr>
              ) : (
                adminTransactions?.map((tx) => (
                  <tr key={tx._id} className="text-xs font-bold hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black">{tx.username || "Anonymous"}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{tx.user_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1.5 uppercase text-[9px] ${getTypeColor(tx.type)}`}>
                        {getIcon(tx.type)}
                        {tx.type.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 max-w-[200px] truncate">
                      {tx.description}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={tx.type === 'withdrawal' ? 'text-red-400' : 'text-green-400'}>
                          {tx.type === 'withdrawal' ? '-' : '+'}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {config?.coin_ticker}
                        </span>
                        {tx.amount_ton > 0 && (
                          <span className="text-[9px] text-blue-400">{tx.amount_ton.toFixed(2)} GRAM</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {tx.hash ? (
                        <a 
                          href={`https://tonviewer.com/transaction/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors group"
                        >
                          <span className="font-mono text-[10px] max-w-[100px] truncate">{tx.hash}</span>
                          <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ) : (
                        <span className="text-gray-600">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-xl border border-white/10 text-xs font-bold uppercase transition-all ${
              currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            Previous
          </button>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-xl border border-white/10 text-xs font-bold uppercase transition-all ${
              currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;
