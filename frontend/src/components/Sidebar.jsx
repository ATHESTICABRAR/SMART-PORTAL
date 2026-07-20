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
  Scan,
  MapPin
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();

  if (!user) return null;

  const adminNavs = [
    { to: '/admin', label: 'Overview Dashboard', icon: Home },
    { to: '/admin/students', label: 'Student Management', icon: Users },
    { to: '/admin/attendance', label: 'Daily Attendance Logs', icon: CalendarCheck },
    { to: '/admin/reports', label: 'Export Reports', icon: FileSpreadsheet },
    { to: '/admin/proxy-alerts', label: 'Proxy Security Alerts', icon: ShieldAlert },
    { to: '/admin/settings', label: 'System Configuration', icon: Settings },
  ];

  const studentNavs = [
    { to: '/', label: 'Attendance Dashboard', icon: Home },
    { to: '/profile', label: 'My Profile & Passkey', icon: User },
  ];

  const navs = user.role === 'admin' ? adminNavs : studentNavs;

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div>
          {/* Logo Brand Area */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-500/25">
              J
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base tracking-wide">JNTU PORTAL</h2>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Smart Attendance</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navs.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 font-bold' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}
                  `}
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
            <Scan className="w-4 h-4 text-cyan-400" />
            <span>AI Face Recognition (FRS)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>500m GPS Geolocation</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Protected by University Neural Security Protocol v3.4. All session verifications logged.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
