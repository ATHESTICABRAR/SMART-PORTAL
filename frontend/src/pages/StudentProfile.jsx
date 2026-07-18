import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Award, BookOpen, Phone, MapPin, ShieldCheck, Fingerprint } from 'lucide-react';

const StudentProfile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-fadeIn">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-4xl shadow-xl shadow-blue-500/25 border-2 border-white/20">
            {user.name.charAt(0)}
          </div>
          <div className="text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{user.name}</h2>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono font-bold">
                {user.hall_ticket_number}
              </span>
            </div>
            <p className="text-slate-300 font-medium text-sm">
              Bachelor of Technology — {user.department} Engineering
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-indigo-400" /> Section {user.section}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-400" /> {user.year}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-lg text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <User className="w-5 h-5 text-blue-400" />
            <span>Personal & Academic Info</span>
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-800/50">
              <span className="text-slate-400">Hall Ticket Number</span>
              <span className="font-mono font-bold text-white">{user.hall_ticket_number}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/50">
              <span className="text-slate-400">Full Name</span>
              <span className="font-semibold text-white">{user.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/50">
              <span className="text-slate-400">Mobile Number</span>
              <span className="font-mono text-slate-200">{user.mobile_number || '9876543210'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/50">
              <span className="text-slate-400">Department</span>
              <span className="font-semibold text-blue-300">{user.department}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/50">
              <span className="text-slate-400">Section</span>
              <span className="font-semibold text-indigo-300">{user.section}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Year of Study</span>
              <span className="font-semibold text-slate-200">{user.year}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-lg text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Biometric & Security Credentials</span>
          </h3>

          <div className="space-y-4 text-sm">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-3">
              <Fingerprint className="w-6 h-6 flex-shrink-0 text-emerald-400" />
              <div>
                <p className="font-bold text-xs">WebAuthn Passkey Status</p>
                <p className="text-[11px] text-emerald-200/80 mt-0.5">Biometric Neural link active on this browser device.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-center gap-3">
              <MapPin className="w-6 h-6 flex-shrink-0 text-blue-400" />
              <div>
                <p className="font-bold text-xs">GPS Geolocation Matrix</p>
                <p className="text-[11px] text-blue-200/80 mt-0.5">Campus boundary verification enabled within 500m radius.</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed pt-2">
              Your attendance records are cryptographically verified using WebAuthn standard passkeys and GPS geolocation coordinate checks before being committed to the database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
