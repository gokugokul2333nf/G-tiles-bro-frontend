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
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Users className="w-8 h-8 text-indigo-500 shrink-0" />
              <div className="min-w-0 flex-1">
                <h1 className="topbar-title text-base sm:text-xl lg:text-2xl truncate">Customer Database</h1>
                <p className="topbar-subtitle text-[10px] sm:text-sm opacity-70 break-words line-clamp-1 sm:line-clamp-none">Neural Link - Interactions Log</p>
              </div>
            </div>
          </div>
          <div className="topbar-actions">
            <div className="flex items-center gap-3">
              <div className="search-bar-wrapper hidden md:block" style={{ position: 'relative', minWidth: '300px' }}>
                <Search className="search-icon w-4 h-4" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search by name, phone or date..." 
                  className="form-input with-icon"
                  style={{ paddingLeft: '40px' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="date-filter-wrapper hidden md:flex items-center gap-2">
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
                {selectedDate && (
                  <button 
                    onClick={() => setSelectedDate('')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Clear Date
                  </button>
                )}
              </div>
              <ElegantSelect
                value={dateSort}
                onChange={(val) => setDateSort(val)}
                options={[
                  { value: 'newest', label: 'Newest First' },
                  { value: 'oldest', label: 'Oldest First' }
                ]}
                icon={ArrowDownWideNarrow}
                variant="small"
                className="min-w-[140px]"
              />
              <ElegantSelect
                value={statusPriority}
                onChange={(val) => setStatusPriority(val)}
                options={[
                  { value: 'none', label: 'No Priority' },
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
        </header>

        <div className="page-content">
          {/* Mobile Search & Sort */}
          <div className="md:hidden mb-4 flex flex-col gap-3">
            <div className="search-bar-wrapper" style={{ position: 'relative' }}>
              <Search className="search-icon w-4 h-4" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search records..." 
                className="form-input with-icon"
                style={{ paddingLeft: '40px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="date-filter-wrapper flex items-center gap-2">
              <div style={{ position: 'relative', flex: 1 }}>
                <Calendar className="search-icon w-4 h-4" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="date" 
                  className="form-input with-icon"
                  style={{ paddingLeft: '40px', width: '100%' }}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              {selectedDate && (
                <button 
                  onClick={() => setSelectedDate('')}
                  className="text-xs text-indigo-400 font-medium"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <ElegantSelect
                value={dateSort}
                onChange={(val) => setDateSort(val)}
                options={[
                  { value: 'newest', label: 'Newest First' },
                  { value: 'oldest', label: 'Oldest First' }
                ]}
                icon={ArrowDownWideNarrow}
                variant="small"
                className="flex-1"
              />
              <ElegantSelect
                value={statusPriority}
                onChange={(val) => setStatusPriority(val)}
                options={[
                  { value: 'none', label: 'No Priority' },
                  { value: 'payment_completed', label: 'Paid First' },
                  { value: 'payment_pending', label: 'Pending First' },
                  { value: 'reason_purchased', label: 'Purchased First' },
                  { value: 'reason_enquiry', label: 'Enquiry First' }
                ]}
                icon={Zap}
                variant="small"
                className="flex-1"
              />
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredCustomers.length === 0 ? (
                <div className="card text-center p-12">
                   <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                   <p className="text-slate-500">{searchTerm ? `No matches found` : 'No records found'}</p>
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                  <div key={customer._id} className="mobile-card-item">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-white text-lg">{customer.name}</div>
                        <div className="text-indigo-400 text-sm font-mono">{customer.phone}</div>
                      </div>
                      <div className="text-xl font-black text-emerald-400">₹{customer.amount}</div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`badge ${customer.reason === 'purchased' ? 'badge-success' : 'badge-info'}`}>
                        {customer.reason}
                      </span>
                      <span className={`badge ${customer.paymentStatus === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                        {customer.paymentStatus}
                      </span>
                      <div className="flex items-center gap-1.5 ml-auto text-[11px] text-slate-500 font-bold">
                        <Calendar className="w-3 h-3" />
                        {new Date(customer.visitedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="avatar-xs">
                          {customer.enteredBy?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-[11px] text-slate-500 italic">{customer.enteredBy?.name}</span>
                      </div>
                      
                      <div className="flex gap-2">
                         {canEdit(customer) || user?.role === 'admin' ? (
                           <>
                             <button 
                                onClick={() => router.push(`/marketing?edit=${customer._id}`)}
                                className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg"
                             >
                               <Pencil className="w-4 h-4" />
                             </button>
                             <button 
                                onClick={() => handleDelete(customer._id)}
                                disabled={deletingId === customer._id}
                                className="p-2 bg-rose-500/10 text-rose-500 rounded-lg"
                             >
                               {deletingId === customer._id ? '...' : <Trash2 className="w-4 h-4" />}
                             </button>
                           </>
                         ) : (
                           <div className="status-locked text-[10px]">
                             <Lock className="w-3 h-3 mr-1" /> Locked
                           </div>
                         )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
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
