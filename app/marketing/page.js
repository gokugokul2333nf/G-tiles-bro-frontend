'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Zap, 
  Plus, 
  Users,
  ClipboardList, 
  LayoutDashboard, 
  Settings,
  LogOut, 
  Menu,
  Monitor,
  Megaphone,
  Brain,
  PlusCircle,
  Send,
  X,
  Sun,
  Moon,
  Rocket,
  BarChart3
} from 'lucide-react';
import ElegantSelect from '../../components/ElegantSelect';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

export default function MarketingPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isNew, setIsNew] = useState(true);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    visitedAt: new Date().toISOString().slice(0, 10),
    reason: 'enquired',
    paymentStatus: 'pending',
    amount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/customers');
      setCustomers(data.customers || []);
      
      if (editId) {
        const toEdit = data.customers.find(c => c._id === editId);
        if (toEdit) {
          handleSelect(toEdit);
        }
      }
    } catch (err) {
      console.error('Failed to fetch customers', err);
      showToast('Failed to load customer records', 'error');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchCustomers();
  }, [editId]);

  // if somebody without marketing/admin role lands here, redirect
  useEffect(() => {
    if (user) {
      if (user.role !== 'marketing' && user.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [user]);

  const resetForm = () => {
    setForm({
      name: '',
      phone: '',
      visitedAt: new Date().toISOString().slice(0, 10),
      reason: 'enquired',
      paymentStatus: 'pending',
      amount: 0,
    });
    setSelected(null);
    setIsNew(true);
    setError('');
    setIsSidebarOpen(false); // Close sidebar on mobile after reset/new entry
    router.replace('/marketing');
  };

  const handleSelect = (customer) => {
    setSelected(customer);
    setIsNew(false);
    setForm({
      name: customer.name,
      phone: customer.phone,
      visitedAt: new Date(customer.visitedAt).toISOString().slice(0, 10),
      reason: customer.reason,
      paymentStatus: customer.paymentStatus,
      amount: customer.amount,
    });
    setError('');
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const canEdit = (cust) => {
    if (!cust) return false;
    // Strictly only the creator can edit
    return cust.enteredBy?._id === user?._id || cust.enteredBy === user?._id;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        await api.post('/customers', form);
      } else if (selected) {
        await api.put(`/customers/${selected._id}`, form);
      }
      await fetchCustomers();
      showToast(isNew ? 'Customer added successfully!' : 'Record updated successfully!', 'success');
      resetForm();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to authorize or save data';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/login');
  };

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
          <button onClick={resetForm} className="btn btn-primary flex items-center w-full mb-6">
            <Plus className="w-4 h-4 mr-2" /> New Entry
          </button>
          
          <div className="nav-section-title">Main Menu</div>
          <button onClick={() => router.push('/dashboard')} className="nav-item">
            <div className="nav-item-icon"><LayoutDashboard className="w-4 h-4" /></div>
            <span>Dashboard</span>
          </button>

          <button className="nav-item active">
            <div className="nav-item-icon"><PlusCircle className="w-4 h-4" /></div>
            <span>Form View</span>
          </button>

          <button onClick={() => router.push('/customer-details')} className="nav-item">
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
              <Megaphone className="w-8 h-8 text-indigo-500" />
              <div>
                <h1 className="topbar-title">Marketing Agent</h1>
                <p className="topbar-subtitle">Operator: {user?.name}</p>
              </div>
            </div>
          </div>
          <div className="topbar-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </header>

        <div className="page-content">
          <div className="card">
            <div className="card-header border-b border-white/5 pb-6 mb-6">
              <h2 className="card-title text-xl font-bold flex items-center">
                {isNew ? (
                  <><Plus className="w-6 h-6 mr-3 text-indigo-400" /> New Customer Entry</>
                ) : selected ? (
                  <><Rocket className="w-6 h-6 mr-3 text-indigo-400" /> Interaction Telemetry</>
                ) : (
                  'Select a record'
                )}
              </h2>
            </div>

            {(isNew || (selected && (canEdit(selected) || user?.role === 'admin'))) ? (
              <form onSubmit={handleSubmit} className="form-grid">
                {error && <div className="alert alert-error">{error}</div>}
                
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Full Name</label>
                  <input
                    id="name" name="name" placeholder="Enter name"
                    className="form-input"
                    value={form.name} onChange={handleChange} required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone Number</label>
                  <input
                    id="phone" name="phone" placeholder="Phone number"
                    className="form-input"
                    value={form.phone} onChange={handleChange} required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="visitedAt">Visit Date</label>
                  <input
                    id="visitedAt" name="visitedAt" type="date"
                    className="form-input"
                    value={form.visitedAt} onChange={handleChange} required
                  />
                </div>

                <div className="form-group">
                  <ElegantSelect
                    label="Interaction Logic"
                    value={form.reason}
                    onChange={(val) => setForm(prev => ({ ...prev, reason: val }))}
                    options={[
                      { value: 'enquired', label: 'Enquired' },
                      { value: 'purchased', label: 'Purchased' }
                    ]}
                    icon={Brain}
                  />
                </div>

                <div className="form-group">
                  <ElegantSelect
                    label="Transfer Status"
                    value={form.paymentStatus}
                    onChange={(val) => setForm(prev => ({ ...prev, paymentStatus: val }))}
                    options={[
                      { value: 'pending', label: 'Standing By' },
                      { value: 'completed', label: 'Confirmed' }
                    ]}
                    icon={Send}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="amount">Collection Amount</label>
                  <div className="relative group/input">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg group-focus-within/input:text-indigo-400 transition-colors">₹</span>
                    <input
                      id="amount" name="amount" type="number"
                      className="form-input pl-12"
                      value={form.amount} onChange={handleChange} required
                    />
                  </div>
                </div>

                <div className="col-span-full pt-6 flex justify-end gap-4 border-t border-white/5 mt-6">
                  <button type="button" onClick={resetForm} className="btn-ghost" disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary min-w-[140px]" disabled={saving}>
                    {saving ? 'Processing...' : isNew ? 'Submit Telemetry' : 'Update Telemetry'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-12 text-center">
                <Lock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Access Restricted</p>
                <p className="text-slate-600 text-sm mt-2">Only the origin operator can modify this data.</p>
                <button onClick={resetForm} className="btn btn-primary mt-6">Create New Entry</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
