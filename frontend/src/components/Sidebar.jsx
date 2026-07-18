import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  CalendarCheck, 
  Users, 
  FileSpreadsheet, 
  Settings, 
  ShieldAlert, 
  User, 
  Fingerprint,
  MapPin
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();

  if (!user) return null;

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard & Mark', icon: CalendarCheck },
    { to: '/student/profile', label: 'My Academic Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Overview Metrics', icon: Home },
    { to: '/admin/students', label: 'Student Directory & Upload', icon: Users },
    { to: '/admin/reports', label: 'Attendance Reports', icon: FileSpreadsheet },
    { to: '/admin/settings', label: 'Campus GPS & Toggles', icon: Settings },
    { to: '/admin/audit-logs', label: 'System Audit Logs', icon: ShieldAlert },
  ];

  const links = user.role === 'admin' ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside className={`fixed top-[65px] bottom-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } flex flex-col justify-between p-4 shadow-xl`}>
        <div className="space-y-6">
          <div className="px-3 py-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {user.role === 'admin' ? 'Management Console' : 'Student Portal Navigation'}
            </span>
          </div>

          <nav className="space-y-1.5">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 border border-blue-500/30' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Security / System Footer Box */}
        <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Fingerprint className="w-4 h-4 text-emerald-400" />
            <span>WebAuthn Biometric</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>500m GPS Geolocation</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Protected by University Neural Security Protocol v2.4. All session verifications logged.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
