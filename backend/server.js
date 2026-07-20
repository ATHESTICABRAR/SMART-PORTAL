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

// Start Server
connectDB().then((dbInfo) => {
  app.listen(PORT, () => {
    console.log(`==================================================================`);
    console.log(`🚀 Smart Attendance Portal API running on http://localhost:${PORT}`);
    console.log(`📡 DB Mode: [${dbInfo.type.toUpperCase()}]`);
    console.log(`==================================================================`);
  });
}).catch(err => {
  console.error('Failed to initialize database connection:', err);
});

module.exports = app;
