const mongoose = require('mongoose');

const uri = "mongodb+srv://THIRD_CSE0F:123321@cluster0.cfurijt.mongodb.net/smart_attendance_portal?retryWrites=true&w=majority&appName=Cluster0";

const settingsSchema = new mongoose.Schema({}, { strict: false });
const Setting = mongoose.models.Setting || mongoose.model('Setting', settingsSchema);

async function checkSettings() {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB Atlas!");
    
    const settings = await Setting.findOne({ id: 1 }).lean();
    console.log("CURRENT SETTINGS:", settings);
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkSettings();
