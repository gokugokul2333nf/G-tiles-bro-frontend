'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Clock, 
  LayoutDashboard, 
  ClipboardList, 
  Settings, 
  LogOut, 
  PlusCircle, 
  Zap, 
  Menu, 
  X, 
  Monitor,
  Sun,
  Moon,
  ShieldCheck,
  IndianRupee,
  Activity,
  Target
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useToast } from '../../../context/ToastContext';
import dynamic from 'next/dynamic';

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const BarChartComponent = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });

export default function TeamAnalysisPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const { showToast } = useToast();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchTeamStats();
  }, [user]);

  const fetchTeamStats = async () => {
    try {
      const { data } = await api.get('customers/team-stats');
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch team stats', err);
      showToast('Failed to load team analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredStats = stats.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/login');
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-[90] lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-icon"><Zap className="w-5 h-5 text-white" /></div>
          <span className="sidebar-logo-text">NexaApp</span>
          <button className="lg:hidden p-2 text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}><X className="w-5 h-5" /></button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Main Menu</div>
          <button onClick={() => router.push('/dashboard')} className="nav-item">
            <div className="nav-item-icon"><LayoutDashboard className="w-4 h-4" /></div>
            <span>Dashboard</span>
          </button>
          <button onClick={() => router.push('/marketing')} className="nav-item">
            <div className="nav-item-icon"><PlusCircle className="w-4 h-4" /></div>
            <span>Form View</span>
          </button>
          <button onClick={() => router.push('/customer-details')} className="nav-item">
            <div className="nav-item-icon"><ClipboardList className="w-4 h-4" /></div>
            <span>Customer Details</span>
          </button>
          <button className="nav-item active">
            <div className="nav-item-icon"><BarChart3 className="w-4 h-4" /></div>
            <span>Team Analysis</span>
          </button>
          <button onClick={() => router.push('/admin')} className="nav-item">
            <div className="nav-item-icon"><Settings className="w-4 h-4" /></div>
            <span>Admin Panel</span>
          </button>

          <div className="nav-section-title" style={{ marginTop: '16px' }}>Preferences</div>
          <button onClick={toggleTheme} className="nav-item">
            <div className="nav-item-icon">{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</div>
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item btn-error" style={{ width: '100%' }}>
            <div className="nav-item-icon"><LogOut className="w-4 h-4" /></div>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 text-muted hover:text-primary" onClick={() => setIsSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-indigo-500" />
              <div>
                <h1 className="topbar-title">Team Intelligence</h1>
                <p className="topbar-subtitle">Marketing team performance breakdown</p>
              </div>
            </div>
          </div>
          <div className="topbar-avatar">{user?.name?.charAt(0) || 'A'}</div>
        </header>

        <div className="page-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
             <div className="card p-6 bg-slate-900 shadow-xl border border-white/5">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20"><TrendingUp className="w-6 h-6 text-indigo-400" /></div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Collected</p>
                        <h3 className="text-2xl font-black text-emerald-400">₹{stats.reduce((acc, curr) => acc + curr.totalPaid, 0).toLocaleString()}</h3>
                    </div>
                </div>
             </div>
             <div className="card p-6 bg-slate-900 shadow-xl border border-white/5">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20"><Clock className="w-6 h-6 text-amber-400" /></div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Pending</p>
                        <h3 className="text-2xl font-black text-white">₹{stats.reduce((acc, curr) => acc + curr.totalPending, 0).toLocaleString()}</h3>
                    </div>
                </div>
             </div>
             <div className="card p-6 bg-slate-900 shadow-xl border border-white/5">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20"><Users className="w-6 h-6 text-emerald-400" /></div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Leads</p>
                        <h3 className="text-2xl font-black text-white">{stats.reduce((acc, curr) => acc + curr.leadCount, 0).toLocaleString()}</h3>
                    </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="card overflow-hidden bg-slate-900 shadow-xl border border-white/5">
                <div className="p-6 border-b border-white/5 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-lg font-black text-white uppercase tracking-widest">Team Performance Registry</h2>
                    <div className="relative group/search">
                        <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/search:text-indigo-400 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search operators..." 
                            className="bg-slate-950 border border-white/5 text-xs font-bold text-white pl-10 pr-4 py-2.5 rounded-xl w-full md:w-64 focus:outline-none focus:border-indigo-500/50 transition-all shadow-2xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-950/50">
                                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Operator</th>
                                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Leads</th>
                                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Conversions</th>
                                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Collected</th>
                                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Pending</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredStats.map((s) => (
                                <tr key={s._id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-black text-indigo-400 border border-indigo-500/30">
                                                {s.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-200">{s.name}</div>
                                                <div className="text-[10px] text-slate-500">{s.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-slate-300">{s.leadCount}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-emerald-400">{s.paidCount}</span>
                                            <span className="text-[10px] text-slate-600 font-black">({s.leadCount > 0 ? Math.round((s.paidCount/s.leadCount)*100) : 0}%)</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-black text-emerald-400">₹{s.totalPaid.toLocaleString()}</td>
                                    <td className="p-4 font-black text-amber-500">₹{s.totalPending.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View - Styled like Customer Details */}
                <div className="md:hidden space-y-4">
                    {filteredStats.length === 0 ? (
                        <div className="card text-center p-12">
                            <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-slate-500">No matches found</p>
                        </div>
                    ) : (
                        filteredStats.map((s, index) => (
                            <div key={s._id} className="mobile-card-item w-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="min-w-0">
                                        <div className="font-bold text-white text-lg flex items-center gap-2 truncate">
                                            {s.name}
                                            {index === 0 && <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />}
                                        </div>
                                        <div className="text-indigo-400 text-xs font-medium truncate opacity-80">{s.email}</div>
                                    </div>
                                    <div className="text-xl font-black text-emerald-400 shrink-0">₹{s.totalPaid.toLocaleString()}</div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Pending</span>
                                            <span className="text-sm font-bold text-amber-500">₹{s.totalPending.toLocaleString()}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Conv.</span>
                                            <div className="flex items-center gap-1">
                                                <Target className="w-3 h-3 text-emerald-500/50" />
                                                <span className="text-sm font-bold text-emerald-400">{s.leadCount > 0 ? Math.round((s.paidCount/s.leadCount)*100) : 0}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => router.push(`/customer-details?operator=${s._id}`)}
                                        className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 active:scale-95 transition-all"
                                    >
                                        <Monitor className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </div>

            <div className="card p-8 bg-slate-900 shadow-xl border border-white/5">
                <h2 className="text-xl font-black text-white mb-8 border-b border-white/5 pb-4">Revenue Comparison Matrix</h2>
                <div className="h-[300px] md:h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChartComponent data={stats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                stroke="#475569" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false}
                                hide={typeof window !== 'undefined' && window.innerWidth < 640}
                            />
                            <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip 
                                cursor={{fill: '#1e293b', opacity: 0.4}}
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                            <Bar dataKey="totalPaid" name="Collected" fill="#6366f1" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="totalPending" name="Pending" fill="#fbbf24" radius={[8, 8, 0, 0]} />
                        </BarChartComponent>
                    </ResponsiveContainer>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
