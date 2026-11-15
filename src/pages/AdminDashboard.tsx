import React from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { Shield, Users, CreditCard, LayoutDashboard, ArrowLeft, LogOut, SendHorizonal, Send, GaugeCircle, Verified, Settings, NotepadText, MessageCircle } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const AdminDashboard: React.FC = () => {
  const { config, adminLogout, adminToken } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = React.useState({ totalUsers: 0, pendingWithdrawals: 0, totalVisaMined: 0 });
  const hasFetched = React.useRef(false);

  // 1. Handle Protected Route (Redirect) inside useEffect
  React.useEffect(() => {
    if (!adminToken) {
      navigate("/login");
    }
  }, [adminToken]);


  React.useEffect(() => {
    const isMainDashboard = location.pathname === '/admin';
    
    if (adminToken && isMainDashboard && !hasFetched.current) {
      hasFetched.current = true;
      console.log("fethching....")
      fetch("/api/admin/stats", {
       headers: {"Authorization": `Bearer ${adminToken}`},
      })
      .then(res => res.json())
      .then(data => {
        setStats(data);
      })
      .catch(err => console.error("Failed to fetch stats:", err));
    }

  
    return () => {
      if (location.pathname !== '/admin') {
        hasFetched.current = false;
      }
    };
  }, []);

  if (!adminToken) return null;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { id: 'users', label: 'User Management', icon: Users, path: '/admin/users' },
    { id: 'withdrawals', label: 'Withdrawals', icon: CreditCard, path: '/admin/withdrawal' },
    { id: 'transactions', label: 'Transactions', icon: Shield, path: '/admin/transactions' },
    { id: 'fakewithdrawal', label: 'FAKE WITHDRAWAL', icon: Send, path: '/admin/fakeWithdrawal' },
    { id: 'verifywithdrawal', label: 'VERIFY WITHDRAWAL', icon: Verified, path: '/admin/verifywithdrawal' },
    { id: 'configuration', label: 'CONFIGURATION', icon: Settings, path: '/admin/configuration' },
    { id: 'tasksetup', label: 'TASK SETUP', icon: NotepadText, path: '/admin/tasksetup' },
    { id: 'channelposts', label: 'CHANNEL POSTS', icon: MessageCircle, path: '/admin/channelposts' },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 flex flex-col bg-[#050505] sticky top-0 h-screen">
        <div className="p-8 border-b border-white/10 flex items-center gap-3">
          <Shield className="text-blue-500" size={28} />
          <span className="text-xl font-black uppercase tracking-tighter">Admin Panel</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems?.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  isActive 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' 
                    : 'text-gray-500 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="text-sm font-bold uppercase tracking-widest">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          {/* <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:bg-white/5 hover:text-white transition-all w-full text-left"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">Back to App</span>
          </button> */}
           <button 
            onClick={() => {
              adminLogout();
              navigate("/login");
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all w-full text-left"
          >
            <LogOut size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#0A0A0A] min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          {location.pathname === '/admin' ? (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="space-y-2">
                <h1 className="text-4xl font-black uppercase tracking-tighter">Welcome, Admin</h1>
                <p className="text-gray-500 uppercase text-xs font-bold tracking-widest">System Overview & Statistics</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-2">
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Total Users</p>
                  <p className="text-3xl font-black">{(stats.totalUsers ?? 0).toLocaleString()}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-2">
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Pending Withdrawals</p>
                  <p className="text-3xl font-black text-yellow-500">{(stats.pendingWithdrawals ?? 0).toLocaleString()}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-2">
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Total {config?.coin_ticker} Mined</p>
                  <p className="text-3xl font-black text-blue-500">
                    {(stats.totalVisaMined ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/10 p-8 rounded-3xl">
                <h3 className="text-xl font-black uppercase mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-4">
                  <button onClick={() => navigate("/admin/users")} className="bg-white text-black px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-colors">Manage Users</button>
                  <button onClick={() => navigate("/admin/withdrawal")} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-colors">Review Withdrawals</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-bottom-2 duration-300">
              <Outlet />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;