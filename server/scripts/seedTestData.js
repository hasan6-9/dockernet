const mongoose = require("mongoose");
const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");
require("dotenv").config({ path: ".env.test" });

const seedTestData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🗄️  Connected to test database");

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});

    // ========================= SENIOR DOCTORS =========================
    const seniorDoctors = await User.create([
      {
        firstName: "Dr. Sarah",
        lastName: "Wilson",
        email: "senior1@test.com",
        phone: "555-0101",
        password: "TestPass123!",
        role: "senior",
        accountStatus: "active",
        medicalLicenseNumber: "MD-SENIOR-001",
        licenseState: "CA",
        primarySpecialty: "Cardiothoracic Surgery",
        subspecialties: ["Cardiac Surgery"],
        yearsOfExperience: 15,
        medicalSchool: { name: "Harvard Medical School", graduationYear: 2008 },
        location: {
          city: "San Francisco",
          state: "CA",
          country: "USA",
          timezone: "America/Los_Angeles",
        },
        languages: [
          { language: "English", proficiency: "native" },
          { language: "Spanish", proficiency: "fluent" },
        ],
        bio: "Board-certified cardiothoracic surgeon with 15 years of experience.",
        verificationStatus: {
          identity: "verified",
          medical_license: "verified",
          background_check: "verified",
          overall: "verified",
        },
        rating: { average: 4.8, count: 24 },
      },
      {
        firstName: "Dr. Michael",
        lastName: "Chen",
        email: "senior2@test.com",
        phone: "555-0102",
        password: "TestPass123!",
        role: "senior",
        accountStatus: "active",
        medicalLicenseNumber: "MD-SENIOR-002",
        licenseState: "NY",
        primarySpecialty: "Neurology",
        subspecialties: ["Stroke Medicine"],
        yearsOfExperience: 12,
        medicalSchool: {
          name: "Columbia University Medical School",
          graduationYear: 2011,
        },
        location: {
          city: "New York",
          state: "NY",
          country: "USA",
          timezone: "America/New_York",
        },
        languages: [
          { language: "English", proficiency: "native" },
          { language: "Mandarin", proficiency: "fluent" },
        ],
        bio: "Renowned neurologist specializing in stroke prevention.",
        verificationStatus: {
          identity: "verified",
          medical_license: "verified",
          background_check: "verified",
          overall: "verified",
        },
        rating: { average: 4.7, count: 18 },
      },
    ]);

    // ========================= JUNIOR DOCTORS =========================
    const juniorDoctors = await User.create([
      {
        firstName: "Dr. Emily",
        lastName: "Rodriguez",
        email: "junior1@test.com",
        phone: "555-0201",
        password: "TestPass123!",
        role: "junior",
        accountStatus: "active",
        medicalLicenseNumber: "MD-JUNIOR-001",
        licenseState: "CA",
        primarySpecialty: "Cardiology",
        subspecialties: ["Interventional Cardiology"],
        yearsOfExperience: 3,
        medicalSchool: {
          name: "Stanford School of Medicine",
          graduationYear: 2020,
        },
        location: {
          city: "Palo Alto",
          state: "CA",
          country: "USA",
          timezone: "America/Los_Angeles",
        },
        languages: [{ language: "English", proficiency: "native" }],
        bio: "Recently completed cardiology fellowship with interest in research.",
        verificationStatus: {
          identity: "verified",
          medical_license: "verified",
          background_check: "verified",
          overall: "verified",
        },
        rating: { average: 4.6, count: 5 },
        job_preferences: {
          seeking_opportunities: true,
          preferred_categories: ["consultation", "research"],
          preferred_budget_range: { min: 100, max: 300 },
          remote_work_preference: "remote_only",
        },
      },
      {
        firstName: "Dr. James",
        lastName: "Thompson",
        email: "junior2@test.com",
        phone: "555-0202",
        password: "TestPass123!",
        role: "junior",
        accountStatus: "active",
        medicalLicenseNumber: "MD-JUNIOR-002",
        licenseState: "TX",
        primarySpecialty: "Neurology",
        subspecialties: ["Stroke Medicine"],
        yearsOfExperience: 2,
        medicalSchool: {
          name: "UT Southwestern Medical Center",
          graduationYear: 2021,
        },
        location: {
          city: "Dallas",
          state: "TX",
          country: "USA",
          timezone: "America/Chicago",
        },
        languages: [{ language: "English", proficiency: "native" }],
        bio: "Neurology resident seeking remote opportunities.",
        verificationStatus: {
          identity: "verified",
          medical_license: "verified",
          background_check: "verified",
          overall: "verified",
        },
        rating: { average: 4.5, count: 3 },
        job_preferences: {
          seeking_opportunities: true,
          preferred_categories: ["consultation", "documentation"],
          remote_work_preference: "flexible",
        },
      },
      {
        firstName: "Dr. Lisa",
        lastName: "Anderson",
        email: "junior3@test.com",
        phone: "555-0203",
        password: "TestPass123!",
        role: "junior",
        accountStatus: "pending",
        medicalLicenseNumber: "MD-JUNIOR-003",
        licenseState: "FL",
        primarySpecialty: "Emergency Medicine",
        yearsOfExperience: 4,
        medicalSchool: { name: "University of Florida", graduationYear: 2019 },
      },
    ]);

    // ========================= JOBS =========================
    const jobs = await Job.create([
      {
        title: "Urgent: Cardiology Consultation",
        description:
          "Need experienced cardiologist for urgent consultation on complex case. Must review records and provide recommendations within 4 hours. Interventional experience preferred.",
        category: "consultation",
        specialty: "Cardiology",
        subSpecialties: ["Interventional Cardiology"],
        skills_required: ["Cardiac imaging", "Echocardiography"],
        experience_required: { minimum_years: 3, level: "mid-level" },
        budget: { type: "fixed", amount: 500, currency: "USD" },
        timeline: {
          estimated_hours: 4,
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        requirements: { location_preference: "remote", languages: ["English"] },
        posted_by: seniorDoctors[0]._id,
        status: "active",
        visibility: "public",
      },
      {
        title: "Research: Stroke Prevention Protocol Review",
        description:
          "Seeking neurologist for stroke prevention protocol review. Potential publication opportunity.",
        category: "research",
        specialty: "Neurology",
        subSpecialties: ["Stroke Medicine"],
        skills_required: ["Literature review", "Protocol development"],
        experience_required: { minimum_years: 2, level: "junior" },
        budget: { type: "hourly", amount: 150, currency: "USD" },
        timeline: {
          estimated_hours: 20,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        requirements: { location_preference: "remote" },
        posted_by: seniorDoctors[1]._id,
        status: "active",
        visibility: "verified_only",
      },
      {
        title: "Chart Review: 50 Complex Cases",
        description:
          "Documentation specialist needed for 50 complex cardiac case reviews.",
        category: "documentation",
        specialty: "Cardiology",
        skills_required: ["Medical documentation", "Data entry"],
        experience_required: { minimum_years: 1, level: "junior" },
        budget: { type: "fixed", amount: 2500, currency: "USD" },
        timeline: {
          estimated_hours: 40,
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
        posted_by: seniorDoctors[0]._id,
        status: "active",
      },
    ]);

    // ========================= APPLICATIONS =========================
    const applications = await Application.create([
      {
        job_id: jobs[0]._id,
        applicant_id: juniorDoctors[0]._id,
        status: "submitted",
        proposal: {
          cover_letter:
            "I am interested in this urgent consultation. With 3 years interventional experience, I can provide valuable insights.",
          approach:
            "Review records → Analyze cardiac imaging → Consult literature → Provide recommendations",
          timeline_days: 1,
          proposed_budget: 450,
          availability: { start_date: new Date(), hours_per_week: 10 },
        },
        match_score: 92,
        submitted_at: new Date(),
      },
      {
        job_id: jobs[1]._id,
        applicant_id: juniorDoctors[1]._id,
        status: "under_review",
        proposal: {
          cover_letter:
            "Neurology resident eager to contribute to stroke prevention research.",
          approach:
            "Conduct literature review → Analyze protocol → Provide feedback",
          timeline_days: 7,
          proposed_budget: 140,
          availability: {
            start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            hours_per_week: 15,
          },
        },
        match_score: 88,
        submitted_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ]);

    // Add communication
    applications[0].communication_log.push({
      type: "message",
      content: "Hello, very interested in this case. When should I start?",
      from: "applicant",
    });
    await applications[0].save();

    console.log("\n✅ Test data seeded successfully!\n");
    console.log("📊 Created:");
    console.log(`   • ${seniorDoctors.length} Senior Doctors`);
    console.log(`   • ${juniorDoctors.length} Junior Doctors`);
    console.log(`   • ${jobs.length} Jobs`);
    console.log(`   • ${applications.length} Applications`);
    console.log("\n🔐 Test Credentials:");
    console.log("\n   SENIOR 1: senior1@test.com / TestPass123!");
    console.log("   SENIOR 2: senior2@test.com / TestPass123!");
    console.log("   JUNIOR 1: junior1@test.com / TestPass123!");
    console.log("   JUNIOR 2: junior2@test.com / TestPass123!");
    console.log("   JUNIOR 3 (Unverified): junior3@test.com / TestPass123!");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedTestData();
