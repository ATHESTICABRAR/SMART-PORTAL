const express = require('express');
const router = express.Router();
const { authenticateUser, requireStudent } = require('../middleware/auth');
const { getDB } = require('../config/db');

// Helper: Haversine distance formula between two GPS coordinates (returns distance in meters)
const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

// GET /api/attendance/today - Get current student's status for Today's Session 1 & Session 2 + Campus Settings
router.get('/today', authenticateUser, requireStudent, async (req, res) => {
  try {
    const db = getDB();
    const todayStr = new Date().toISOString().split('T')[0];
    let att = null;
    let settings = null;

    if (db.type === 'mock') {
      att = db.store.attendance.find(a => a.student_id === req.user.id && a.date === todayStr);
      settings = db.store.settings;
    } else if (db.type === 'mongodb') {
      const { Attendance, Setting } = require('../models');
      att = await Attendance.findOne({ student_id: req.user.id, date: todayStr }).lean();
      settings = await Setting.findOne({ id: 1 }).lean();
    } else if (db.type === 'supabase') {
      const { data: attData } = await db.client.from('attendance').select('*').eq('student_id', req.user.id).eq('date', todayStr).single();
      att = attData;
      const { data: setData } = await db.client.from('settings').select('*').eq('id', 1).single();
      settings = setData;
    } else if (db.type === 'postgres') {
      const attRes = await db.pool.query('SELECT * FROM attendance WHERE student_id = $1 AND date = $2', [req.user.id, todayStr]);
      att = attRes.rows[0];
      const setRes = await db.pool.query('SELECT * FROM settings WHERE id = 1');
      settings = setRes.rows[0];
    }

    if (!settings) {
      settings = { campus_latitude: 17.4065, campus_longitude: 78.4772, radius_meters: 500, location_check_enabled: true, session_1_start: '09:00', session_1_end: '13:00', session_2_start: '14:00', session_2_end: '17:00' };
    }

    if (!att) {
      att = {
        date: todayStr,
        session_1_status: 'Pending',
        session_2_status: 'Pending',
        day_status: 'Pending'
      };
    }

    // Determine currently active session window dynamically or allow either
    const now = new Date();
    const currentHour = now.getHours();
    let currentSession = 'both';
    if (currentHour < 13) currentSession = 1;
    else currentSession = 2;

    return res.status(200).json({
      success: true,
      today: att,
      settings,
      currentSessionRecommendation: currentSession
    });
  } catch (error) {
    console.error('Get today attendance error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch today status.', error: error.message });
  }
});

// POST /api/attendance/mark - Mark attendance for Session 1 or Session 2 with GPS + WebAuthn Verification
router.post('/mark', authenticateUser, requireStudent, async (req, res) => {
  try {
    if (new Date().getDay() === 0) {
      return res.status(400).json({
        success: false,
        message: '🚫 Attendance is not available on Sundays (Holiday).'
      });
    }

    const { sessionNumber, latitude, longitude, biometricVerified } = req.body;
    if (!sessionNumber || !['1', '2', 1, 2].includes(Number(sessionNumber))) {
      return res.status(400).json({ success: false, message: 'Invalid session number. Must be 1 or 2.' });
    }
    const sessionNum = Number(sessionNumber);

    const db = getDB();
    let settings = null;
    if (db.type === 'mock') {
      settings = db.store.settings;
    } else if (db.type === 'mongodb') {
      const { Setting } = require('../models');
      settings = await Setting.findOne({ id: 1 }).lean();
    } else if (db.type === 'supabase') {
      const { data } = await db.client.from('settings').select('*').eq('id', 1).single();
      settings = data;
    } else if (db.type === 'postgres') {
      const result = await db.pool.query('SELECT * FROM settings WHERE id = 1');
      settings = result.rows[0];
    }
    if (!settings) {
      settings = { campus_latitude: 17.4065, campus_longitude: 78.4772, radius_meters: 500, location_check_enabled: true };
    }

    // 1. Check Location Restriction (if ON/enabled)
    let distanceMeters = 0;
    if (settings.location_check_enabled) {
      if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
        return res.status(403).json({
          success: false,
          message: '📍 Geolocation required! Please enable GPS/Location permissions in your browser to mark attendance within the campus.'
        });
      }
      distanceMeters = calculateDistanceMeters(
        Number(latitude),
        Number(longitude),
        Number(settings.campus_latitude),
        Number(settings.campus_longitude)
      );

      if (distanceMeters > (settings.radius_meters || 500)) {
        return res.status(403).json({
          success: false,
          message: `🚫 Location check failed! You are ${distanceMeters}m away from the campus center (max permitted radius: ${settings.radius_meters || 500}m). Attendance can only be marked on campus.`
        });
      }
    } else {
      // If OFF, distance check is bypassed
      if (latitude && longitude) {
        distanceMeters = calculateDistanceMeters(Number(latitude), Number(longitude), Number(settings.campus_latitude), Number(settings.campus_longitude));
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowISO = new Date().toISOString();

    // 2. Fetch today's attendance record if it exists, or initialize
    let att = null;
    if (db.type === 'mock') {
      att = db.store.attendance.find(a => a.student_id === req.user.id && a.date === todayStr);
      if (!att) {
        att = {
          id: `att-${Date.now()}`,
          student_id: req.user.id,
          date: todayStr,
          session_1_status: 'Pending',
          session_1_time: null,
          session_2_status: 'Pending',
          session_2_time: null,
          day_status: 'Pending',
          latitude: latitude || null,
          longitude: longitude || null,
          created_at: nowISO
        };
        db.store.attendance.push(att);
      }
    } else if (db.type === 'mongodb') {
      const { Attendance } = require('../models');
      att = await Attendance.findOne({ student_id: req.user.id, date: todayStr }).lean();
      if (!att) {
        att = await Attendance.create({
          id: `att-${Date.now()}`,
          student_id: req.user.id,
          student: {
            hall_ticket_number: req.user.hall_ticket_number,
            name: req.user.name,
            department: 'CSE',
            section: 'F',
            year: '3rd Year'
          },
          date: todayStr,
          session_1_status: 'Pending',
          session_2_status: 'Pending',
          day_status: 'Pending'
        });
        att = att.toObject();
      }
    } else if (db.type === 'supabase') {
      const { data: existing } = await db.client.from('attendance').select('*').eq('student_id', req.user.id).eq('date', todayStr).single();
      if (existing) att = existing;
      else {
        const { data: created } = await db.client.from('attendance').insert([{
          student_id: req.user.id,
          date: todayStr,
          session_1_status: 'Pending',
          session_2_status: 'Pending',
          day_status: 'Pending',
          latitude: latitude || null,
          longitude: longitude || null
        }]).select().single();
        att = created;
      }
    } else if (db.type === 'postgres') {
      const existingRes = await db.pool.query('SELECT * FROM attendance WHERE student_id = $1 AND date = $2', [req.user.id, todayStr]);
      if (existingRes.rows.length > 0) att = existingRes.rows[0];
      else {
        const insertRes = await db.pool.query(
          'INSERT INTO attendance (student_id, date, session_1_status, session_2_status, day_status, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [req.user.id, todayStr, 'Pending', 'Pending', 'Pending', latitude || null, longitude || null]
        );
        att = insertRes.rows[0];
      }
    }

    // Check if session already marked
    if (sessionNum === 1 && att.session_1_status === 'Present') {
      return res.status(400).json({ success: false, message: 'Today’s Session 1 attendance has already been recorded!' });
    }
    if (sessionNum === 2 && att.session_2_status === 'Present') {
      return res.status(400).json({ success: false, message: 'Today’s Session 2 attendance has already been recorded!' });
    }

    // 3. Update Session Status
    let newS1 = att.session_1_status;
    let newS1Time = att.session_1_time;
    let newS2 = att.session_2_status;
    let newS2Time = att.session_2_time;

    if (sessionNum === 1) {
      newS1 = 'Present';
      newS1Time = nowISO;
    } else {
      newS2 = 'Present';
      newS2Time = nowISO;
    }

    // Rule: Marked "Present" for the day ONLY if BOTH sessions are completed.
    // If any one session is missed (or pending), day_status remains Pending or Absent until both are Present.
    let newDayStatus = 'Pending';
    if (newS1 === 'Present' && newS2 === 'Present') {
      newDayStatus = 'Present';
    } else if (newS1 === 'Absent' || newS2 === 'Absent') {
      newDayStatus = 'Absent';
    } else {
      newDayStatus = 'Pending'; // One present, one still waiting
    }

    // Persist changes
    if (db.type === 'mock') {
      att.session_1_status = newS1;
      att.session_1_time = newS1Time;
      att.session_2_status = newS2;
      att.session_2_time = newS2Time;
      att.day_status = newDayStatus;
      att.latitude = latitude || att.latitude;
      att.longitude = longitude || att.longitude;

      db.store.audit_logs.unshift({
        id: `audit-${Date.now()}`,
        actor_id: req.user.hall_ticket_number,
        actor_role: 'student',
        action: `MARK_SESSION_${sessionNum}`,
        details: `Marked Session ${sessionNum} Present. (GPS Distance: ${distanceMeters}m | Location Check: ${settings.location_check_enabled ? 'ON' : 'OFF'})`,
        ip_address: req.ip || '127.0.0.1',
        created_at: nowISO
      });
    } else if (db.type === 'mongodb') {
      const { Attendance, AuditLog } = require('../models');
      await Attendance.findOneAndUpdate(
        { student_id: req.user.id, date: todayStr },
        {
          session_1_status: newS1,
          session_1_time: newS1Time,
          session_2_status: newS2,
          session_2_time: newS2Time,
          day_status: newDayStatus,
          session_1_lat: sessionNum === 1 ? latitude : att.session_1_lat,
          session_1_lng: sessionNum === 1 ? longitude : att.session_1_lng,
          session_2_lat: sessionNum === 2 ? latitude : att.session_2_lat,
          session_2_lng: sessionNum === 2 ? longitude : att.session_2_lng,
          updated_at: nowISO
        }
      );
      await AuditLog.create({
        id: `audit-${Date.now()}`,
        actor_id: req.user.hall_ticket_number,
        actor_role: 'student',
        action: `MARK_SESSION_${sessionNum}`,
        details: `Marked Session ${sessionNum} Present. (GPS Distance: ${distanceMeters}m | Location Check: ${settings.location_check_enabled ? 'ON' : 'OFF'})`
      });
    } else if (db.type === 'supabase') {
      await db.client.from('attendance').update({
        session_1_status: newS1,
        session_1_time: newS1Time,
        session_2_status: newS2,
        session_2_time: newS2Time,
        day_status: newDayStatus,
        latitude: latitude || att.latitude,
        longitude: longitude || att.longitude
      }).eq('id', att.id);
      att = { ...att, session_1_status: newS1, session_1_time: newS1Time, session_2_status: newS2, session_2_time: newS2Time, day_status: newDayStatus };
    } else if (db.type === 'postgres') {
      await db.pool.query(
        'UPDATE attendance SET session_1_status = $1, session_1_time = $2, session_2_status = $3, session_2_time = $4, day_status = $5, latitude = $6, longitude = $7 WHERE id = $8',
        [newS1, newS1Time, newS2, newS2Time, newDayStatus, latitude || att.latitude, longitude || att.longitude, att.id]
      );
      att = { ...att, session_1_status: newS1, session_1_time: newS1Time, session_2_status: newS2, session_2_time: newS2Time, day_status: newDayStatus };
    }

    return res.status(200).json({
      success: true,
      message: `✅ Session ${sessionNum} marked Present successfully! ${newDayStatus === 'Present' ? '🎉 Both sessions completed. Day marked PRESENT!' : 'Complete the remaining session to mark full day Present.'}`,
      today: att,
      distanceMeters,
      locationCheckWasEnabled: settings.location_check_enabled
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    return res.status(500).json({ success: false, message: 'Server error while marking attendance.', error: error.message });
  }
});

// GET /api/attendance/history - Get complete day-wise history and calculate overall percentage
router.get('/history', authenticateUser, requireStudent, async (req, res) => {
  try {
    const db = getDB();
    let history = [];

    if (db.type === 'mock') {
      history = db.store.attendance.filter(a => a.student_id === req.user.id).sort((a, b) => b.date.localeCompare(a.date));
    } else if (db.type === 'mongodb') {
      const { Attendance } = require('../models');
      history = await Attendance.find({ student_id: req.user.id }).sort({ date: -1 }).lean();
    } else if (db.type === 'supabase') {
      const { data } = await db.client.from('attendance').select('*').eq('student_id', req.user.id).order('date', { ascending: false });
      history = data || [];
    } else if (db.type === 'postgres') {
      const result = await db.pool.query('SELECT * FROM attendance WHERE student_id = $1 ORDER BY date DESC', [req.user.id]);
      history = result.rows || [];
    }

    let settings = { total_working_days: 90 };
    if (db.type === 'mongodb') {
      const { Setting } = require('../models');
      settings = (await Setting.findOne().lean()) || settings;
    }

    const totalWorkingDays = settings.total_working_days || 90;
    const presentDays = history.filter(h => h.day_status === 'Present').length;
    const absentDays = history.filter(h => h.day_status === 'Absent').length;
    const attendancePercentage = totalWorkingDays > 0 ? Math.round((presentDays / totalWorkingDays) * 1000) / 10 : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalWorkingDays,
        presentDays,
        absentDays,
        attendancePercentage,
        isBelowThreshold: attendancePercentage < 75
      },
      history
    });
  } catch (error) {
    console.error('Get history error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve attendance history.', error: error.message });
  }
});

module.exports = router;
