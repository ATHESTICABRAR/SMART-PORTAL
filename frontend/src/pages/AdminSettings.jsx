import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Settings, MapPin, Clock, Save, CheckCircle, ShieldCheck, ToggleLeft, ToggleRight, Navigation, RefreshCw, Trash2, CalendarCheck, ShieldAlert, Plus, X, Lock, Unlock } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    campus_ip_addresses: '',
    location_check_enabled: true,
    trial_mode_enabled: true,
    session_1_start: '09:00',
    session_1_end: '13:00',
    session_2_start: '14:00',
    session_2_end: '17:00',
    semester_start_date: '',
    semester_end_date: '',
    skipped_dates: [],
    dashboard_enabled: true,
    dashboard_offline_reason: 'System is currently undergoing maintenance.',
    college_lat: '17.4455',
    college_lng: '78.3891',
    geofence_radius: 300,
    total_working_days: 90
  });
  const [newSkippedDate, setNewSkippedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState({ text: '', type: '' });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/settings');
      if (res.data.settings) {
        setSettings(res.data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await api.put('/admin/settings', settings);
      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
        setSettings(res.data.settings);
      }
    } catch (error) {
      setMessage({ text: 'Failed to update campus settings.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleGetMyIP = async () => {
    try {
      const res = await api.get('/admin/my-ip');
      if (res.data.ip) {
        const detectedIp = res.data.ip;
        setSettings({
          ...settings,
          campus_ip_addresses: settings.campus_ip_addresses 
            ? `${settings.campus_ip_addresses}, ${detectedIp}`
            : detectedIp
        });
        setMessage({ text: `📍 Auto-detected and added server-seen IP: ${detectedIp}`, type: 'success' });
      }
    } catch (err) {
      setMessage({ text: 'Failed to auto-detect IP address from server.', type: 'error' });
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('⚠️ Are you sure you want to RESET all attendance marks and audit logs back to a clean state? This action cannot be undone.')) return;
    try {
      const res = await api.post('/admin/reset-data');
      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
      }
    } catch (err) {
      setMessage({ text: 'Failed to reset data.', type: 'error' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ text: '', type: '' });
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMsg({ text: 'New password and confirm password do not match.', type: 'error' });
      return;
    }
    setPwdLoading(true);
    try {
      const res = await api.put('/auth/admin/change-password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
        confirmPassword: pwdForm.confirmPassword
      });
      if (res.data.success) {
        setPwdMsg({ text: res.data.message || 'Password changed successfully.', type: 'success' });
        setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPwdMsg({ text: err.response?.data?.message || 'Failed to change password.', type: 'error' });
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 font-semibold animate-pulse">
        Loading System Parameters...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">University System Configuration</h2>
          <p className="text-sm text-slate-400 mt-0.5">Manage campus Geolocation boundaries, ON/OFF verification toggles, and attendance windows</p>
        </div>
        <button
          type="button"
          onClick={handleResetData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" />
          <span>Reset All Attendance Data</span>
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl border text-sm flex items-center justify-between shadow-md ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} className="text-xs opacity-75">✕</button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Dashboard Access Control */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${settings.dashboard_enabled ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {settings.dashboard_enabled ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Student Dashboard Access</h3>
                <p className="text-xs text-slate-400">Instantly lock or unlock the main student portal</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSettings({ ...settings, dashboard_enabled: !settings.dashboard_enabled })}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-md ${
                settings.dashboard_enabled
                  ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                  : 'bg-red-500 text-white shadow-red-500/25'
              }`}
            >
              {settings.dashboard_enabled ? (
                <>
                  <ToggleRight className="w-5 h-5" />
                  <span>DASHBOARD ONLINE</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5" />
                  <span>DASHBOARD OFFLINE</span>
                </>
              )}
            </button>
          </div>

          {!settings.dashboard_enabled && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 animate-fadeIn">
              <label className="block text-xs font-bold uppercase tracking-wider text-red-400 mb-2">Offline Reason / Message to Students</label>
              <input
                type="text"
                value={settings.dashboard_offline_reason || ''}
                onChange={(e) => setSettings({ ...settings, dashboard_offline_reason: e.target.value })}
                placeholder="e.g. The JNTU portal is closed for semester maintenance."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500"
              />
            </div>
          )}
        </div>

        {/* Geolocation Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">{settings.geofence_radius || 300}-Meter GPS Geofence</h3>
                <p className="text-xs text-slate-400">Strictly enforce a physical radius around the configured coordinates</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* ON / OFF Toggle Button */}
              <div className="flex items-center justify-between gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-slate-300">Location Check:</span>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, location_check_enabled: !settings.location_check_enabled })}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-bold text-xs transition-all shadow-md ${
                    settings.location_check_enabled
                      ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {settings.location_check_enabled ? (
                    <>
                      <ToggleRight className="w-5 h-5" />
                      <span>ON (ENFORCED)</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5" />
                      <span>OFF (BYPASSED)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Trial Mode Toggle */}
              <div className="flex items-center justify-between gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-slate-300">Face Scanner Trial:</span>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, trial_mode_enabled: !settings.trial_mode_enabled })}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-bold text-xs transition-all shadow-md ${
                    settings.trial_mode_enabled
                      ? 'bg-blue-600 text-white shadow-blue-500/25'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {settings.trial_mode_enabled ? (
                    <>
                      <ToggleRight className="w-5 h-5" />
                      <span>ON (SHOWN)</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5" />
                      <span>OFF (HIDDEN)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fadeIn">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Center Latitude</label>
              <input
                type="text"
                value={settings.college_lat || ''}
                onChange={(e) => setSettings({ ...settings, college_lat: e.target.value })}
                placeholder="17.4455"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Center Longitude</label>
              <input
                type="text"
                value={settings.college_lng || ''}
                onChange={(e) => setSettings({ ...settings, college_lng: e.target.value })}
                placeholder="78.3891"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Radius (Meters)</label>
              <input
                type="number"
                value={settings.geofence_radius || 300}
                onChange={(e) => setSettings({ ...settings, geofence_radius: e.target.value })}
                placeholder="300"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="text-sm">
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-emerald-300 flex items-start gap-3">
              <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-xs">
                <strong>GPS Hardware Lock Active:</strong> The system forces the student's device to enable High-Accuracy GPS mode. The backend calculates the Haversine distance and strictly blocks any scan that is more than {settings.geofence_radius || 300} meters from the coordinates defined above.
              </p>
            </div>
          </div>
        </div>

        {/* Session Windows Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Attendance Session Windows</h3>
              <p className="text-xs text-slate-400">Set daily start and end timings for Session 1 and Session 2</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <h4 className="text-xs font-bold uppercase text-blue-400">Session 1 (Morning Window)</h4>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={settings.session_1_start || '09:00'}
                    onChange={(e) => setSettings({ ...settings, session_1_start: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">End Time</label>
                  <input
                    type="time"
                    value={settings.session_1_end || '13:00'}
                    onChange={(e) => setSettings({ ...settings, session_1_end: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-400 mb-1">Deadline Time</label>
                  <input
                    type="time"
                    value={settings.session_1_deadline || '09:30'}
                    onChange={(e) => setSettings({ ...settings, session_1_deadline: e.target.value })}
                    className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-2.5 py-2 text-amber-300 font-mono text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <h4 className="text-xs font-bold uppercase text-indigo-400">Session 2 (Afternoon Window)</h4>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={settings.session_2_start || '14:00'}
                    onChange={(e) => setSettings({ ...settings, session_2_start: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">End Time</label>
                  <input
                    type="time"
                    value={settings.session_2_end || '17:00'}
                    onChange={(e) => setSettings({ ...settings, session_2_end: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-400 mb-1">Deadline Time</label>
                  <input
                    type="time"
                    value={settings.session_2_deadline || '14:30'}
                    onChange={(e) => setSettings({ ...settings, session_2_deadline: e.target.value })}
                    className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-2.5 py-2 text-amber-300 font-mono text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Semester Boundaries */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Academic Semester Boundaries</h3>
              <p className="text-xs text-slate-400">Set the official start and end dates. Total working days are automatically calculated (excluding Sundays).</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Semester Start Date</label>
              <input
                type="date"
                value={settings.semester_start_date || ''}
                onChange={(e) => setSettings({ ...settings, semester_start_date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Semester End Date</label>
              <input
                type="date"
                value={settings.semester_end_date || ''}
                onChange={(e) => setSettings({ ...settings, semester_end_date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="w-full sm:w-48 flex-shrink-0">
              <label className="block text-[11px] font-bold text-emerald-400 mb-1 uppercase tracking-wider">Calculated Working Days</label>
              <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-300 font-mono font-bold text-base flex items-center justify-between shadow-inner">
                <span>{settings.total_working_days || 90}</span>
                <span className="text-[10px] uppercase font-bold text-emerald-400/70 tracking-wider">Days</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-5 mt-5">
            <h4 className="text-xs font-bold uppercase text-slate-300 mb-3">Skipped Dates (Holidays)</h4>
            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="date"
                  value={newSkippedDate}
                  onChange={(e) => setNewSkippedDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newSkippedDate && !settings.skipped_dates?.includes(newSkippedDate)) {
                      setSettings({ ...settings, skipped_dates: [...(settings.skipped_dates || []), newSkippedDate] });
                      setNewSkippedDate('');
                    }
                  }}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold flex items-center gap-1 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 flex-1">
                {(settings.skipped_dates || []).length === 0 && (
                  <span className="text-xs text-slate-500 italic py-2">No dates skipped.</span>
                )}
                {(settings.skipped_dates || []).map(date => (
                  <div key={date} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg flex items-center gap-2 text-sm text-slate-200">
                    <span className="font-mono">{date}</span>
                    <button type="button" onClick={() => setSettings({ ...settings, skipped_dates: settings.skipped_dates.filter(d => d !== date) })} className="text-slate-400 hover:text-red-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">These dates are automatically subtracted from the Total Working Days calculation above.</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Committing Settings to Neural Matrix...' : 'Save Campus Parameters'}</span>
        </button>
      </form>

      {/* Admin Profile - Change Password Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Admin Profile — Change Password</h3>
            <p className="text-xs text-slate-400">Update management console authentication password (minimum 8 characters required)</p>
          </div>
        </div>

        {pwdMsg && pwdMsg.text && (
          <div className={`p-4 rounded-xl text-xs font-bold border flex items-center justify-between ${
            pwdMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            <span>{pwdMsg.text}</span>
            <button type="button" onClick={() => setPwdMsg({ text: '', type: '' })}>✕</button>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Current Password</label>
            <input
              type="password"
              required
              value={pwdForm.currentPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
              placeholder="Enter current password"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={pwdForm.newPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
              placeholder="Min. 8 characters"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={pwdForm.confirmPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={pwdLoading}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {pwdLoading ? 'Updating Password...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
