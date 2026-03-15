'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  LogOut, 
  Settings, 
  Trash2, 
  ShieldCheck,
  Menu,
  X,
  PlusCircle,
  Monitor,
  Sun,
  Moon,
  BarChart3,
  Map
} from 'lucide-react';
import ElegantSelect from '../../components/ElegantSelect';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('auth/users');
      setUsers(data.users);
    } catch (err) {
      console.error('Failed to fetch users', err);
      setError('Could not load users');
      showToast('Could not load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (id === user._id) {
      showToast('You cannot delete yourself!', 'warning');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    
    setDeletingId(id);
    try {
      await api.delete(`auth/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      showToast('User deleted successfully', 'success');
    } catch (err) {
      console.error('Failed to delete user', err);
      const msg = err.response?.data?.message || 'Failed to delete user';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchUsers();
      }
    }
  }, [user]);

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.patch(`auth/users/${id}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role: newRole } : u)));
      showToast(`Role updated to ${newRole}`, 'success');
    } catch (err) {
      console.error('Role change failed', err);
      setError('Failed to update role');
      showToast('Failed to update role', 'error');
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
          <div className="nav-section-title">Main Menu</div>
          <button onClick={() => router.push('/dashboard')} className="nav-item">
            <div className="nav-item-icon"><LayoutDashboard className="w-4 h-4" /></div>
            <span>Dashboard</span>
          </button>
          
          <button onClick={() => router.push('/marketing')} className="nav-item">
            <div className="nav-item-icon"><PlusCircle className="w-4 h-4" /></div>
            <span>Form</span>
          </button>
          
          <button onClick={() => router.push('/customer-details')} className="nav-item">
            <div className="nav-item-icon"><ClipboardList className="w-4 h-4" /></div>
            <span>Customer Details</span>
          </button>

          {user?.role === 'admin' && (
            <button onClick={() => router.push('/live-location')} className="nav-item">
              <div className="nav-item-icon"><Map className="w-4 h-4" /></div>
              <span>Live Location</span>
            </button>
          )}

          {user?.role === 'admin' && (
            <>
              <button onClick={() => router.push('/admin/team-analysis')} className="nav-item">
                <div className="nav-item-icon"><BarChart3 className="w-4 h-4" /></div>
                <span>Team Analysis</span>
              </button>
              <button className="nav-item active">
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
              <ShieldCheck className="w-8 h-8 text-indigo-500" />
              <div>
                <h1 className="topbar-title">Admin Control</h1>
                <p className="topbar-subtitle">Manage system users and permissions</p>
              </div>
            </div>
          </div>
          <div className="topbar-actions">
            <div className="topbar-avatar">
              {user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        <div className="page-content">
          {error && <div className="alert alert-error mb-4">{error}</div>}
          
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            User Management
          </h2>

          <div className="card" style={{ padding: '0', overflow: 'hidden', background: 'transparent', border: 'none', boxShadow: 'none' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)' }}>Loading...</div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block" style={{ overflowX: 'auto', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)' }}>
                  <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                        <th style={{ textAlign: 'left', padding: '16px 24px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.1em' }}>User</th>
                        <th style={{ textAlign: 'left', padding: '16px 24px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.1em' }}>Email</th>
                        <th style={{ textAlign: 'left', padding: '16px 24px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.1em' }}>Access Role</th>
                        <th style={{ textAlign: 'right', padding: '16px 24px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.1em' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} style={{ borderBottom: '1px solid var(--border-subtle)' }} className="hover:bg-white/5 transition-colors">
                          <td style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--text-primary)' }}>{u.name}</td>
                          <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{u.email}</td>
                          <td style={{ padding: '16px 24px' }}>
                            <ElegantSelect
                              value={u.role}
                              onChange={(val) => handleRoleChange(u._id, val)}
                              options={[
                                { value: 'user', label: 'User' },
                                { value: 'marketing', label: 'Marketing' },
                                { value: 'admin', label: 'Admin' }
                              ]}
                              icon={ShieldCheck}
                              variant="small"
                            />
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                            <button 
                              className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-all"
                              onClick={() => handleDeleteUser(u._id)}
                              disabled={deletingId === u._id || u._id === user?._id}
                            >
                              {deletingId === u._id ? '...' : <Trash2 className="w-4 h-4" />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {users.map((u) => (
                    <div key={u._id} className="mobile-card-item">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="font-bold text-white text-lg tracking-tight">{u.name}</div>
                          <div className="text-slate-500 text-xs italic mt-0.5">{u.email}</div>
                        </div>
                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                           <ShieldCheck className="w-5 h-5 text-indigo-400" />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex-1 max-w-[160px]">
                          <ElegantSelect
                            value={u.role}
                            onChange={(val) => handleRoleChange(u._id, val)}
                            options={[
                              { value: 'user', label: 'User' },
                              { value: 'marketing', label: 'Marketing' },
                              { value: 'admin', label: 'Admin' }
                            ]}
                            variant="small"
                          />
                        </div>
                        
                        <button 
                          className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl ml-4"
                          onClick={() => handleDeleteUser(u._id)}
                          disabled={deletingId === u._id || u._id === user?._id}
                        >
                          {deletingId === u._id ? '...' : <Trash2 className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
