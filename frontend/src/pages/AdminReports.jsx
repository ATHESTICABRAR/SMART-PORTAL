import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileSpreadsheet, Download, Filter, Calendar, CheckCircle, XCircle, Share2, MessageCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [department, setDepartment] = useState('');
  const [selectedSession, setSelectedSession] = useState('all');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reports', { params: { range, date, department } });
      setReports(res.data.reports || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [range, date, department]);

  const exportToExcel = () => {
    const data = reports.map(r => {
      const row = {
        'Hall Ticket': r.student?.hall_ticket_number || r.student_id,
        'Student Name': r.student?.name || 'N/A',
        'Department': r.student?.department || 'CSE',
        'Date': r.date
      };
      if (selectedSession === 'all' || selectedSession === 'session_1') {
        row['Session 1 Status'] = r.session_1_status;
        row['Session 1 Time'] = r.session_1_time || '—';
      }
      if (selectedSession === 'all' || selectedSession === 'session_2') {
        row['Session 2 Status'] = r.session_2_status;
        row['Session 2 Time'] = r.session_2_time || '—';
      }
      if (selectedSession === 'all') {
        row['Overall Day Status'] = r.day_status;
      }
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');
    XLSX.writeFile(workbook, `Attendance_Report_${range}_${date}_${selectedSession}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Smart Attendance Portal — ${range.toUpperCase()} REPORT`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated Date: ${date} | Session: ${selectedSession.toUpperCase()}`, 14, 22);

    let tableColumn = ['Hall Ticket', 'Name', 'Dept', 'Date'];
    if (selectedSession === 'all' || selectedSession === 'session_1') tableColumn.push('S1 Status');
    if (selectedSession === 'all' || selectedSession === 'session_2') tableColumn.push('S2 Status');
    if (selectedSession === 'all') tableColumn.push('Day Status');

    const tableRows = reports.map(r => {
      const row = [
        r.student?.hall_ticket_number || r.student_id,
        r.student?.name || 'N/A',
        r.student?.department || 'CSE',
        r.date
      ];
      if (selectedSession === 'all' || selectedSession === 'session_1') row.push(r.session_1_status);
      if (selectedSession === 'all' || selectedSession === 'session_2') row.push(r.session_2_status);
      if (selectedSession === 'all') row.push(r.day_status);
      return row;
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      styles: { fontSize: 8 }
    });

    doc.save(`Attendance_Report_${range}_${date}_${selectedSession}.pdf`);
  };

  const shareToWhatsApp = () => {
    if (!reports || reports.length === 0) return;

    // Date formatting: e.g. "18 July 2026"
    const dateObj = new Date(date + 'T00:00:00');
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = dateObj.toLocaleDateString('en-GB', options);

    // Current time formatting: e.g. "02:35 PM"
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const currentHour = now.getHours();
    const isMorning = currentHour < 12;
    
    let sessionLabel = isMorning ? `Morning (06:00 - 12:00) ${timeString}` : `Afternoon (12:01 - 5:00) ${timeString}`;
    if (selectedSession === 'session_1') sessionLabel = `Session 1 (Morning Window) ${timeString}`;
    if (selectedSession === 'session_2') sessionLabel = `Session 2 (Afternoon Window) ${timeString}`;

    // Separate present and absent based on selected session
    const presentList = reports.filter(r => {
      if (selectedSession === 'session_1') return r.session_1_status === 'Present';
      if (selectedSession === 'session_2') return r.session_2_status === 'Present';
      return r.day_status === 'Present' || r.session_1_status === 'Present' || r.session_2_status === 'Present';
    });
    const absentList = reports.filter(r => !presentList.includes(r));

    const totalCount = reports.length;
    const presentCount = presentList.length;
    const absentCount = absentList.length;
    const percentage = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(2) : '0.00';

    // Extract last 2 characters of Hall Ticket Number (e.g., 24Q91A05AA -> AA, 25Q95A0534 -> 34)
    const presentRolls = presentList.map(r => {
      const ht = r.student?.hall_ticket_number || r.student_id || '';
      return ht.slice(-2);
    }).join(', ');

    const absentRolls = absentList.map(r => {
      const ht = r.student?.hall_ticket_number || r.student_id || '';
      return ht.slice(-2);
    }).join(', ');

    const text = `III CSE F Attendance ${formattedDate}\n` +
      `${sessionLabel}\n\n` +
      `Present (${presentCount}/${totalCount}) - ${percentage}%:\n` +
      `${presentRolls || 'None'}\n\n` +
      `Absent (${absentCount}):\n` +
      `${absentRolls || 'None'}`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">System Attendance Reports</h2>
          <p className="text-sm text-slate-400 mt-0.5">Filter and export session verification logs in Excel (.xlsx) and PDF format</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={shareToWhatsApp}
            disabled={reports.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 text-xs font-extrabold transition-all shadow-md disabled:opacity-50"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Share WhatsApp</span>
          </button>
          <button
            onClick={exportToExcel}
            disabled={reports.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={exportToPDF}
            disabled={reports.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-lg">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none"
            >
              <option value="daily" className="bg-slate-900">Daily Report</option>
              <option value="weekly" className="bg-slate-900">Weekly Summary</option>
              <option value="monthly" className="bg-slate-900">Monthly Ledger</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none"
            />
          </div>

          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-blue-400 font-bold text-xs focus:outline-none"
          >
            <option value="">III CSE — Section F (All Records)</option>
            <option value="CSE">CSE — Section F</option>
          </select>

          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => setSelectedSession('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedSession === 'all' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Both Sessions
            </button>
            <button
              type="button"
              onClick={() => setSelectedSession('session_1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedSession === 'session_1' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Session 1 Only
            </button>
            <button
              type="button"
              onClick={() => setSelectedSession('session_2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedSession === 'session_2' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Session 2 Only
            </button>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-400">
          Showing <strong className="text-white">{reports.length}</strong> records
        </span>
      </div>

      {/* Reports Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Hall Ticket</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Dept</th>
                <th className="py-3.5 px-4">Date</th>
                {(selectedSession === 'all' || selectedSession === 'session_1') && (
                  <th className="py-3.5 px-4">Session 1</th>
                )}
                {(selectedSession === 'all' || selectedSession === 'session_2') && (
                  <th className="py-3.5 px-4">Session 2</th>
                )}
                {selectedSession === 'all' && (
                  <th className="py-3.5 px-4">Overall Day Status</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">Generating analytical ledger...</td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">No attendance logs found for specified date and filter.</td>
                </tr>
              ) : (
                reports.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{r.student?.hall_ticket_number || r.student_id}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{r.student?.name || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-300">{r.student?.department || 'CSE'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{r.date}</td>
                    {(selectedSession === 'all' || selectedSession === 'session_1') && (
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${r.session_1_status === 'Present' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'}`}>
                          {r.session_1_status} {r.session_1_time ? `(${r.session_1_time})` : ''}
                        </span>
                      </td>
                    )}
                    {(selectedSession === 'all' || selectedSession === 'session_2') && (
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${r.session_2_status === 'Present' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'}`}>
                          {r.session_2_status} {r.session_2_time ? `(${r.session_2_time})` : ''}
                        </span>
                      </td>
                    )}
                    {selectedSession === 'all' && (
                      <td className="py-3.5 px-4 font-bold">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                          r.day_status === 'Present' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'
                        }`}>
                          {r.day_status === 'Present' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {r.day_status}
                        </span>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
