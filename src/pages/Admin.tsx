import React from "react";
import { Withdrawal } from "../types";

interface AdminProps {
  adminWithdrawals: Withdrawal[];
  onAction: (id: string, action: 'approve' | 'reject') => void;
  onBack: () => void;
}

const Admin: React.FC<AdminProps> = ({ adminWithdrawals, onAction, onBack }) => {
  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black uppercase tracking-tighter">Admin Panel</h1>
          <button onClick={onBack} className="text-xs font-bold text-gray-500 uppercase hover:text-white">Back to App</button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-sm font-black uppercase tracking-widest text-blue-400">Withdrawal Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase font-black text-gray-500 border-b border-white/5">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Coin</th>
                  <th className="px-6 py-4">GRAM</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {adminWithdrawals?.map(w => (
                  <tr key={w._id} className="text-xs font-bold">
                    <td className="px-6 py-4">{w.username || w.user_id}</td>
                    <td className="px-6 py-4">{w.amount_visa.toLocaleString()}</td>
                    <td className="px-6 py-4">{w.amount_ton.toFixed(4)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[9px] uppercase ${
                        w.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        w.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{new Date(w.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {w.status === 'pending' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => onAction(w._id, 'approve')}
                            className="px-3 py-1 bg-green-600 rounded-lg text-[10px] uppercase font-black hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => onAction(w._id, 'reject')}
                            className="px-3 py-1 bg-red-600 rounded-lg text-[10px] uppercase font-black hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {adminWithdrawals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 uppercase font-black tracking-widest text-[10px]">No requests found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
