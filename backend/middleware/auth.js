const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'smart_attendance_portal_secret_key_2026_jwt';

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No Bearer token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDB();

    if (decoded.role === 'admin') {
      let admin = null;
      if (db.type === 'mock') {
        admin = db.store.admins.find(a => a.id === decoded.id || a.username === decoded.username);
      } else if (db.type === 'supabase') {
        const { data } = await db.client.from('admins').select('*').eq('id', decoded.id).single();
        admin = data;
      } else if (db.type === 'postgres') {
        const result = await db.pool.query('SELECT * FROM admins WHERE id = $1', [decoded.id]);
        admin = result.rows[0];
      }

      if (!admin) return res.status(401).json({ success: false, message: 'Admin account not found.' });
      req.user = { ...admin, role: 'admin' };
      return next();
    } else if (decoded.role === 'student') {
      let student = null;
      if (db.type === 'mock') {
        student = db.store.students.find(s => s.id === decoded.id || s.hall_ticket_number === decoded.hall_ticket_number);
      } else if (db.type === 'supabase') {
        const { data } = await db.client.from('students').select('*').eq('id', decoded.id).single();
        student = data;
      } else if (db.type === 'postgres') {
        const result = await db.pool.query('SELECT * FROM students WHERE id = $1', [decoded.id]);
        student = result.rows[0];
      }

      if (!student) return res.status(401).json({ success: false, message: 'Student account not found.' });
      req.user = { ...student, role: 'student' };
      return next();
    } else {
      return res.status(401).json({ success: false, message: 'Invalid token role.' });
    }
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.', error: error.message });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin portal privileges required.' });
  }
  next();
};

const requireStudent = (req, res, next) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Access denied. Student portal privileges required.' });
  }
  next();
};

module.exports = { authenticateUser, requireAdmin, requireStudent, JWT_SECRET };
