import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Settings, MapPin, Clock, Save, CheckCircle, ShieldCheck, ToggleLeft, ToggleRight, Navigation, RefreshCw, Trash2 } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    campus_latitude: 17.406500,
    campus_longitude: 78.477200,
    radius_meters: 500,
    location_check_enabled: true,
    session_1_start: '09:00',
    session_1_end: '13:00',
    session_2_start: '14:00',
    session_2_end: '17:00'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

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

  const handleGetMyGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setSettings({
            ...settings,
            campus_latitude: Number(pos.coords.latitude.toFixed(6)),
            campus_longitude: Number(pos.coords.longitude.toFixed(6))
          });
          setMessage({ text: '📍 Campus center updated to your current live browser GPS coordinates!', type: 'success' });
        },
        () => {
          setMessage({ text: 'GPS permission denied or unavailable.', type: 'error' });
        }
      );
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
        {/* Geolocation Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Campus GPS Geolocation Matrix</h3>
                <p className="text-xs text-slate-400">Enforce attendance within specified radius of campus center</p>
              </div>
            </div>

            {/* ON / OFF Toggle Button */}
            <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Campus Latitude</label>
              <input
                type="number"
                step="0.000001"
                required
                value={settings.campus_latitude}
                onChange={(e) => setSettings({ ...settings, campus_latitude: parseFloat(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Campus Longitude</label>
              <input
                type="number"
                step="0.000001"
                required
                value={settings.campus_longitude}
                onChange={(e) => setSettings({ ...settings, campus_longitude: parseFloat(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Radius (Meters)</label>
              <input
                type="number"
                required
                value={settings.radius_meters}
                onChange={(e) => setSettings({ ...settings, radius_meters: parseInt(e.target.value, 10) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={handleGetMyGPS}
              className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              <Navigation className="w-4 h-4" />
              <span>Set to My Current Browser GPS Coordinates</span>
            </button>
            <span className="text-xs text-slate-500">Default Campus: Hyderabad / College Hub (500m)</span>
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

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Committing Settings to Neural Matrix...' : 'Save Campus Parameters'}</span>
        </button>
      </form>
    </div>
  );
};

export default AdminSettings;
