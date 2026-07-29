require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const webauthnRoutes = require('./routes/webauthnRoutes');
const frsRoutes = require('./routes/frsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webauthn', webauthnRoutes);

// TEMPORARY FORCE SEED ROUTE
app.get('/api/force-seed', async (req, res) => {
  try {
    const { getDB, mockStore } = require('./config/db');
    const db = getDB();
    if (db.type === 'mongodb') {
      const { Student, Admin, Setting } = require('./models');
      await Student.deleteMany({});
      await Admin.deleteMany({});
      await Student.insertMany(mockStore.students);
      await Admin.insertMany(mockStore.admins);
      const count = await Setting.countDocuments();
      if (count === 0) await Setting.create(mockStore.settings);
      return res.send(`<h1>✅ Database Force Seeded Successfully!</h1><p>Inserted ${mockStore.students.length} students into MongoDB.</p>`);
    } else {
      return res.send(`<h1>⚠️ Using Mock DB</h1><p>Mock DB always has ${mockStore.students.length} students loaded in memory.</p>`);
    }
  } catch (error) {
    return res.status(500).send(`<h1>❌ Seed Error</h1><pre>${error.message}</pre>`);
  }
});
app.use('/api/frs', frsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Smart Attendance Portal API',
    status: 'Online & Ready ⚡',
    timestamp: new Date().toISOString()
  });
});

// Start Server (Triggering Render Rebuild)
connectDB().then((dbInfo) => {
  if (require.main === module) {
    app.listen(PORT, () => {
      console.log(`==================================================================`);
      console.log(`🚀 Smart Attendance Portal API running on http://localhost:${PORT}`);
      console.log(`📡 DB Mode: [${dbInfo.type.toUpperCase()}]`);
      console.log(`==================================================================`);
    });
  }
}).catch(err => {
  console.error('Failed to initialize database connection:', err);
});

module.exports = app;
