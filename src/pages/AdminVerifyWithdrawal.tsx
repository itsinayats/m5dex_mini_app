import React, { useState } from "react";
import axios from "axios";
import { useAppContext } from "../context/AppContext";

const AdminVerifyWithdrawal: React.FC = () => {
  const { adminToken,config } = useAppContext();
  const [userId, setUserId] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>();
  

  const handleSearch = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await axios.post(
        "/api/admin/verifyTransactionLimit",
        { userId },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      setResults(response.data.data);
      console.log(response.data.user)
      setUser(response.data.user);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };



  const handleVerify = async (id: string, currentStatus: boolean) => {
  const confirm = window.confirm(
    `Are you sure you want to ${currentStatus ? "unverify" : "verify"} this transaction?`
  );
  if (!confirm) return;

  try {
    await axios.post(
      "/api/admin/verify/transaction",
      {
        id,
        verified: !currentStatus,
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    // Update UI locally
    setResults((prev) =>
      prev?.map((tx) =>
        tx._id === id ? { ...tx, verified: !currentStatus } : tx
      )
    );
  } catch (error) {
    console.error("Verification failed", error);
    alert("Failed to update verification");
  }
};

  // --- Calculations ---
  const sumByType = (type: string) => 
    results.filter(tx => tx.type === type).reduce((acc, curr) => acc + (curr.amount_ton || 0), 0);

  const tonTaskSum = sumByType("ton_task");
  const mining_boost = sumByType("mining_boost");
  const rankBoostSum = sumByType("boost_rank");
  const refCommissionSum = sumByType("referral_commisssion")

  const totalinvestment = tonTaskSum + mining_boost + rankBoostSum;

  const maxLimit = user?.total_deposit *  config?.withdrawtimes;
  const avlLimit = maxLimit - user?.total_withdrawal;

  // Logic: 5% of Tasks + 5% of Rank + 100% of Ref Commission (based on your snippet)
  const finalLimit = (tonTaskSum * 0.05) + (rankBoostSum * 0.05) + (refCommissionSum);

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8 border-b border-gray-800 pb-4">
          Transaction Auditor <span className="text-blue-500">&</span> Limit Calculator
        </h2>
        
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <input
            type="text"
            placeholder="Enter Target User ID..."
            className="flex-1 bg-[#1e1e1e] border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            onClick={handleSearch} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            {loading ? "Calculating..." : "Verify & Calculate"}
          </button>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Type / Description</th>
                <th className="px-4 py-3 text-left">GRAM Amount</th>
                <th className="px-4 py-3 text-left">Blockchain Links</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Verify</th>
              </tr>
            </thead>
            <tbody>
              {results.length > 0 ? (
                results?.map((tx) => (
                  <tr key={tx._id} className="bg-[#1e1e1e] group hover:bg-[#252525] transition-colors">
                    <td className="px-4 py-4 rounded-l-lg border-l border-t border-b border-gray-800">
                      <div className="font-bold text-purple-400 capitalize">{tx.type.replace('_', ' ')}</div>
                      <div className="text-xs text-gray-500 mt-1  ">{tx.description || "No description"}</div>
                    </td>
                    <td className="px-4 py-4 border-t border-b border-gray-800 font-medium">
                      {tx.amount_ton} <span className="text-xs text-blue-400">GRAM</span>
                    </td>
                    <td className="px-4 py-4 border-t border-b border-gray-800">
                      <div className="flex flex-col gap-1">
                        {tx.hash && (
                          <a href={`https://tonviewer.com/transaction/${tx.hash}`} target="_blank" rel="noreferrer" 
                             className="text-blue-400 hover:text-blue-300 text-xs font-mono truncate max-w-[150px]">
                             # {tx.hash}
                          </a>
                        )}
                        {tx.walletAddress && (
                          <a href={`https://tonviewer.com/${tx.walletAddress}`} target="_blank" rel="noreferrer" 
                             className="text-emerald-400 hover:text-emerald-300 text-xs font-mono truncate max-w-[150px]">
                             Wallet: {tx.walletAddress}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 border-t border-b border-gray-800">
                      <span className={`inline-flex items-center text-xs font-semibold ${tx.status === 'completed' ? 'text-green-500' : 'text-orange-500'}`}>
                        <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 rounded-r-lg border-r border-t border-b border-gray-800 text-gray-500 text-sm">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 border-t border-b border-gray-800 text-center">
  <button
    onClick={() => handleVerify(tx._id, tx.verified)}
    className={`p-2 rounded-full transition ${
      tx.verified
        ? "bg-green-600 hover:bg-green-700"
        : "bg-gray-600 hover:bg-gray-700"
    }`}
  >
    {tx.verified ? (
      // Verified Icon
      <svg
        className="w-4 h-4 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      // Not Verified Icon
      <svg
        className="w-4 h-4 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
      </svg>
    )}
  </button>
</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-gray-600  ">
                    {loading ? "Querying records..." : "No transactions found. Please search for a User ID."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Card */}
        {results.length > 0 && (
          <div className="mt-12 bg-[#1e1e1e] border border-gray-800 rounded-xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-blue-400 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              Withdrawal Limit Breakdown
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">GRAM Tasks Total:</span>
                  <span className="font-mono">{tonTaskSum.toFixed(2)} GRAM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Rank Boost Total:</span>
                  <span className="font-mono">{rankBoostSum.toFixed(2)} GRAM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Mining Boost:</span>
                  <span className="font-mono">{mining_boost.toFixed(2)} GRAM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total:</span>
                  <span className="font-mono text-emerald-400">{totalinvestment} GRAM</span>
                </div>
                 <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Deposit (must equal to total above):</span>
                  <span className="font-mono text-emerald-400">{user?.total_deposit} GRAM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">MAXIMUM LIMIT: (total deposit * {config?.withdrawtimes})</span>
                  <span className="font-mono text-emerald-400">{maxLimit} GRAM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Withdrawan Funds:</span>
                  <span className="font-mono text-emerald-400">{user?.total_withdrawal} GRAM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">AvailableLimit:</span>
                  <span className="font-mono text-emerald-400">{avlLimit} GRAM</span>
                </div>
              </div>

              <div className="bg-[#121212] p-4 rounded-lg border border-gray-800 space-y-3">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Current balance: </span>
                  <span>{user?.total_balance.toLocaleString()} {config?.coin_ticker}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Current balance (GRAM): </span>
                  <span>{user?.total_balance * config?.coinPriceTON} GRAM</span>
                </div>
                <div className="pt-3 border-t border-gray-700 flex justify-between items-center">
                  <span className="text-white font-bold">Final Allowed Limit:</span>
                  <span className="text-2xl font-bold text-green-500 tracking-tight">{avlLimit} GRAM</span>
                </div>

                <div className="pt-3 border-t border-gray-700 flex justify-between items-center">
                  <span className="text-white font-bold">Can Withdraw this time:</span>
                  <span className="text-2xl font-bold text-green-500 tracking-tight">{user?.total_balance * config?.coinPriceTON > avlLimit? avlLimit:user?.total_balance * config?.coinPriceTON} GRAM</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVerifyWithdrawal;