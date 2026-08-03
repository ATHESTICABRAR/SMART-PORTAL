const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

let supabase = null;
let pgPool = null;
let mongoConn = null;
let useMock = process.env.USE_MOCK_DB === 'true' || (!process.env.MONGO_URI && (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('your-supabase-id')));

const DB_FILE_PATH = path.join(__dirname, '../data/mock_db.json');
const TMP_DB_FILE_PATH = path.join('/tmp', 'mock_db.json');

// In-Memory Database store for instant local development & fallback
const mockStore = {
  admins: [
    {
      id: 'admin-001',
      username: '24Q91A05BP',
      password: bcrypt.hashSync('admin123', 8),
      name: 'Mohammad Abrar (Admin)',
      created_at: new Date().toISOString()
    }
  ],
  students: [],
  attendance: [],
  settings: {
    id: 1,
    campus_ip_addresses: '',
    location_check_enabled: true,
    trial_mode_enabled: true,
    session_1_start: '09:00',
    session_1_end: '13:00',
    session_1_deadline: '09:30',
    session_2_start: '14:00',
    session_2_end: '17:00',
    session_2_deadline: '14:30',
    total_working_days: 90,
    updated_at: new Date().toISOString()
  },
  webauthn_credentials: [],
  audit_logs: []
};

// Seed exact 65 students where password = hall_ticket_number
const seedRoster = [
  ['24Q91A05AA', 'Bollam Yashwanth'],
  ['24Q91A05AB', 'C Harthik'],
  ['24Q91A05AC', 'Ch Praveen Raju'],
  ['24Q91A05AD', 'Challa Rishitha'],
  ['24Q91A05AE', 'Chinnolla Pravallika'],
  ['24Q91A05AF', 'Dage Mallika'],
  ['24Q91A05AG', 'Daravath Sravani'],
  ['24Q91A05AH', 'Dasari Kiran'],
  ['24Q91A05AJ', 'Deeravath Jagadish Nayak'],
  ['24Q91A05AK', 'Dheeravath Tinku'],
  ['24Q91A05AL', 'G Keerthi'],
  ['24Q91A05AM', 'Gorribanda Anitha'],
  ['24Q91A05AP', 'Gudam Akshaya'],
  ['24Q91A05AR', 'Jummula Abishai'],
  ['24Q91A05AT', 'Jeela Alekhya'],
  ['24Q91A05AU', 'K Sai Chandra'],
  ['24Q91A05AV', 'Kalyankar Saiteja'],
  ['24Q91A05AW', 'Kanikatla Nishad'],
  ['24Q91A05AX', 'Karipe Praneeth'],
  ['24Q91A05AY', 'Katigher Vaagdevi'],
  ['24Q91A05AZ', 'Kola Aparna'],
  ['24Q91A05BA', 'Konda Lakshmi'],
  ['24Q91A05BB', 'Kota Nandini'],
  ['24Q91A05BC', 'Kota Shashanth'],
  ['24Q91A05BD', 'Kotagiri Rakesh'],
  ['24Q91A05BE', 'Kukkarikalla Kalyani'],
  ['24Q91A05BF', 'Lalagari Harika'],
  ['24Q91A05BG', 'Madunagula Jyoshna'],
  ['24Q91A05BJ', 'Mandru Susun'],
  ['24Q91A05BK', 'Maryada Keerthi'],
  ['24Q91A05BL', 'Medi Deepthi Sree'],
  ['24Q91A05BM', 'Mekala Hayanth'],
  ['24Q91A05BN', 'Miriyala V S D S Mukunda Sharma'],
  ['24Q91A05BP', 'Mohammad Abrar'],
  ['24Q91A05BQ', 'Mohammad Saif Parvez'],
  ['24Q91A05BT', 'Nomula Bhaskar'],
  ['24Q91A05BU', 'Nuthanapati Navadeep'],
  ['24Q91A05BV', 'P Vinay Tagore Goud'],
  ['24Q91A05BW', 'Paladugu Signari'],
  ['24Q91A05BX', 'Peddinti Prashanth Kumar'],
  ['24Q91A05BY', 'Rampalli Manoj Kumar'],
  ['24Q91A05BZ', 'Rayala Karthikeya'],
  ['24Q91A05CA', 'Shaik Behad Sayanaa'],
  ['24Q91A05CB', 'Shaik Nishat'],
  ['24Q91A05CC', 'Singarapu Prem'],
  ['24Q91A05CD', 'Sunkara Mohan Anji Reddy'],
  ['24Q91A05CE', 'Talari Raj Kumar'],
  ['24Q91A05CF', 'Tejavath Arun'],
  ['24Q91A05CG', 'Thumkunta Sai Pavan Goud'],
  ['24Q91A05CH', 'V Charitha'],
  ['24Q91A05CJ', 'Vankudoth Sathish'],
  ['24Q91A05CK', 'Yabnod Shivprasad'],
  ['24Q91A05CL', 'Yedla Gnanavyshnavi'],
  ['24Q91A05Z4', 'Anumala Sidvitha'],
  ['24Q91A05Z5', 'Askani Sinduja'],
  ['24Q91A05Z6', 'Avadhanam Parthiv Kumar'],
  ['24Q91A05Z7', 'Avula Karthikeya'],
  ['24Q91A05Z9', 'Banoth Sandeep'],
  ['25Q95A0532', 'Jagarla Anshith'],
  ['25Q95A0533', 'Manda Meghana'],
  ['25Q95A0534', 'Nakka Surya Narayana'],
  ['25Q95A0535', 'Putukam Maruthi'],
  ['25Q95A0536', 'Ramavath Yashwanth'],
  ['25Q95A0537', 'Sirigiri Lavanya'],
  ['25Q95A0538', 'Rebba Manaswini']
];

seedRoster.forEach(([hallTicket, name], idx) => {
  mockStore.students.push({
    id: `student-${idx + 1}`,
    hall_ticket_number: hallTicket,
    name: name,
    mobile_number: `98765432${(idx % 90) + 10}`,
    password: bcrypt.hashSync(hallTicket, 8),
    department: 'CSE',
    section: 'F',
    year: '3rd Year',
    created_at: new Date().toISOString()
  });
});

// Load saved local data if available to prevent settings or dead times resetting on server restart
const loadSavedMockStore = () => {
  try {
    let filePathToLoad = null;
    if (fs.existsSync(DB_FILE_PATH)) filePathToLoad = DB_FILE_PATH;
    else if (fs.existsSync(TMP_DB_FILE_PATH)) filePathToLoad = TMP_DB_FILE_PATH;

    if (filePathToLoad) {
      const raw = fs.readFileSync(filePathToLoad, 'utf8');
      const saved = JSON.parse(raw);
      if (saved.settings) {
        Object.assign(mockStore.settings, saved.settings);
      }
      if (saved.admins && Array.isArray(saved.admins) && saved.admins.length > 0) {
        mockStore.admins = saved.admins;
      }
      if (saved.students && Array.isArray(saved.students) && saved.students.length > 0) {
        mockStore.students = saved.students;
      }
      if (saved.attendance && Array.isArray(saved.attendance)) {
        mockStore.attendance = saved.attendance;
      }
      if (saved.audit_logs && Array.isArray(saved.audit_logs)) {
        mockStore.audit_logs = saved.audit_logs;
      }
      if (saved.webauthn_credentials && Array.isArray(saved.webauthn_credentials)) {
        mockStore.webauthn_credentials = saved.webauthn_credentials;
      }
      console.log('📂 Loaded persisted local data from:', filePathToLoad);
    }
  } catch (err) {
    console.error('⚠️ Could not load persisted mock store:', err.message);
  }
};

loadSavedMockStore();

const saveMockStore = () => {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(mockStore, null, 2), 'utf8');
  } catch (err) {
    try {
      fs.writeFileSync(TMP_DB_FILE_PATH, JSON.stringify(mockStore, null, 2), 'utf8');
    } catch (tmpErr) {
      console.error('⚠️ Could not persist mockStore to file:', tmpErr.message);
    }
  }
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (uri && uri.trim() !== '') {
    try {
      if (mongoose.connection.readyState === 1) {
        return { type: 'mongodb', client: mongoose };
      }
      
      mongoConn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000, // Fail fast on Vercel if IP blocked
        socketTimeoutMS: 45000,
      });
      console.log('🌟 Connected to MongoDB Atlas!');
      try {
        const { Student, Admin, Setting } = require('../models');
        const count = await Student.countDocuments();
        if (count === 0) {
          console.log('🌱 Seeding 65 students and Admin into MongoDB Atlas...');
          await Student.insertMany(mockStore.students);
          await Admin.insertMany(mockStore.admins);
          await Setting.create(mockStore.settings);
          console.log('✅ Successfully seeded all data to MongoDB Atlas!');
        } else {
          // If students exist, ensure our admin is there
          const adminCount = await Admin.countDocuments({ username: '24Q91A05BP' });
          if (adminCount === 0) {
             console.log('🌱 Adding Admin to MongoDB...');
             await Admin.create(mockStore.admins[0]);
          }
        }
      } catch (seedErr) {
        console.error('⚠️ MongoDB auto-seed check warning:', seedErr.message);
      }
      return { type: 'mongodb', client: mongoose };
    } catch (err) {
      console.error('⚠️ MongoDB connection failed:', err.message);
      process.exit(1); // Fail fast, we only want MongoDB
    }
  }
  
  console.log('⚠️ No MONGO_URI provided in .env, falling back to Mock DB');
  return { type: 'mock', store: mockStore };
};

const getDB = () => {
  if (mongoConn && mongoose.connection.readyState === 1) {
    return { type: 'mongodb', client: mongoose };
  }
  return { type: 'mock', store: mockStore };
};

module.exports = { connectDB, getDB, mockStore, saveMockStore };
