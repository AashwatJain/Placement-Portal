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

const db = admin.database();
const firestore = admin.firestore();

const RECRUITER_EMAIL = "cherry1201@gmail.com";
const TARGET_COMPANY = "Microsoft";

const MOCK_JAFS = [
  {
    name: TARGET_COMPANY,
    roles: "Software Engineer",
    offerType: "Full Time",
    location: "Hyderabad",
    status: "Active",
    description: "Join Microsoft to empower every person and every organization on the planet to achieve more. As a Software Engineer, you will work on state-of-the-art Azure cloud technologies.",
    skills: "C++, C#, Distributed Systems, Azure, Problem Solving",
    brochureUrl: "https://careers.microsoft.com",
    branches: "CS, IT, MNC",
    cgpaCutoff: "8.0",
    backlogs: "No Active Backlogs",
    basePay: "15",
    ctc: "45",
    hasBonus: true,
    applicantsCount: 0,
    shortlistedCount: 0,
    rounds: [
      { id: 1, name: "Shortlisting", expectedDate: "" },
      { id: 2, name: "Online Coding Assessment", expectedDate: "" },
      { id: 3, name: "Technical Interview I", expectedDate: "" },
      { id: 4, name: "Machine Coding Round", expectedDate: "" },
      { id: 5, name: "HR Interview", expectedDate: "" }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: TARGET_COMPANY,
    roles: "Data Scientist Intern",
    offerType: "Internship + PPO",
    location: "Bangalore",
    status: "Active",
    description: "Work with the Bing Search and AI team. You will leverage large scale machine learning models to improve search relevance.",
    skills: "Python, Machine Learning, Deep Learning, SQL",
    brochureUrl: "https://careers.microsoft.com",
    branches: "CS, IT, AIML, AIDS",
    cgpaCutoff: "8.5",
    backlogs: "No Active Backlogs",
    stipend: "125000",
    hasBonus: false,
    applicantsCount: 0,
    shortlistedCount: 0,
    rounds: [
      { id: 1, name: "Resume Screening", expectedDate: "" },
      { id: 2, name: "Machine Learning Assessment", expectedDate: "" },
      { id: 3, name: "Technical Interview", expectedDate: "" }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function seed() {
  console.log(`🔄 Looking up recruiter by email: ${RECRUITER_EMAIL}`);
  try {
    const userRecord = await admin.auth().getUserByEmail(RECRUITER_EMAIL);
    const uid = userRecord.uid;
    console.log(`✅ Found user UID: ${uid}`);

    // Update in RTDB
    const userRef = db.ref(`users/${uid}`);
    await userRef.update({
      companyName: TARGET_COMPANY,
      role: "recruiter"
    });
    console.log(`✅ Assigned recruiter ${uid} to company: ${TARGET_COMPANY}`);

    // Seed JAFs
    console.log(`🔄 Inserting ${MOCK_JAFS.length} Active JAFs into Firestore Opportunities...`);
    const batch = firestore.batch();
    
    for (const jaf of MOCK_JAFS) {
      const jafRef = firestore.collection("opportunities").doc();
      batch.set(jafRef, jaf);
    }
    
    await batch.commit();
    console.log(`✅ Successfully seeded Microsoft JAFs.`);
    
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ User with email ${RECRUITER_EMAIL} not found in Firebase Auth.`);
    } else {
      console.error("❌ Seeding failed:", error);
    }
    process.exit(1);
  }
}

seed();
