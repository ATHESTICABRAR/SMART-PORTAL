const mongoose = require('mongoose');

// The exact URI you provided earlier
const uri = "mongodb+srv://THIRD_CSE0F:123321@cluster0.cfurijt.mongodb.net/smart_attendance_portal?retryWrites=true&w=majority&appName=Cluster0";

const studentSchema = new mongoose.Schema({}, { strict: false });
const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

const attendanceSchema = new mongoose.Schema({}, { strict: false });
const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);

async function masterReset() {
  try {
    console.log("Connecting to your live MongoDB Atlas database...");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    
    // 1. Wipe ALL attendance records (yesterday, today, everything)
    const attResult = await Attendance.deleteMany({});
    console.log(`✅ Cleared ${attResult.deletedCount} attendance records!`);
    
    // 2. Wipe ALL FRS enrollments so everyone can register fresh
    const stuResult = await Student.updateMany({}, {
      $set: { frs_enrolled: false },
      $unset: { frs_descriptor: 1, frs_descriptor_type: 1, frs_enrolled_at: 1 }
    });
    console.log(`✅ Reset FRS for all students (Modified ${stuResult.modifiedCount} profiles)!`);
    
    console.log("MASTER RESET COMPLETE! Your system is 100% fresh and clean.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Reset Failed:", error);
    process.exit(1);
  }
}

masterReset();
