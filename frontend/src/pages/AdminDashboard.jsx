import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, CheckCircle, XCircle, TrendingUp, RefreshCw, ShieldAlert, MessageCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionList, setSectionList] = useState([]);
  const [loadingSection, setLoadingSection] = useState(false);
  const [sectionSearch, setSectionSearch] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard-stats');
      setStats(res.data.stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const shareToWhatsApp = async () => {
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const res = await api.get('/admin/reports', { params: { range: 'daily', date: dateStr } });
      const reports = res.data.reports || [];

      const dateObj = new Date(dateStr + 'T00:00:00');
      const formattedDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const sessionLabel = now.getHours() < 12 ? `Morning (06:00 - 12:00) ${timeString}` : `Afternoon (12:01 - 5:00) ${timeString}`;

      const presentList = reports.filter(r => r.day_status === 'Present' || r.session_1_status === 'Present' || r.session_2_status === 'Present');
      const absentList = reports.filter(r => !presentList.includes(r));

      const totalCount = reports.length;
      const presentCount = presentList.length;
      const absentCount = absentList.length;
      const percentage = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(2) : '0.00';

      const presentRolls = presentList.map(r => (r.student?.hall_ticket_number || r.student_id || '').slice(-2)).join(', ');
      const absentRolls = absentList.map(r => (r.student?.hall_ticket_number || r.student_id || '').slice(-2)).join(', ');

      const text = `III CSE F Attendance ${formattedDate}\n` +
        `${sessionLabel}\n\n` +
        `Present (${presentCount}/${totalCount}) - ${percentage}%:\n` +
        `${presentRolls || 'None'}\n\n` +
        `Absent (${absentCount}):\n` +
        `${absentRolls || 'None'}`;

      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } catch (err) {
      console.error('Error generating WhatsApp summary:', err);
    }
  };

  const openSectionFModal = async () => {
    setShowSectionModal(true);
    setLoadingSection(true);
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const res = await api.get('/admin/reports', { params: { range: 'daily', date: dateStr, department: 'CSE' } });
      const reports = res.data.reports || [];
      const sectionF = reports.filter(r => (r.student?.section || 'F').toUpperCase() === 'F');
      setSectionList(sectionF);
    } catch (err) {
      console.error('Error loading Section F roster:', err);
    } finally {
      setLoadingSection(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400 font-semibold text-lg animate-pulse">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
          <span>Loading Management Console Overview...</span>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'CSE - Sec F (3rd Yr)', present: stats?.presentToday ?? 0, absent: stats?.absentToday ?? 0 }
  ];

  const pieData = [
    { name: 'Present Today', value: stats?.presentToday ?? 0 },
    { name: 'Absent Today', value: stats?.absentToday ?? 0 }
  ];

  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">University Attendance Analytics</h2>
          <p className="text-sm text-slate-400 mt-0.5">Real-time Session 1 & 2 biometric verification summary</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <button
            onClick={shareToWhatsApp}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 text-xs font-extrabold transition-all shadow-md"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Share WhatsApp</span>
          </button>
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700 shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-blue-400" />
            <span>Refresh Analytics</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Enrolled</span>
            <div className="text-3xl font-extrabold text-white mt-2 font-mono">{stats?.totalStudents || 65}</div>
            <p className="text-[11px] text-slate-500 mt-1">Official Student Directory</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Present Today</span>
            <div className="text-3xl font-extrabold text-emerald-300 mt-2 font-mono">{stats?.presentToday ?? 0}</div>
            <p className="text-[11px] text-slate-500 mt-1">Both/Active session check</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">Absent Today</span>
            <div className="text-3xl font-extrabold text-red-300 mt-2 font-mono">{stats?.absentToday ?? 0}</div>
            <p className="text-[11px] text-slate-500 mt-1">Missed required session</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Average Attendance</span>
            <div className="text-3xl font-extrabold text-amber-300 mt-2 font-mono">{stats?.avgAttendancePercentage || 88.4}%</div>
            <p className="text-[11px] text-slate-500 mt-1">Day-wise university index</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Section F Quick Roster Banner */}
      <div
        onClick={openSectionFModal}
        className="bg-gradient-to-r from-blue-900/50 via-indigo-900/40 to-slate-900 border border-blue-500/40 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:border-blue-400 transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-extrabold text-lg border border-blue-500/30 group-hover:scale-105 transition-transform">
            III
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base sm:text-lg">III Year CSE — Section F (Our Section)</h3>
              <span className="bg-blue-500/20 text-blue-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-blue-500/30">ONLY FOR OUR SECTION</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">Click here or click the bar chart below to view all 65 student names & live session attendance</p>
          </div>
        </div>
        <button className="px-4 py-2 rounded-xl bg-blue-600 group-hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 flex-shrink-0">
          <Users className="w-4 h-4" />
          <span>View Names & Status</span>
        </button>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="font-bold text-lg text-white mb-4">III Year CSE — Section F Attendance Verification (Our Section)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                onClick={(data) => {
                  if (data && data.activePayload && data.activePayload[0]?.payload?.name?.includes('CSE - Sec F')) {
                    openSectionFModal();
                  }
                }}
                className="cursor-pointer"
              >
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Bar dataKey="present" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Present Students" />
                <Bar dataKey="absent" fill="#ef4444" radius={[6, 6, 0, 0]} name="Absent Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <h3 className="font-bold text-lg text-white mb-4">Today's Attendance Split</h3>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-xs text-slate-300 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Present ({stats?.presentToday ?? 0})</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /> Absent ({stats?.absentToday ?? 0})</span>
          </div>
        </div>
      </div>

      {/* Section F Student Names Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-white">III Year CSE — Section F Student Names</h3>
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded text-xs font-mono font-bold">OUR SECTION</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Live real-time attendance verification for all 65 students in Section CSE F</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search name or hall ticket..."
                  value={sectionSearch}
                  onChange={(e) => setSectionSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 w-48 sm:w-64"
                />
                <button
                  onClick={() => setShowSectionModal(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 mt-4 border border-slate-800/80 rounded-2xl bg-slate-950/60">
              {loadingSection ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                  <span>Loading Section F Roster and Live Verification Status...</span>
                </div>
              ) : sectionList.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  No students found in Section F matching search criteria.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase font-bold sticky top-0">
                      <th className="py-3 px-4">Hall Ticket Number</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Session 1</th>
                      <th className="py-3 px-4">Session 2</th>
                      <th className="py-3 px-4 text-right">Day Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {sectionList
                      .filter(r => {
                        if (!sectionSearch) return true;
                        const q = sectionSearch.toLowerCase();
                        const ht = (r.student?.hall_ticket_number || r.student_id || '').toLowerCase();
                        const nm = (r.student?.name || '').toLowerCase();
                        return ht.includes(q) || nm.includes(q);
                      })
                      .map((item, idx) => {
                        const st = item.student || {};
                        return (
                          <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-mono text-blue-400 font-bold">{st.hall_ticket_number || item.student_id}</td>
                            <td className="py-3 px-4 font-semibold text-slate-200">{st.name || 'Unknown Student'}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded font-bold ${
                                item.session_1_status === 'Present' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                              }`}>
                                {item.session_1_status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded font-bold ${
                                item.session_2_status === 'Present' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                              }`}>
                                {item.session_2_status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-bold">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg ${
                                item.day_status === 'Present' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                              }`}>
                                {item.day_status === 'Present' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {item.day_status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div>Showing exact roster for <strong className="text-white font-mono">III Year CSE - Section F</strong></div>
              <button
                onClick={shareToWhatsApp}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-extrabold shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Share Section F Summary to WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
