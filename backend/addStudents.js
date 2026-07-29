const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Student, Admin } = require('./models');
const crypto = require('crypto');
require('dotenv').config();

const studentsList = [
  "24Q91A05AA Bollam Yashwanth",
  "24Q91A05AB C Harthik",
  "24Q91A05AC Ch Praveen Raju",
  "24Q91A05AD Challa Rishitha",
  "24Q91A05AE Chinnolla Pravallika",
  "24Q91A05AF Dage Mallika",
  "24Q91A05AG Daravath Sravani",
  "24Q91A05AH Dasari Kiran",
  "24Q91A05AJ Deeravath Jagadish Nayak",
  "24Q91A05AK Dheeravath Tinku",
  "24Q91A05AL G Keerthi",
  "24Q91A05AM Gorribanda Anitha",
  "24Q91A05AP Gudam Akshaya",
  "24Q91A05AR Jummula Abishai",
  "24Q91A05AT Jeela Alekhya",
  "24Q91A05AU K Sai Chandra",
  "24Q91A05AV Kalyankar Saiteja",
  "24Q91A05AW Kanikatla Nishad",
  "24Q91A05AX Karipe Praneeth",
  "24Q91A05AY Katigher Vaagdevi",
  "24Q91A05AZ Kola Aparna",
  "24Q91A05BA Konda Lakshmi",
  "24Q91A05BB Kota Nandini",
  "24Q91A05BC Kota Shashanth",
  "24Q91A05BD Kotagiri Rakesh",
  "24Q91A05BE Kukkarikalla Kalyani",
  "24Q91A05BF Lalagari Harika",
  "24Q91A05BG Madunagula Jyoshna",
  "24Q91A05BJ Mandru Susun",
  "24Q91A05BK Maryada Keerthi",
  "24Q91A05BL Medi Deepthi Sree",
  "24Q91A05BM Mekala Hayanth",
  "24Q91A05BN Miriyala V S D S Mukunda Sharma",
  "24Q91A05BP Mohammad Abrar",
  "24Q91A05BQ Mohammad Saif Parvez",
  "24Q91A05BT Nomula Bhaskar",
  "24Q91A05BU Nuthanapati Navadeep",
  "24Q91A05BV P Vinay Tagore Goud",
  "24Q91A05BW Paladugu Signari",
  "24Q91A05BX Peddinti Prashanth Kumar",
  "24Q91A05BY Rampalli Manoj Kumar",
  "24Q91A05BZ Rayala Karthikeya",
  "24Q91A05CA Shaik Behad Sayanaa",
  "24Q91A05CB Shaik Nishat",
  "24Q91A05CC Singarapu Prem",
  "24Q91A05CD Sunkara Mohan Anji Reddy",
  "24Q91A05CE Talari Raj Kumar",
  "24Q91A05CF Tejavath Arun",
  "24Q91A05CG Thumkunta Sai Pavan Goud",
  "24Q91A05CH V Charitha",
  "24Q91A05CJ Vankudoth Sathish",
  "24Q91A05CK Yabnod Shivprasad",
  "24Q91A05CL Yedla Gnanavyshnavi",
  "24Q91A05Z4 Anumala Sidvitha",
  "24Q91A05Z5 Askani Sinduja",
  "24Q91A05Z6 Avadhanam Parthiv Kumar",
  "24Q91A05Z7 Avula Karthikeya",
  "24Q91A05Z9 Banoth Sandeep",
  "25Q95A0532 Jagarla Anshith",
  "25Q95A0533 Manda Meghana",
  "25Q95A0534 Nakka Surya Narayana",
  "25Q95A0535 Putukam Maruthi",
  "25Q95A0536 Ramavath Yashwanth",
  "25Q95A0537 Sirigiri Lavanya",
  "25Q95A0538 Rebba Manaswini"
];

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create students
    for (let entry of studentsList) {
      const parts = entry.split(' ');
      const rollNumber = parts[0];
      const name = parts.slice(1).join(' ');

      // Check if student exists
      let student = await Student.findOne({ hall_ticket_number: rollNumber });
      if (!student) {
        // Hash default password 'password123'
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        await Student.create({
          id: crypto.randomUUID(),
          hall_ticket_number: rollNumber,
          password: hashedPassword,
          name: name,
          department: 'CSE',
          section: 'F',
          year: '3rd Year',
          mobile_number: '9876543210',
          frs_enrolled: false
        });
        console.log(`Added student: ${name} (${rollNumber})`);
      } else {
        console.log(`Student ${rollNumber} already exists.`);
      }
    }

    // Add admin 24Q91A05BP
    const adminRoll = "24Q91A05BP";
    let admin = await Admin.findOne({ username: adminRoll });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await Admin.create({
        id: crypto.randomUUID(),
        username: adminRoll,
        password: hashedPassword,
        name: "Mohammad Abrar"
      });
      console.log(`Added admin: ${adminRoll}`);
    } else {
      console.log(`Admin ${adminRoll} already exists.`);
    }

    console.log('Finished seeding data successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
