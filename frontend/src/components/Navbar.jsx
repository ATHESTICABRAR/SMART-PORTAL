import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, Moon, Sun, UserCheck, Award } from 'lucide-react';

const Navbar = ({ dark, setDark, sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-white bg-clip-text text-transparent">
              Smart Attendance Portal
            </h1>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">University Biometric & Geolocation Neural Matrix</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button
          onClick={() => setDark(!dark)}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700/50 shadow-sm"
          title="Toggle Dark/Light Mode"
        >
          {dark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-blue-400" />}
        </button>

        {user && (
          <div className="flex items-center gap-3 sm:gap-4 pl-3 sm:pl-4 border-l border-slate-800">
            <div className="text-right hidden md:block">
              <div className="text-sm font-semibold text-slate-200 flex items-center gap-1.5 justify-end">
                <span>{user.name}</span>
                {user.role === 'admin' ? (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold uppercase">ADMIN</span>
                ) : (
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-bold">{user.hall_ticket_number}</span>
                )}
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {user.role === 'admin' ? 'Administration Console' : `${user.department} • ${user.section} • ${user.year}`}
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all text-sm font-medium shadow-sm"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
