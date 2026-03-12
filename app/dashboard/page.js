'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Settings, 
  LogOut, 
  Folder, 
  FolderOpen,
  TrendingUp,
  Calendar,
  Clock,
  BarChart3,
  IndianRupee,
  Rocket,
  CheckCircle2,
  Zap,
  FileText,
  Key,
  User,
  Trash2,
  RefreshCcw,
  Menu,
  Monitor,
  Layout,
  PlusCircle,
  BarChart,
  Activity,
  Shield,
  X,
  Sun,
  Moon
} from 'lucide-react';
import ElegantSelect from '../../components/ElegantSelect';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

// Dynamically import Recharts to avoid SSR issues
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const BarChartComponent = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const { showToast } = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [amount, setAmount] = useState(10);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [revenueStats, setRevenueStats] = useState({ today: 0, week: 0, month: 0, total: 0, pendingMonth: 0, paidCountMonth: 0, totalLeadCountMonth: 0, trend: [], calendar: [], annualTrend: [] });
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date()); // The month being viewed
  const [dailyDetails, setDailyDetails] = useState(null);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get('auth/dashboard');
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (date) => {
    setStatsLoading(true);
    try {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const { data } = await api.get(`customers/stats?month=${month}&year=${year}`);
      if (data.success) {
        setRevenueStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchDailyDetails = async (date) => {
    setDailyLoading(true);
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const { data } = await api.get(`customers/stats/daily?date=${dateStr}`);
      setDailyDetails(data);
    } catch (err) {
      console.error('Failed to fetch daily details', err);
    } finally {
      setDailyLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('customers');
      setCustomers(data.customers || []);
    } catch (err) {
      console.error('Failed to fetch customers', err);
      setCustomers([]);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchCustomers();
      fetchStats(viewDate);
      fetchDailyDetails(selectedDate);
    }
  }, [user]);

  const handleMonthYearChange = (month, year) => {
    const newDate = new Date(viewDate);
    if (month !== undefined) newDate.setMonth(month);
    if (year !== undefined) newDate.setFullYear(year);
    
    setViewDate(newDate);
    fetchStats(newDate);
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setSelectedDate(newDate);
    fetchDailyDetails(newDate);
  };

  const handleClearMocks = async () => {
    if (!window.confirm('Are you sure you want to clear all mock data? This will reflect exact operational data.')) return;
    setClearLoading(true);
    try {
      await api.delete('customers/mock');
      await fetchStats(viewDate);
      await fetchDailyDetails(selectedDate);
      await fetchCustomers();
      showToast('Mock data cleared successfully', 'success');
    } catch (err) {
      console.error('Failed to clear mocks', err);
      showToast('Failed to clear mock data', 'error');
    } finally {
      setClearLoading(false);
    }
  };

  const handleUpdateBalance = async () => {
    setUpdateLoading(true);
    try {
      await api.post('auth/balance/update', { amount });
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to update balance', err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/login');
  };

  const recentActivity = useMemo(() => dashboardData?.recentActivity || [], [dashboardData]);

  const pieData = useMemo(() => {
    const completed = Number(revenueStats?.month) || 0;
    const pending = Number(revenueStats?.pendingMonth) || 0;

    return [
      { name: 'Completed', value: completed },
      { name: 'Pending', value: pending }
    ].filter(d => d.value > 0);
  }, [revenueStats]);

  const COLORS = ['#6366f1', '#8b5cf6', '#d946ef'];

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--accent-primary)' }}></div>
            <p className="font-black uppercase tracking-widest text-[10px] animate-pulse" style={{ color: 'var(--text-muted)' }}>Initializing Neural Link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[90] lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="sidebar-logo-text">NexaApp</span>
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Main Menu</div>
          <button className="nav-item active">
            <div className="nav-item-icon"><LayoutDashboard className="w-4 h-4" /></div>
            <span>Dashboard</span>
          </button>
          
          {(user?.role === 'marketing' || user?.role === 'admin') && (
            <>
              <button onClick={() => router.push('/marketing')} className="nav-item">
                <div className="nav-item-icon"><PlusCircle className="w-4 h-4" /></div>
                <span>Form View</span>
              </button>
              <button onClick={() => router.push('/customer-details')} className="nav-item">
                <div className="nav-item-icon"><ClipboardList className="w-4 h-4" /></div>
                <span>Customer Details</span>
              </button>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <button onClick={() => router.push('/admin/team-analysis')} className="nav-item">
                <div className="nav-item-icon"><BarChart3 className="w-4 h-4" /></div>
                <span>Team Analysis</span>
              </button>
              <button onClick={() => router.push('/admin')} className="nav-item">
                <div className="nav-item-icon"><Settings className="w-4 h-4" /></div>
                <span>Admin Panel</span>
              </button>
            </>
          )}

          <div className="nav-section-title" style={{ marginTop: '16px' }}>Preferences</div>
          <button onClick={toggleTheme} className="nav-item">
            <div className="nav-item-icon">{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</div>
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="nav-item btn-error" style={{ marginTop: '8px' }}>
            <div className="nav-item-icon"><LogOut className="w-4 h-4" /></div>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-muted hover:text-primary transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <Monitor className="w-8 h-8 text-indigo-500 hidden md:block" />
              <div>
                <h1 className="topbar-title">System Overview</h1>
                <p className="topbar-subtitle">Welcome back, {user?.name}</p>
              </div>
            </div>
          </div>
          <div className="topbar-actions flex items-center gap-2 md:gap-4">
            <button 
              onClick={toggleTheme} 
              className={`p-2 rounded-xl transition-all ${isDark ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="topbar-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        <div className="page-content">
          {(user?.role === 'admin' || user?.role === 'marketing') && (
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-indigo-500" />
                    Revenue Intelligence
                  </h2>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Real-time Performance Metrics</p>
                </div>
                
                {/* Global Selectors */}
                <div className={`flex flex-wrap items-center gap-3 p-2 rounded-2xl border backdrop-blur-xl relative z-20 ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white/60 border-gray-200'}`}>
                    <ElegantSelect
                        value={viewDate.getMonth()}
                        onChange={(val) => handleMonthYearChange(val, undefined)}
                        options={Array.from({ length: 12 }).map((_, i) => ({
                            value: i,
                            label: new Date(0, i).toLocaleString('default', { month: 'long' })
                        }))}
                        icon={Calendar}
                        variant="small"
                    />
                    <ElegantSelect
                        value={viewDate.getFullYear()}
                        onChange={(val) => handleMonthYearChange(undefined, val)}
                        options={[2024, 2025, 2026].map(y => ({
                            value: y,
                            label: y.toString()
                        }))}
                        icon={Shield}
                        variant="small"
                    />
                </div>
              </div>

              {/* Main Analysis Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* BOX 1: DAILY PERFORMANCE */}
                  <div className={`card p-8 relative overflow-hidden group ${isDark ? 'border-blue-500/10' : 'border-indigo-100'}`}>
                    <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] -mr-32 -mt-32 ${isDark ? 'bg-blue-500/5' : 'bg-indigo-100/50'}`}></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Daily Performance</h3>
                                <div className="text-2xl font-black text-white tracking-tighter">Day Revenue</div>
                            </div>
                            <ElegantSelect
                                value={selectedDate.getDate()}
                                onChange={(val) => handleDateSelect(val)}
                                options={Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate() }).map((_, i) => ({
                                    value: i + 1,
                                    label: (i + 1).toString()
                                }))}
                                icon={Clock}
                                variant="small"
                                className="ring-4 ring-blue-500/5 group-hover:ring-blue-500/10"
                            />
                        </div>

                        <div className="flex items-baseline gap-2 mb-8">
                            <span className="text-3xl font-black text-slate-600">₹</span>
                            <span className="text-7xl font-black text-emerald-400 tracking-tighter leading-none">
                                {dailyLoading ? '---' : (dailyDetails?.revenue || 0).toLocaleString()}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Leads</div>
                                <div className="text-xl font-black text-blue-400">{dailyDetails?.customers?.length || 0}</div>
                            </div>
                            <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Pending</div>
                                <div className="text-xl font-black text-amber-500">₹ {(dailyDetails?.pendingAmount || 0).toLocaleString()}</div>
                            </div>
                            <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Potential</div>
                                <div className="text-xl font-black text-slate-400">₹ {(dailyDetails?.totalSum || 0).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* BOX 2: MONTHLY SUMMARY */}
                  <div className={`card p-8 relative overflow-hidden group ${isDark ? 'border-indigo-500/10' : 'border-indigo-100'}`}>
                    <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] -mr-32 -mt-32 ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-100/30'}`}></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Monthly Analytics</h3>
                                <div className="text-2xl font-black text-white tracking-tighter">
                                    {viewDate.toLocaleString('default', { month: 'long' })} {viewDate.getFullYear()}
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-2xl shadow-indigo-500/10 group-hover:bg-indigo-500/20 transition-all">
                                <BarChart3 className="w-6 h-6 text-indigo-400" />
                            </div>
                        </div>

                        <div className="flex items-baseline gap-2 mb-8">
                            <span className="text-3xl font-black text-slate-600">₹</span>
                            <span className="text-7xl font-black text-emerald-400 tracking-tighter leading-none group-hover:text-emerald-300 transition-colors">
                                {statsLoading ? '---' : (revenueStats.month || 0).toLocaleString()}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group/stat">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover/stat:text-indigo-400 transition-colors mb-1">Paid Clients</div>
                                <div className="text-3xl font-black text-white">{revenueStats.paidCountMonth || 0}</div>
                                <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">From {revenueStats.totalLeadCountMonth || 0} Leads</div>
                            </div>
                            <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Pending</div>
                                <div className="text-3xl font-black text-amber-500">
                                    ₹{(revenueStats.pendingMonth || 0).toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Win Rate</div>
                                <div className="text-3xl font-black text-indigo-400">
                                    {revenueStats.totalLeadCountMonth > 0 ? Math.round((revenueStats.paidCountMonth / revenueStats.totalLeadCountMonth) * 100) : 0}%
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  {/* Revenue Breakdown Bar Chart */}
                  <div className={`card p-8 lg:col-span-2 relative overflow-hidden group ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
                    <div className={`absolute -top-24 -right-24 w-64 h-64 blur-[80px] ${isDark ? 'bg-indigo-500/5' : 'bg-indigo-100/30'}`}></div>
                    <div className="relative z-10 flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Revenue Matrix</h3>
                            <div className="text-xl font-black text-white">Monthly Revenue Matrix</div>
                        </div>
                        <div className="text-[9px] font-black text-indigo-400 px-3 py-1 bg-indigo-500/5 rounded-full border border-indigo-500/10">YEAR {viewDate.getFullYear()}</div>
                    </div>
                    
                    <div style={{ height: '280px', width: '100%' }}>
                        {statsLoading ? (
                            <div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChartComponent data={revenueStats.annualTrend?.length > 0 ? revenueStats.annualTrend : [{_id: 1, amount: 0}]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis 
                                        dataKey="_id" 
                                        stroke="#475569" 
                                        fontSize={10} 
                                        tickFormatter={(val) => new Date(0, val - 1).toLocaleString('default', { month: 'short' })}
                                    />
                                    <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        cursor={{fill: '#1e293b', opacity: 0.4}}
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ color: '#6366f1', fontWeight: '900' }}
                                    />
                                    <Bar 
                                        dataKey="amount" 
                                        fill="#6366f1" 
                                        radius={[10, 10, 0, 0]} 
                                        barSize={isMobile ? 12 : 32}
                                        background={{ fill: '#0f172a', radius: 10 }}
                                    />
                                </BarChartComponent>
                            </ResponsiveContainer>
                        )}
                    </div>
                  </div>

                  {/* Monthly Pie Chart */}
                  <div className={`card p-8 flex flex-col justify-center relative group overflow-hidden ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
                    <div className={`absolute -bottom-16 -left-16 w-48 h-48 blur-[60px] ${isDark ? 'bg-indigo-500/5' : 'bg-indigo-100/30'}`}></div>
                    <div className="relative z-10">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 text-center">Conversion Ratio</h3>
                        <div className="h-[220px] w-full flex items-center justify-center">
                             {statsLoading ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                            ) : pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={isMobile ? 45 : 60}
                                            outerRadius={isMobile ? 70 : 85}
                                            paddingAngle={8}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px', fontWeight: '900' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-[10px] text-slate-600 italic font-black">NO TELEMETRY DATA</div>
                            )}
                        </div>
                        <div className="mt-6 flex justify-center gap-6">
                            {pieData.map((entry, index) => (
                                <div key={entry.name} className="flex flex-col items-center">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{entry.name}</span>
                                    </div>
                                    <div className="text-xs font-black text-emerald-400">₹{entry.value.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                  </div>
              </div>
            </div>
          )}

          <div className="dashboard-grid">
            {/* System Activity */}
            <div className="card lg:col-span-3 h-full">
              <div className="card-header p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <FileText className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-widest">Neural Activity Stream</h2>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Automated Event Logging</p>
                    </div>
                </div>
              </div>
              <div className="p-6">
                <div className="activity-list space-y-6">
                    {recentActivity.length === 0 ? (
                    <p className="text-muted text-center py-12 text-xs italic">No system activity logged.</p>
                    ) : (
                    recentActivity.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="activity-item flex items-center gap-5 group">
                            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center transition-all group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 group-hover:scale-105 shadow-2xl">
                                {activity.type === 'auth' ? <Key className="w-5 h-5 text-amber-500" /> : activity.type === 'profile' ? <User className="w-5 h-5 text-sky-500" /> : <Folder className="w-5 h-5 text-indigo-500" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-[14px] font-black text-slate-200 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{activity.action}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{new Date(activity.time).toLocaleString()}</p>
                                    <div className="w-1 h-1 rounded-full bg-slate-800"></div>
                                    <p className="text-[9px] font-black text-indigo-500/60 uppercase tracking-widest">Type: {activity.type}</p>
                                </div>
                            </div>
                        </div>
                    ))
                    )}
                </div>
              </div>
            </div>
          </div>

          {(user?.role === 'marketing' || user?.role === 'admin') && (
            <div className="card mt-8 overflow-hidden">
              <div className="card-header border-b border-white/5 pb-4">
                <h2 className="card-title">Recent Customer Stream</h2>
                <button onClick={() => router.push('/customer-details')} className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all">
                  Full Registry
                </button>
              </div>
              <div className="p-2">
                {!Array.isArray(customers) ? (
                  <div className="text-center py-12 flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Synchronizing records...</span>
                  </div>
                ) : customers.length === 0 ? (
                  <div className="text-center py-12 text-slate-600">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-sm font-medium">No customer data currently available.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {customers.slice(0, 6).map((customer) => (
                      <div key={customer._id} className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all group relative overflow-hidden shadow-lg hover:shadow-indigo-500/5">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500/10 to-transparent blur-2xl"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <div className="font-bold text-slate-200 group-hover:text-white transition-colors tracking-tight text-base">{customer.name}</div>
                          <div className="text-xs font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">₹{customer.amount}</div>
                        </div>
                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 relative z-10 uppercase tracking-widest">
                           <span className="text-indigo-400/70">{customer.phone}</span>
                           <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(customer.visitedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
