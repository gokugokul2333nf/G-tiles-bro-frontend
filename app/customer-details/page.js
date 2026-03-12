'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Settings, 
  LogOut, 
  Search, 
  Calendar, 
  Pencil, 
  Lock,
  Zap,
  Trash2,
  ArrowUpDown,
  Plus,
  ArrowDownWideNarrow,
  Menu,
  X,
  Monitor,
  PlusCircle,
  Sun,
  Moon,
  BarChart3
} from 'lucide-react';
import ElegantSelect from '../../components/ElegantSelect';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

export default function CustomerDetailsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const { showToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [dateSort, setDateSort] = useState('newest'); // 'newest' or 'oldest'
  const [statusPriority, setStatusPriority] = useState('none'); // 'none', 'payment_completed', etc.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('customers');
      setCustomers(data.customers || []);
    } catch (err) {
      console.error('Failed to fetch customers', err);
      showToast('Failed to load customers', 'error');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer record?')) return;
    setDeletingId(id);
    try {
      await api.delete(`customers/${id}`);
      setCustomers((prev) => prev.filter((c) => c._id !== id));
      showToast('Customer deleted successfully', 'success');
    } catch (err) {
      console.error('Failed to delete customer', err);
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Auth redirect
  useEffect(() => {
    if (user && user.role !== 'marketing' && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/login');
  };

  const filteredCustomers = customers
    .filter((c) => {
      // Date filter
      if (selectedDate) {
        const customerDate = new Date(c.visitedAt).toISOString().split('T')[0];
        if (customerDate !== selectedDate) return false;
      }

      // Text search filter
      const search = searchTerm.toLowerCase();
      const dateStr = new Date(c.visitedAt).toLocaleDateString().toLowerCase();
      return (
        c.name.toLowerCase().includes(search) ||
        c.phone.toLowerCase().includes(search) ||
        dateStr.includes(search)
      );
    })
    .sort((a, b) => {
      // 1. Status Priority (if selected)
      if (statusPriority !== 'none') {
        if (statusPriority === 'payment_completed') {
          if (a.paymentStatus === 'completed' && b.paymentStatus !== 'completed') return -1;
          if (a.paymentStatus !== 'completed' && b.paymentStatus === 'completed') return 1;
        }
        if (statusPriority === 'payment_pending') {
          if (a.paymentStatus === 'pending' && b.paymentStatus !== 'pending') return -1;
          if (a.paymentStatus !== 'pending' && b.paymentStatus === 'pending') return 1;
        }
        if (statusPriority === 'reason_purchased') {
          if (a.reason === 'purchased' && b.reason !== 'purchased') return -1;
          if (a.reason !== 'purchased' && b.reason === 'purchased') return 1;
        }
        if (statusPriority === 'reason_enquiry') {
          if (a.reason === 'enquiry' && b.reason !== 'enquiry') return -1;
          if (a.reason !== 'enquiry' && b.reason === 'enquiry') return 1;
        }
      }

      // 2. Date Chronology (Always applies)
      const dateA = new Date(a.visitedAt);
      const dateB = new Date(b.visitedAt);
      return dateSort === 'oldest' ? dateA - dateB : dateB - dateA;
    });

  const canEdit = (cust) => {
    if (!cust) return false;
    // Strictly only the creator can edit
    return cust.enteredBy?._id === user?._id || cust.enteredBy === user?._id;
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
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
          <button onClick={() => router.push('/dashboard')} className="nav-item">
            <div className="nav-item-icon"><LayoutDashboard className="w-4 h-4" /></div>
            <span>Dashboard</span>
          </button>
          
          <button onClick={() => router.push('/marketing')} className="nav-item">
            <div className="nav-item-icon"><PlusCircle className="w-4 h-4" /></div>
            <span>Form View</span>
          </button>
          
          <button className="nav-item active">
            <div className="nav-item-icon"><ClipboardList className="w-4 h-4" /></div>
            <span>Customer Details</span>
          </button>

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
          <button onClick={handleLogout} className="nav-item btn-error" style={{ width: '100%' }}>
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
              <Users className="w-8 h-8 text-indigo-500" />
              <div>
                <h1 className="topbar-title">Customer Database</h1>
                <p className="topbar-subtitle">Neural Link - Interactions Log</p>
              </div>
            </div>
          </div>
          <div className="topbar-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </header>

        <div className="page-content sm:pb-8 pb-24">
          {/* Desktop Filters (Moved out of topbar for cleaner layout) */}
          <div className="hidden md:flex items-center justify-between mb-6 p-4 bg-slate-900/40 border border-white/5 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="search-bar-wrapper" style={{ position: 'relative', minWidth: '350px' }}>
                <Search className="search-icon w-4 h-4" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search records..." 
                  className="form-input with-icon w-full"
                  style={{ paddingLeft: '40px' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="date-filter-wrapper flex items-center gap-2">
                <div style={{ position: 'relative' }}>
                  <Calendar className="search-icon w-4 h-4" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="date" 
                    className="form-input with-icon"
                    style={{ paddingLeft: '40px', minWidth: '160px' }}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ElegantSelect
                value={dateSort}
                onChange={(val) => setDateSort(val)}
                options={[
                  { value: 'newest', label: 'Newest First' },
                  { value: 'oldest', label: 'Oldest First' }
                ]}
                icon={ArrowDownWideNarrow}
                variant="small"
                className="min-w-[150px]"
              />
              <ElegantSelect
                value={statusPriority}
                onChange={(val) => setStatusPriority(val)}
                options={[
                  { value: 'none', label: 'All Status' },
                  { value: 'payment_completed', label: 'Paid First' },
                  { value: 'payment_pending', label: 'Pending First' },
                  { value: 'reason_purchased', label: 'Purchased First' },
                  { value: 'reason_enquiry', label: 'Enquiry First' }
                ]}
                icon={Zap}
                variant="small"
                className="min-w-[170px]"
              />
            </div>
          </div>
          {/* Mobile Search & Sort with Glassmorphism */}
          <div className="md:hidden mb-6 flex flex-col gap-3 sticky top-4 z-40">
            <div className="glass-panel p-3 rounded-2xl flex flex-col gap-3 shadow-xl border border-white/10 backdrop-blur-xl bg-slate-900/60">
              <div className="search-bar-wrapper" style={{ position: 'relative' }}>
                <Search className="search-icon w-4 h-4" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />
                <input 
                  type="text" 
                  placeholder="Quick search..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 pl-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium placeholder:text-slate-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <div style={{ position: 'relative', flex: 1.5 }}>
                  <Calendar className="search-icon w-4 h-4" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />
                  <input 
                    type="date" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 pl-10 text-xs text-white focus:outline-none"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <ElegantSelect
                  value={dateSort}
                  onChange={(val) => setDateSort(val)}
                  options={[
                    { value: 'newest', label: 'Newest' },
                    { value: 'oldest', label: 'Oldest' }
                  ]}
                  icon={ArrowDownWideNarrow}
                  variant="small"
                  className="flex-1 bg-white/5 border-white/10"
                />
                <ElegantSelect
                  value={statusPriority}
                  onChange={(val) => setStatusPriority(val)}
                  options={[
                    { value: 'none', label: 'All' },
                    { value: 'payment_completed', label: 'Paid' },
                    { value: 'payment_pending', label: 'Pend' }
                  ]}
                  icon={Zap}
                  variant="small"
                  className="flex-1 bg-white/5 border-white/10"
                />
              </div>
              {selectedDate && (
                <button 
                  onClick={() => setSelectedDate('')}
                  className="text-[10px] text-indigo-400 font-black uppercase tracking-widest text-center"
                >
                  Clear Date Filter
                </button>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: '0', overflow: 'hidden', background: 'transparent', border: 'none', boxShadow: 'none' }}>
            {/* Desktop Table View */}
            <div className="table-container hidden md:block" style={{ overflowX: 'auto', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)' }}>
              <table className="data-table" style={{ minWidth: '800px' }}>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Visit Info</th>
                    <th>Amount</th>
                    <th>Source</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '60px' }}>
                        <div className="empty-state">
                          <Search className="w-12 h-12 mb-4 opacity-20" />
                          <p>{searchTerm ? `No matches found for "${searchTerm}"` : 'The database is currently empty.'}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <tr key={customer._id}>
                        <td style={{ fontWeight: '700' }}>{customer.name}</td>
                        <td>
                          <span className="phone-tag">{customer.phone}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar className="w-3 h-3 text-info" /> {new Date(customer.visitedAt).toLocaleDateString()}
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <span className={`badge ${customer.reason === 'purchased' ? 'badge-success' : 'badge-info'}`}>
                                {customer.reason}
                              </span>
                              <span className={`badge ${customer.paymentStatus === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                                {customer.paymentStatus}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontWeight: '800', color: '#10b981', fontSize: '18px' }}>
                          ₹{customer.amount}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="avatar-xs">
                              {customer.enteredBy?.name?.charAt(0) || 'U'}
                            </div>
                            <span style={{ fontSize: '12px', fontStyle: 'italic' }}>{customer.enteredBy?.name}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {canEdit(customer) || user?.role === 'admin' ? (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button 
                                className="btn btn-primary btn-sm"
                                onClick={() => router.push(`/marketing?edit=${customer._id}`)}
                              >
                                <Pencil className="w-3 h-3 mr-2" /> Edit
                              </button>
                              <button 
                                className="btn btn-error btn-sm"
                                onClick={() => handleDelete(customer._id)}
                                disabled={deletingId === customer._id}
                              >
                                {deletingId === customer._id ? '...' : <Trash2 className="w-3 h-3" />}
                              </button>
                            </div>
                          ) : (
                            <div className="status-locked">
                              <Lock className="w-3 h-3 mr-1" /> Locked
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View - Redesigned for Premium Experience */}
            <div className="md:hidden grid grid-cols-1 gap-5">
              {filteredCustomers.length === 0 ? (
                <div className="card text-center p-16 bg-slate-900/40 border-dashed border-2 border-white/5 rounded-3xl">
                   <Search className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                   <p className="text-slate-500 font-medium">{searchTerm ? `Zero results for scan` : 'Neural archives are empty'}</p>
                </div>
              ) : (
                filteredCustomers.map((customer, idx) => (
                  <div 
                    key={customer._id} 
                    className="premium-mobile-card group"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
                    
                    <div className="relative p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="min-w-0">
                          <h3 className="font-black text-white text-xl leading-tight tracking-tight truncate mb-1">
                            {customer.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-indigo-400 text-xs font-black tracking-widest">{customer.phone}</span>
                            <div className="w-1 h-1 rounded-full bg-slate-700" />
                            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">
                              {new Date(customer.visitedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-lg font-black bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent drop-shadow-sm">
                            ₹{customer.amount}
                          </div>
                          <div className="text-[9px] uppercase font-black text-slate-600 tracking-widest mt-0.5">Total Bill</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mb-6">
                        <div className={`status-pill ${customer.reason === 'purchased' ? 'status-pill-success' : 'status-pill-info'}`}>
                          <div className="status-dot" />
                          {customer.reason}
                        </div>
                        <div className={`status-pill ${customer.paymentStatus === 'completed' ? 'status-pill-success' : 'status-pill-warning'}`}>
                          <div className="status-dot" />
                          {customer.paymentStatus}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2.5 bg-white/5 pr-3 pl-1.5 py-1 rounded-full border border-white/10 shadow-lg">
                          <div className="avatar-sm bg-gradient-to-br from-indigo-500 to-purple-600 ring-2 ring-slate-900">
                            {customer.enteredBy?.name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Source</span>
                            <span className="text-xs text-white font-black truncate max-w-[80px]">{customer.enteredBy?.name?.split(' ')[0]}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-1.5">
                           {canEdit(customer) || user?.role === 'admin' ? (
                             <>
                               <button 
                                  onClick={() => router.push(`/marketing?edit=${customer._id}`)}
                                  className="w-10 h-10 flex items-center justify-center bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-xl transition-all border border-indigo-500/20 active:scale-90"
                               >
                                 <Pencil className="w-4 h-4" />
                               </button>
                               <button 
                                  onClick={() => handleDelete(customer._id)}
                                  disabled={deletingId === customer._id}
                                  className="w-10 h-10 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/20 active:scale-90"
                               >
                                 {deletingId === customer._id ? '...' : <Trash2 className="w-4 h-4" />}
                               </button>
                             </>
                           ) : (
                             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 rounded-lg text-slate-600 border border-white/5 shadow-inner">
                               <Lock className="w-3 h-3" />
                               <span className="text-[9px] font-black uppercase tracking-widest">Locked</span>
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Floating Action Button */}
      <button 
        onClick={() => router.push('/marketing')}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-2xl shadow-indigo-600/40 flex items-center justify-center z-[100] active:scale-95 transition-transform border border-white/20"
      >
        <Plus className="w-7 h-7" />
      </button>

      <style jsx global>{`
        /* Mobile-Specific Styles Only */
        .premium-mobile-card {
          position: relative;
          background: rgba(23, 23, 37, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: cardEntry 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
        }
        @keyframes cardEntry {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .premium-mobile-card:active {
          transform: scale(0.98);
          background: rgba(23, 23, 37, 0.9);
        }
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid rgba(255, 255, 255, 0.03);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          box-shadow: 0 0 10px currentColor;
        }
        .status-pill-success { background: rgba(16, 185, 129, 0.08); color: #10b981; }
        .status-pill-info { background: rgba(59, 130, 246, 0.08); color: #3b82f6; }
        .status-pill-warning { background: rgba(245, 158, 11, 0.08); color: #f59e0b; }
        
        .avatar-sm {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 900;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        /* Desktop Original Styles (DO NOT MODIFY PC VIEW) */
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table th {
          text-align: left;
          padding: 16px 24px;
          background: var(--bg-secondary);
          color: var(--text-muted);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .data-table td {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-subtle);
          vertical-align: middle;
        }
        .phone-tag {
          font-family: var(--font-mono);
          background: var(--bg-input);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 13px;
        }
        .badge {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 12px;
        }
        .badge-success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .badge-info { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .badge-warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .avatar-xs {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
        }
        .status-locked {
          display: inline-flex;
          align-items: center;
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 700;
          background: var(--bg-secondary);
          padding: 4px 12px;
          border-radius: 8px;
        }
        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.5;
          cursor: pointer;
        }
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
