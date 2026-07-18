const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  hall_ticket_number: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  department: { type: String, default: 'CSE' },
  section: { type: String, default: 'F' },
  year: { type: String, default: '3rd Year' },
  mobile_number: { type: String, default: '9876543210' },
  created_at: { type: Date, default: Date.now }
});

const adminSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const attendanceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  student_id: { type: String, required: true },
  student: {
    hall_ticket_number: String,
    name: String,
    department: String,
    section: String,
    year: String
  },
  date: { type: String, required: true },
  session_1_status: { type: String, default: 'Absent' },
  session_1_time: { type: String, default: null },
  session_1_lat: { type: Number, default: null },
  session_1_lng: { type: Number, default: null },
  session_2_status: { type: String, default: 'Absent' },
  session_2_time: { type: String, default: null },
  session_2_lat: { type: Number, default: null },
  session_2_lng: { type: Number, default: null },
  day_status: { type: String, default: 'Absent' },
  updated_at: { type: Date, default: Date.now }
});

const settingSchema = new mongoose.Schema({
  id: { type: Number, default: 1, unique: true },
  campus_latitude: { type: Number, default: 17.406500 },
  campus_longitude: { type: Number, default: 78.477200 },
  radius_meters: { type: Number, default: 500 },
  location_check_enabled: { type: Boolean, default: true },
  session_1_start: { type: String, default: '09:00' },
  session_1_end: { type: String, default: '13:00' },
  session_1_deadline: { type: String, default: '09:30' },
  session_2_start: { type: String, default: '14:00' },
  session_2_end: { type: String, default: '17:00' },
  session_2_deadline: { type: String, default: '14:30' },
  updated_at: { type: Date, default: Date.now }
});

const auditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  actor_id: { type: String, required: true },
  actor_role: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const webAuthnCredSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  student_id: { type: String, required: true },
  credential_id: { type: String, required: true },
  public_key: { type: String, required: true },
  counter: { type: Number, default: 0 },
  transports: [String],
  created_at: { type: Date, default: Date.now }
});

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema);
const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
const WebAuthnCred = mongoose.models.WebAuthnCred || mongoose.model('WebAuthnCred', webAuthnCredSchema);

module.exports = {
  Student,
  Admin,
  Attendance,
  Setting,
  AuditLog,
  WebAuthnCred
};
