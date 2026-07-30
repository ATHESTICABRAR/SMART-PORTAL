const mongoose = require('mongoose');

const uri = "mongodb+srv://THIRD_CSE0F:123321@cluster0.cfurijt.mongodb.net/smart_attendance_portal?retryWrites=true&w=majority&appName=Cluster0";

const attendanceSchema = new mongoose.Schema({
  student_id: String,
  date: String,
  session_1_status: String,
  session_2_status: String,
  day_status: String
});
const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);

async function clearAttendance() {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB Atlas!");
    
    // We can wipe all attendance records to give a clean slate for the presentation
    const result = await Attendance.deleteMany({});
    console.log(`Deleted ${result.deletedCount} attendance records! Clean slate ready.`);
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

clearAttendance();
