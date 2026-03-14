import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const serviceAccount = require("../config/serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://placement-portal-c0bdf-default-rtdb.firebaseio.com",
    storageBucket: "placement-portal-c0bdf.appspot.com",
  });
}

export const seedRecruiterData = async () => {
  console.log("Starting to seed Recruiter Data...");
  const firestore = admin.firestore();

  // 1. Seed Active Drives
  const activeDrivesRef = firestore.collection("active_drives");
  const drive1 = {
    companyName: "Microsoft",
    roundName: "Online Coding Assessment",
    startTime: admin.firestore.FieldValue.serverTimestamp(),
    durationMinutes: 120,
    status: "active",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  
  const driveDoc = await activeDrivesRef.add(drive1);
  console.log(`Seeded Active Drive: ${driveDoc.id}`);

  // 1b. Seed Realtime Database logic for the drive (Mock)
  const db = admin.database();
  const attendanceRef = db.ref(`drive_attendance/${driveDoc.id}`);
  await attendanceRef.set({
      totalEligible: 120,
      loggedIn: 105,
      pending: 15,
      students: {
          "user1": { name: "Aarav Sharma", rollNo: "220101", branch: "Computer Science", status: "submitted" },
          "user2": { name: "Priya Patel", rollNo: "220102", branch: "Information Technology", status: "active" },
          "user3": { name: "Rohan Gupta", rollNo: "220103", branch: "Computer Science", status: "not_started" },
          "user4": { name: "Sneha Reddy", rollNo: "220104", branch: "Electronics", status: "active" },
          "user5": { name: "Ananya Desai", rollNo: "220106", branch: "Information Technology", status: "alert" }
      }
  });
  console.log(`Seeded Realtime DB Drive Attendance for ${driveDoc.id}`);


  // 2. Seed TnP Connect Tickets
  const ticketsRef = firestore.collection("support_tickets");
  
  const ticket1 = {
      title: "Room Allocation for HR Round",
      recruiterId: "mock_recruiter_1",
      status: "resolved",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  const t1Doc = await ticketsRef.add(ticket1);
  console.log(`Seeded Ticket: ${t1Doc.id}`);

  // Messages for Ticket 1
  const t1MessagesRef = t1Doc.collection("messages");
  await t1MessagesRef.add({
      senderRole: "recruiter", senderName: "Microsoft Recruiter", senderId: "mock_recruiter_1",
      text: "Hi team, we need 3 rooms for the HR interviews starting at 2 PM. Is the allocation done?",
      timestamp: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 3600000)) // 1 hr ago
  });
  await t1MessagesRef.add({
      senderRole: "tnp", senderName: "Rahul (TnP Coord)", senderId: "admin_1",
      text: "Hello! Yes, the rooms are allocated. You will be using LH-1, LH-2, and LH-3.",
      timestamp: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 3000000))
  });

  const ticket2 = {
      title: "Update CGPA cutoff to 7.5",
      recruiterId: "mock_recruiter_1",
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  const t2Doc = await ticketsRef.add(ticket2);
  console.log(`Seeded Ticket: ${t2Doc.id}`);
  
  const t2MessagesRef = t2Doc.collection("messages");
  await t2MessagesRef.add({
      senderRole: "recruiter", senderName: "Microsoft Recruiter", senderId: "mock_recruiter_1",
      text: "Can we modify the initial filtering to 7.5 CGPA instead of 7.0 for the remaining profiles?",
      timestamp: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 1800000)) // 30 mins ago
  });
  await t2MessagesRef.add({
      senderRole: "tnp", senderName: "Sneha (TnP)", senderId: "admin_2",
      text: "Noted. We are checking with the placement head as this impacts the already published JAF.",
      timestamp: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 900000)) // 15 mins ago
  });

  // 3. Seed Emergency Contacts
  const contactsRef = firestore.collection("emergency_contacts");
  const existingContacts = await contactsRef.get();
  if (existingContacts.empty) {
      await contactsRef.add({ name: "Rahul Sharma", role: "Primary POC", phone: "+91 9876543210", email: "rahul.tnp@nitkkr.ac.in", avatar: "rs" });
      await contactsRef.add({ name: "Sneha Verma", role: "Logistics Coord", phone: "+91 9988776655", email: "sneha.tnp@nitkkr.ac.in", avatar: "sv" });
      await contactsRef.add({ name: "Prof. AK Gupta", role: "Faculty In-Charge", phone: "+91 9123456789", email: "akgupta@nitkkr.ac.in", avatar: "ag" });
      console.log("Seeded Emergency Contacts");
  } else {
      console.log("Emergency Contacts already exist, skipping.");
  }

  // 4. Seed Broadcasts
  const broadcastsRef = firestore.collection("broadcasts");
  const existingBroadcasts = await broadcastsRef.get();
  if (existingBroadcasts.empty) {
      await broadcastsRef.add({
          title: "Microsoft Drive Rescheduled to 3 PM",
          body: "Due to technical issues, the Microsoft Online Coding Assessment has been rescheduled from 2 PM to 3 PM. All eligible students are requested to be available at the new time. Venue remains LH-1.",
          urgency: "important",
          recruiterName: "Microsoft Recruiting Team",
          recruiterId: "mock_recruiter_1",
          createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 7200000))
      });
      await broadcastsRef.add({
          title: "Dress Code Reminder for HR Interviews",
          body: "Reminder: Formal attire is mandatory for all HR interviews scheduled for tomorrow. Please carry your original ID proof and 2 passport-size photographs.",
          urgency: "normal",
          recruiterName: "Microsoft Recruiting Team",
          recruiterId: "mock_recruiter_1",
          createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 86400000))
      });
      await broadcastsRef.add({
          title: "URGENT: Results Declared for OA Round",
          body: "Results for the Microsoft Online Coding Assessment have been published. Shortlisted candidates will be notified via email within the next 2 hours. Check your inbox.",
          urgency: "urgent",
          recruiterName: "Microsoft Recruiting Team",
          recruiterId: "mock_recruiter_1",
          createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 3600000))
      });
      console.log("Seeded Broadcasts");
  } else {
      console.log("Broadcasts already exist, skipping.");
  }

  console.log("Recruiter Data Seeding Complete!");
};

// If running directly
seedRecruiterData().catch(console.error);

