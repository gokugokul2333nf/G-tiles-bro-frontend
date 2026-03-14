'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Zap, 
  Map as MapIcon, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  ClipboardList, 
  BarChart3,
  PlusCircle,
  Sun,
  Moon,
  RefreshCcw,
  Navigation
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

// Dynamically import the Map component to avoid SSR issues
const StaffMap = dynamic(() => import('../../components/StaffMap'), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">Synchronizing Satellites...</p>
    </div>
  )
});

export default function LiveLocationPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const { showToast } = useToast();
  const [staffLocations, setStaffLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchLocations = async () => {
    try {
      if (user?.role === 'admin') {
        const { data } = await api.get('auth/marketing-locations');
        setStaffLocations(data.staff || []);
      } else if (user?.role === 'marketing') {
        // Just show current user
        setStaffLocations([user]);
      }
    } catch (err) {
      console.error('Failed to fetch locations', err);
      showToast('Failed to load locations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLocations();
      const interval = setInterval(fetchLocations, 5000); // Poll every 5s for "Swiggy-like" experience
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/login');
  };

  // Center the map on the first staff member with a location, or 0,0
  const centerPosition = useMemo(() => {
    const firstWithLoc = staffLocations.find(s => s.location && s.location.latitude);
    if (firstWithLoc) return [firstWithLoc.location.latitude, firstWithLoc.location.longitude];
    return [20.5937, 78.9629]; // India center
  }, [staffLocations]);

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
      />

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
          
          {(user?.role === 'marketing' || user?.role === 'admin') && (
            <>
              <button onClick={() => router.push('/marketing')} className="nav-item">
                <div className="nav-item-icon"><PlusCircle className="w-4 h-4" /></div>
                <span>Form</span>
              </button>
              <button onClick={() => router.push('/customer-details')} className="nav-item">
                <div className="nav-item-icon"><ClipboardList className="w-4 h-4" /></div>
                <span>Customer Details</span>
              </button>
              <button className="nav-item active">
                <div className="nav-item-icon"><MapIcon className="w-4 h-4" /></div>
                <span>Live Location</span>
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
              <Navigation className="w-8 h-8 text-indigo-500" />
              <div>
                <h1 className="topbar-title">Live Tracking</h1>
                <p className="topbar-subtitle">
                  {user.role === 'admin' ? 'Monitoring all marketing staff' : 'Providing your live telemetry'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={fetchLocations}
               className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500/20 transition-all"
               title="Refresh Locations"
             >
               <RefreshCcw className="w-5 h-5" />
             </button>
             <div className="topbar-avatar">
               {user?.name?.charAt(0) || 'U'}
             </div>
          </div>
        </header>

        <div className="page-content">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
            {/* Map Container */}
            <div className="lg:col-span-2 card p-0 overflow-hidden relative border-white/5 shadow-2xl">
              {loading ? (
                <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                  <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">Synchronizing Satellites...</p>
                </div>
              ) : (
                <StaffMap 
                  staffLocations={staffLocations} 
                  centerPosition={centerPosition} 
                  isDark={isDark} 
                />
              )}
            </div>

            {/* Staff List */}
            <div className="card flex flex-col border-white/5 shadow-2xl">
              <div className="p-6 border-b border-white/5">
                <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Staff Roster
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {staffLocations.length === 0 ? (
                  <div className="text-center py-12 text-slate-600 italic text-sm">No active staff markers detected.</div>
                ) : (
                  staffLocations.map((staff) => (
                    <div 
                      key={staff._id} 
                      className={`p-4 rounded-2xl border transition-all ${
                        staff.location?.latitude 
                          ? 'bg-indigo-500/5 border-indigo-500/20' 
                          : 'bg-slate-900/40 border-white/5 opacity-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-black text-white text-sm">{staff.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{staff.email}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${staff.location?.latitude ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></div>
                      </div>
                      {staff.location?.latitude ? (
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-indigo-500/10">
                           <div className="text-[9px] font-black text-indigo-400">
                             LAT: {staff.location.latitude.toFixed(4)}
                           </div>
                           <div className="text-[9px] font-black text-indigo-400">
                             LNG: {staff.location.longitude.toFixed(4)}
                           </div>
                        </div>
                      ) : (
                        <p className="text-[9px] font-bold text-slate-600 uppercase mt-2 italic">Waiting for signal...</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .leaflet-container {
          background: #0f172a !important;
        }
        .leaflet-popup-content-wrapper {
          background: white !important;
          border-radius: 12px !important;
        }
        .leaflet-popup-tip {
          background: white !important;
        }
      `}</style>
    </div>
  );
}
