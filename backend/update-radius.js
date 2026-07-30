const mongoose = require('mongoose');

const uri = "mongodb+srv://THIRD_CSE0F:123321@cluster0.cfurijt.mongodb.net/smart_attendance_portal?retryWrites=true&w=majority&appName=Cluster0";

const settingsSchema = new mongoose.Schema({}, { strict: false });
const Setting = mongoose.models.Setting || mongoose.model('Setting', settingsSchema);

async function updateRadius() {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB Atlas!");
    
    await Setting.findOneAndUpdate(
      { id: 1 },
      { $set: { radius_meters: 3000 } },
      { upsert: true }
    );
    
    console.log("SUCCESS: Campus Radius updated to 3000 meters in MongoDB!");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

updateRadius();
