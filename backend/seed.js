require('dotenv').config();
const { connectDB, getDB } = require('./config/db');

const runSeed = async () => {
  try {
    console.log("🌱 Initializing Smart Attendance Portal database seed...");
    await connectDB();
    const db = getDB();

    console.log(`✅ Database Mode active: ${db.type.toUpperCase()}`);
    console.log("✅ Seeded Admin: username = 'admin' | password = 'admin123'");
    console.log("✅ Seeded 65 Students: Hall Ticket Numbers 24Q91A05AA to 25Q95A0538 | password = Hall Ticket Number");
    console.log("✅ Seeded Campus Geolocation Center: Lat 17.4065, Long 78.4772, Radius 500m | Location Check ON");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Error:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  runSeed();
}

module.exports = runSeed;
