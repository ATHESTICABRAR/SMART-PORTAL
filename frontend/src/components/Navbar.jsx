import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, Moon, Sun, UserCheck, Award, KeyRound, Calendar, X, Clock, BookOpen, CheckCircle } from 'lucide-react';

const Navbar = ({ dark, setDark, sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  return (
    <>
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

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setShowCalendarModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 text-purple-300 border border-purple-500/30 transition-all text-xs font-bold shadow-sm"
            title="View University Academic Calendar & Spells"
          >
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="hidden md:inline">Academic Calendar (`I SEM`)</span>
          </button>

          <button
            onClick={() => setDark(!dark)}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700/50 shadow-sm"
            title="Toggle Dark/Light Mode"
          >
            {dark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-blue-400" />}
          </button>

          {user && (
            <div className="flex items-center gap-3 sm:gap-4 pl-3 sm:pl-4 border-l border-slate-800">
              <div className="text-right hidden xl:block">
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

              {user.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin/settings')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all text-xs font-bold shadow-sm"
                  title="Change Admin Password"
                >
                  <KeyRound className="w-4 h-4" />
                  <span className="hidden 2xl:inline">Change Password</span>
                </button>
              )}

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

      {/* University Academic Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setShowCalendarModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">University Academic Calendar (`I SEM`)</h3>
                <p className="text-xs text-purple-300 font-semibold mt-0.5">B. Tech II, III & IV YEAR I & II SEMESTERS • Official Schedule</p>
              </div>
            </div>

            {/* Schedule Table */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60 shadow-inner mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase tracking-wider font-bold text-[11px]">
                      <th className="py-3 px-4">S.No</th>
                      <th className="py-3 px-4">Description of Academic Event</th>
                      <th className="py-3 px-4">From Date</th>
                      <th className="py-3 px-4">To Date</th>
                      <th className="py-3 px-4">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    <tr className="hover:bg-slate-900/50">
                      <td className="py-3 px-4 text-slate-400 font-mono">1</td>
                      <td className="py-3 px-4 text-white font-bold">Commencement of I Semester classwork</td>
                      <td className="py-3 px-4 font-mono text-purple-400 font-bold">—</td>
                      <td className="py-3 px-4 font-mono text-purple-400 font-bold">06.07.2026</td>
                      <td className="py-3 px-4 text-slate-300">—</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50 bg-indigo-500/5">
                      <td className="py-3 px-4 text-slate-400 font-mono">2</td>
                      <td className="py-3 px-4 text-white font-bold">1st Spell of Instructions</td>
                      <td className="py-3 px-4 font-mono text-blue-400 font-semibold">06.07.2026</td>
                      <td className="py-3 px-4 font-mono text-blue-400 font-semibold">29.08.2026</td>
                      <td className="py-3 px-4 font-extrabold text-emerald-400">8 Weeks</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="py-3 px-4 text-slate-400 font-mono">3</td>
                      <td className="py-3 px-4 text-slate-200">First Mid Term Examinations (1st Spell contd.)</td>
                      <td className="py-3 px-4 font-mono text-amber-400">31.08.2026</td>
                      <td className="py-3 px-4 font-mono text-amber-400">05.09.2026</td>
                      <td className="py-3 px-4 font-bold text-amber-300">1 Week</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50 bg-indigo-500/5">
                      <td className="py-3 px-4 text-slate-400 font-mono">4</td>
                      <td className="py-3 px-4 text-white font-bold">2nd Spell of Instructions</td>
                      <td className="py-3 px-4 font-mono text-blue-400 font-semibold">07.09.2026</td>
                      <td className="py-3 px-4 font-mono text-blue-400 font-semibold">31.10.2026</td>
                      <td className="py-3 px-4 font-extrabold text-emerald-400">8 Weeks</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="py-3 px-4 text-slate-400 font-mono">5</td>
                      <td className="py-3 px-4 text-slate-300">Submission of First Mid Term Exam Marks on/before</td>
                      <td className="py-3 px-4 font-mono text-slate-500">—</td>
                      <td className="py-3 px-4 font-mono font-bold text-rose-400">10.09.2026</td>
                      <td className="py-3 px-4 text-slate-400">Deadline</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="py-3 px-4 text-slate-400 font-mono">6</td>
                      <td className="py-3 px-4 text-slate-200">Second Mid Term Examinations (2nd Spell contd.)</td>
                      <td className="py-3 px-4 font-mono text-amber-400">02.11.2026</td>
                      <td className="py-3 px-4 font-mono text-amber-400">07.11.2026</td>
                      <td className="py-3 px-4 font-bold text-amber-300">1 Week</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="py-3 px-4 text-slate-400 font-mono">7</td>
                      <td className="py-3 px-4 text-slate-200">Preparation Holidays & Practical Examinations</td>
                      <td className="py-3 px-4 font-mono text-cyan-400">09.11.2026</td>
                      <td className="py-3 px-4 font-mono text-cyan-400">14.11.2026</td>
                      <td className="py-3 px-4 font-bold text-cyan-300">1 Week</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="py-3 px-4 text-slate-400 font-mono">8</td>
                      <td className="py-3 px-4 text-slate-300">Submission of Second Mid Term Exam Marks on/before</td>
                      <td className="py-3 px-4 font-mono text-slate-500">—</td>
                      <td className="py-3 px-4 font-mono font-bold text-rose-400">12.11.2026</td>
                      <td className="py-3 px-4 text-slate-400">Deadline</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50 bg-purple-500/10 border-t border-purple-500/30">
                      <td className="py-3 px-4 text-purple-300 font-mono font-bold">9</td>
                      <td className="py-3 px-4 text-purple-200 font-extrabold">End Semester Examinations</td>
                      <td className="py-3 px-4 font-mono font-bold text-purple-300">16.11.2026</td>
                      <td className="py-3 px-4 font-mono font-bold text-purple-300">27.11.2026</td>
                      <td className="py-3 px-4 font-extrabold text-purple-300">2 Weeks</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50 bg-slate-900">
                      <td className="py-3 px-4 text-slate-400 font-mono">10</td>
                      <td className="py-3 px-4 text-slate-300 font-semibold">Semester Break</td>
                      <td className="py-3 px-4 font-mono text-slate-400">28.11.2026</td>
                      <td className="py-3 px-4 font-mono text-slate-400">06.12.2026</td>
                      <td className="py-3 px-4 text-slate-400 font-medium">1 Week</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Total Active Instruction Spells: <strong className="text-white">16 Weeks</strong> • Mandatory Attendance Threshold: <strong className="text-emerald-400">≥ 75%</strong></span>
              </div>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow"
              >
                Close Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
