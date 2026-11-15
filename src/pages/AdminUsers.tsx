import React, { useState, useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../types";
import { useAppContext } from "../context/AppContext";
import { Shield, Ban, UserCheck, ShieldAlert, Users, LogIn, Search, X, Sparkles, User2, UserPlus2, UserX, LucideUserRoundMinus } from "lucide-react";

const AdminUsers: React.FC = () => {
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const { user, banUser, changeUserRole, loginAs,initdata,adminToken,changeAccountType,config } = useAppContext();
   const hasFetched = useRef(false);

  const fetchAdminUsers = async (page = 1, query = "") => {
    
     console.log("fetching All users")
    const res = await fetch(`/api/admin/users?page=${page}&query=${encodeURIComponent(query)}`, {
      headers: {"Authorization": `Bearer ${adminToken}`}
    });
    const result = await res.json();
    setAdminUsers(result.data);
    setTotalPages(result.totalPages);
    setCurrentPage(result.page);
  };

  useEffect(() => {
    fetchAdminUsers(currentPage, searchQuery);
  }, [user, currentPage, searchQuery,adminToken]);

  const handleBanToggle = async (targetUserId: string, currentBanned: boolean) => {
    const yes = confirm("are you sure?")
    if(yes){
      await banUser(targetUserId, !currentBanned);
      fetchAdminUsers(currentPage, searchQuery);
    }
    
  };

    const handleAccountTypeToggle = async (targetUserId: string, accountType: string) => {

      accountType = accountType==="USER"?"PARTNER":"USER";
    const yes = confirm("are you sure you want to make him "+ accountType+"??")
    if(yes){
      await changeAccountType(targetUserId, accountType);
      fetchAdminUsers(currentPage, searchQuery);
    }
    
  };

  

  const handleRoleToggle = async (targetUserId: string, currentRole: 'user' | 'admin') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await changeUserRole(targetUserId, newRole);
    fetchAdminUsers(currentPage, searchQuery);
  };

  const handleLoginAs = (targetUserId: string) => {
    loginAs(targetUserId);
    navigate("/");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Users className="text-blue-500" size={32} />
          <h1 className="text-3xl font-black uppercase tracking-tighter">User Management</h1>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text"
            placeholder="Search by name, ID, or ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                <th className="px-6 py-4">User Info</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {adminUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 uppercase text-xs font-bold tracking-widest">
                    {searchQuery ? "No users match your search" : "No users found in database"}
                  </td>
                </tr>
              ) : (
                adminUsers?.map((u) => (
                  <tr key={u.id} className="text-xs font-bold hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black">{u.username || "Anonymous"}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 font-mono">{u.id}</span>
                          
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-blue-400">{(u.total_balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {config?.coin_ticker}</span>
                        <span className="text-[9px] text-gray-600 uppercase">{u.mining_speed} PPH</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {u.role === 'admin' ? (
                          <ShieldAlert size={14} className="text-purple-400" />
                        ) : (
                          <UserCheck size={14} className="text-gray-500" />
                        )}
                        <span className={`uppercase text-[9px] ${u.role === 'admin' ? 'text-purple-400' : 'text-gray-500'}`}>
                          {u.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[9px] uppercase ${
                        u.is_banned ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                      }`}>
                        {u.is_banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(u.created_at || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleBanToggle(u.id, u.is_banned)}
                          className={`p-2 rounded-xl transition-colors ${
                            u.is_banned ? 'bg-green-600/20 text-green-500 hover:bg-green-600/30' : 'bg-red-600/20 text-red-500 hover:bg-red-600/30'
                          }`}
                          title={u.is_banned ? "Unban User" : "Ban User"}
                        >
                          <Ban size={16} />
                        </button>
                        <button 
                          onClick={() => handleRoleToggle(u.id, u.role)}
                          className={`p-2 rounded-xl transition-colors ${
                            u.role === 'admin' ? 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30' : 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30'
                          }`}
                          title={u.role === 'admin' ? "Make Regular User" : "Make Admin"}
                        >
                          <Shield size={16} />
                        </button>

                        <button 
                          onClick={() => handleAccountTypeToggle(u.id, u.accountType)}
                          className={`p-2 rounded-xl transition-colors ${
                           (u.accountType === "USER" || !u.accountType) ? 'flex flex-col items-center bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/30' : 'flex flex-col  items-center bg-green-600/20 text-green-500 hover:bg-green-600/30'
                          }`}
                          title={(u.accountType === "USER" || !u.accountType)  ? "make PARTNER" : "Make User"}
                        >
                                                {
                          (u.accountType === "USER" || !u.accountType) ? (
                            <>
                              <Users size={16} /> <span className="text-xs">User</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={16} /> <span className="text-xs">PARTNER</span>
                            </>
                          )
                        }
                        </button>

                        
                        {/* <button 
                          onClick={() => handleLoginAs(u.id)}
                          className="p-2 bg-blue-950/50 text-blue-400 rounded-xl hover:bg-blue-950/30 transition-colors"
                          title="Login As User"
                        >
                          <LogIn size={16} />
                        </button>
                         */}
                      </div>
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

export default AdminUsers;
