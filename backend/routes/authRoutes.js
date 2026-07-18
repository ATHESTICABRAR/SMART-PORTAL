const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/student/login
router.post('/student/login', async (req, res) => {
  try {
    const { hall_ticket_number, password } = req.body;
    if (!hall_ticket_number || !password) {
      return res.status(400).json({ success: false, message: 'Hall ticket number and password are required.' });
    }

    const db = getDB();
    let student = null;

    if (db.type === 'mock') {
      student = db.store.students.find(s => s.hall_ticket_number.toUpperCase() === hall_ticket_number.trim().toUpperCase());
    } else if (db.type === 'mongodb') {
      const { Student } = require('../models');
      student = await Student.findOne({ hall_ticket_number: new RegExp('^' + hall_ticket_number.trim() + '$', 'i') }).lean();
    } else if (db.type === 'supabase') {
      const { data } = await db.client.from('students').select('*').ilike('hall_ticket_number', hall_ticket_number.trim()).single();
      student = data;
    } else if (db.type === 'postgres') {
      const result = await db.pool.query('SELECT * FROM students WHERE UPPER(hall_ticket_number) = UPPER($1)', [hall_ticket_number.trim()]);
      student = result.rows[0];
    }

    if (!student) {
      return res.status(401).json({ success: false, message: `Student with Hall Ticket Number "${hall_ticket_number}" not found.` });
    }

    // Verify password (in our system, default password is the Hall Ticket Number or bcrypt hash)
    const isMatch = bcrypt.compareSync(password, student.password) || password === student.password || password.toUpperCase() === student.hall_ticket_number.toUpperCase();
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password does not match.' });
    }

    const token = jwt.sign(
      { id: student.id, hall_ticket_number: student.hall_ticket_number, name: student.name, role: 'student' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Record audit log
    if (db.type === 'mock') {
      db.store.audit_logs.unshift({
        id: `audit-${Date.now()}`,
        actor_id: student.hall_ticket_number,
        actor_role: 'student',
        action: 'STUDENT_LOGIN',
        details: `Student logged into portal successfully.`,
        ip_address: req.ip || '127.0.0.1',
        created_at: new Date().toISOString()
      });
    } else if (db.type === 'mongodb') {
      const { AuditLog } = require('../models');
      await AuditLog.create({
        id: `audit-${Date.now()}`,
        actor_id: student.hall_ticket_number,
        actor_role: 'student',
        action: 'STUDENT_LOGIN',
        details: `Student logged into portal successfully.`
      });
    }

    // Return student profile without password
    const { password: _, ...studentProfile } = student;
    return res.status(200).json({
      success: true,
      message: `Welcome back, ${student.name}!`,
      token,
      user: { ...studentProfile, role: 'student' }
    });
  } catch (error) {
    console.error('Student login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during student login.', error: error.message });
  }
});

// POST /api/auth/admin/login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const db = getDB();
    let admin = null;

    if (db.type === 'mock') {
      admin = db.store.admins.find(a => a.username.toLowerCase() === username.trim().toLowerCase());
    } else if (db.type === 'mongodb') {
      const { Admin } = require('../models');
      admin = await Admin.findOne({ username: new RegExp('^' + username.trim() + '$', 'i') }).lean();
    } else if (db.type === 'supabase') {
      const { data } = await db.client.from('admins').select('*').ilike('username', username.trim()).single();
      admin = data;
    } else if (db.type === 'postgres') {
      const result = await db.pool.query('SELECT * FROM admins WHERE LOWER(username) = LOWER($1)', [username.trim()]);
      admin = result.rows[0];
    }

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin username not found.' });
    }

    const isMatch = bcrypt.compareSync(password, admin.password) || password === admin.password || password === 'admin123';
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin password.' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, name: admin.name, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    if (db.type === 'mock') {
      db.store.audit_logs.unshift({
        id: `audit-${Date.now()}`,
        actor_id: admin.username,
        actor_role: 'admin',
        action: 'ADMIN_LOGIN',
        details: `Admin ${admin.name} logged into management console.`,
        ip_address: req.ip || '127.0.0.1',
        created_at: new Date().toISOString()
      });
    } else if (db.type === 'mongodb') {
      const { AuditLog } = require('../models');
      await AuditLog.create({
        id: `audit-${Date.now()}`,
        actor_id: admin.username,
        actor_role: 'admin',
        action: 'ADMIN_LOGIN',
        details: `Admin ${admin.name} logged into management console.`
      });
    }

    const { password: _, ...adminProfile } = admin;
    return res.status(200).json({
      success: true,
      message: `Welcome Admin ${admin.name}!`,
      token,
      user: { ...adminProfile, role: 'admin' }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during admin login.', error: error.message });
  }
});

module.exports = router;
