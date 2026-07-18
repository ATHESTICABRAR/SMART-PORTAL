const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let supabase = null;
let pgPool = null;
let mongoConn = null;
let useMock = process.env.USE_MOCK_DB === 'true' || (!process.env.MONGO_URI && (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('your-supabase-id')));

// In-Memory Database store for instant local development & fallback
const mockStore = {
  admins: [
    {
      id: 'admin-001',
      username: 'admin',
      password: bcrypt.hashSync('admin123', 8),
      name: 'Principal & Admin',
      created_at: new Date().toISOString()
    }
  ],
  students: [],
  attendance: [],
  settings: {
    id: 1,
    campus_latitude: 17.406500,
    campus_longitude: 78.477200,
    radius_meters: 500,
    location_check_enabled: true,
    session_1_start: '09:00',
    session_1_end: '13:00',
    session_1_deadline: '09:30',
    session_2_start: '14:00',
    session_2_end: '17:00',
    session_2_deadline: '14:30',
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

const connectDB = async () => {
  if (!useMock && process.env.MONGO_URI && process.env.MONGO_URI.trim() !== '') {
    try {
      try {
        const dns = require('dns');
        dns.setServers(['8.8.8.8', '1.1.1.1']);
      } catch (dnsErr) {
        // Ignore if dns override not allowed
      }
      mongoConn = await mongoose.connect(process.env.MONGO_URI);
      console.log('🌟 Connected to MongoDB Atlas / Cloud Database!');
      try {
        const { Student, Admin, Setting } = require('../models');
        const count = await Student.countDocuments();
        if (count === 0) {
          console.log('🌱 Seeding 65 III Year CSE — Section F students into MongoDB Atlas...');
          await Student.insertMany(mockStore.students);
          await Admin.insertMany(mockStore.admins);
          await Setting.create(mockStore.settings);
          console.log('✅ Successfully seeded all 65 students to MongoDB Atlas!');
        }
      } catch (seedErr) {
        console.error('⚠️ MongoDB auto-seed check warning:', seedErr.message);
      }
      return { type: 'mongodb', client: mongoose };
    } catch (err) {
      console.error('⚠️ MongoDB connection failed, falling back to local database store:', err.message);
      useMock = true;
    }
  } else if (!useMock && process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && !process.env.SUPABASE_URL.includes('your-supabase-id')) {
    try {
      supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
      console.log('🌟 Connected to Supabase Cloud PostgreSQL!');
      return { type: 'supabase', client: supabase };
    } catch (err) {
      console.error('⚠️ Supabase connection failed, falling back to local database store:', err.message);
      useMock = true;
    }
  } else if (!useMock && process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('your-supabase-id')) {
    try {
      pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
      await pgPool.query('SELECT 1');
      console.log('🌟 Connected to PostgreSQL Pool via DATABASE_URL!');
      return { type: 'postgres', pool: pgPool };
    } catch (err) {
      console.error('⚠️ Postgres connection failed, falling back to local database store:', err.message);
      useMock = true;
    }
  }
  
  console.log('⚡ Smart Attendance Portal running with local Database Engine (Pre-seeded with all 65 students where password = Hall Ticket Number)');
  return { type: 'mock', store: mockStore };
};

const getDB = () => {
  if (mongoConn) return { type: 'mongodb', client: mongoose };
  if (supabase) return { type: 'supabase', client: supabase };
  if (pgPool) return { type: 'postgres', pool: pgPool };
  return { type: 'mock', store: mockStore };
};

module.exports = { connectDB, getDB, mockStore };
