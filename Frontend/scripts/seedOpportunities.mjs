// Re-seed Firestore with correct placement process dates.
// Process: Resume Shortlist → Result → OA → OA Result → Interview → Interview Result → Final
// Run: node scripts/seedOpportunities.mjs

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyChbO29T7A2qe1dlgibIYdhJbvEj7WIG8k",
  authDomain: "placement-portal-c0bdf.firebaseapp.com",
  projectId: "placement-portal-c0bdf",
  storageBucket: "placement-portal-c0bdf.firebasestorage.app",
  messagingSenderId: "439810593718",
  appId: "1:439810593718:web:d3b1c000d21246dfc42717",
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

const OPPORTUNITIES = [
  {
    name: "Google",
    roles: "SDE, SRE",
    offerType: "Placement",
    cgpaCutoff: "8.5",
    ctc: "32 LPA",
    location: "Bangalore, Hyderabad",
    lastDate: "2026-03-20",
    driveType: "On-campus",
    branches: "CSE, IT, ECE",
    backlogs: "No active backlogs",
    description: "Google is hiring for full-time SDE and SRE roles. The process includes resume shortlisting, online assessment, and multiple interview rounds.",
    // Process dates
    shortlistDate: "2026-03-21",
    resumeResultDate: "2026-03-23",
    oaDate: "2026-03-25",
    oaResultDate: "2026-03-27",
    interviewDate: "2026-03-30",
    interviewResultDate: "2026-04-02",
    finalResultDate: "2026-04-05",
    createdAt: new Date(),
  },
  {
    name: "Microsoft",
    roles: "SDE, Data Science",
    offerType: "Placement",
    cgpaCutoff: "7.5",
    ctc: "45 LPA",
    location: "Noida, Bangalore",
    lastDate: "2026-03-18",
    driveType: "On-campus",
    branches: "All branches",
    backlogs: "No active backlogs",
    description: "Microsoft is looking for talented engineers. Process: Resume screening, coding round, 3 technical interviews + 1 HR round.",
    shortlistDate: "2026-03-19",
    resumeResultDate: "2026-03-21",
    oaDate: "2026-03-23",
    oaResultDate: "2026-03-25",
    interviewDate: "2026-03-28",
    interviewResultDate: "2026-03-31",
    finalResultDate: "2026-04-02",
    createdAt: new Date(),
  },
  {
    name: "Amazon",
    roles: "SDE, BIE",
    offerType: "Intern + PPO",
    cgpaCutoff: "7.0",
    ctc: "44 LPA",
    stipend: "1.2 Lakh/mo",
    location: "Bangalore, Hyderabad, Chennai",
    lastDate: "2026-03-25",
    driveType: "On-campus",
    branches: "CSE, IT, ECE, EE",
    backlogs: "Max 1 backlog allowed",
    description: "Amazon Intern + PPO drive. 2-month internship with full-time conversion. Process: OA (DSA + debugging) → 2 interview rounds.",
    shortlistDate: "2026-03-26",
    resumeResultDate: "2026-03-28",
    oaDate: "2026-03-30",
    oaResultDate: "2026-04-01",
    interviewDate: "2026-04-04",
    interviewResultDate: "2026-04-07",
    finalResultDate: "2026-04-10",
    createdAt: new Date(),
  },
  {
    name: "Atlassian",
    roles: "SDE, Product Engineer",
    offerType: "Placement",
    cgpaCutoff: "8.0",
    ctc: "54 LPA",
    location: "Bangalore",
    lastDate: "2026-03-22",
    driveType: "On-campus",
    branches: "CSE, IT",
    backlogs: "No backlogs",
    bond: "No bond",
    description: "Atlassian hiring for SDE & Product Engineer. Known for great culture and work-life balance. Process: Resume → OA → 3 interview rounds.",
    shortlistDate: "2026-03-23",
    resumeResultDate: "2026-03-25",
    oaDate: "2026-03-27",
    oaResultDate: "2026-03-29",
    interviewDate: "2026-04-01",
    interviewResultDate: "2026-04-04",
    finalResultDate: "2026-04-07",
    createdAt: new Date(),
  },
  {
    name: "Sprinklr",
    roles: "Product Engineer",
    offerType: "Internship",
    cgpaCutoff: "8.0",
    ctc: "2 Lakh/mo",
    stipend: "80K/mo",
    location: "Gurgaon",
    lastDate: "2026-04-01",
    driveType: "On-campus",
    branches: "CSE, IT, ECE",
    description: "Sprinklr summer internship. Great learning opportunity in an enterprise SaaS platform.",
    shortlistDate: "2026-04-02",
    resumeResultDate: "2026-04-04",
    oaDate: "2026-04-06",
    oaResultDate: "2026-04-08",
    interviewDate: "2026-04-11",
    interviewResultDate: "2026-04-14",
    finalResultDate: "2026-04-16",
    createdAt: new Date(),
  },
  {
    name: "Uber",
    roles: "SDE I",
    offerType: "Placement",
    cgpaCutoff: "8.0",
    ctc: "38 LPA",
    location: "Bangalore, Hyderabad",
    lastDate: "2026-04-05",
    driveType: "On-campus",
    branches: "CSE, IT",
    backlogs: "No backlogs",
    description: "Uber is hiring SDE I for their ride-hailing platform. Strong focus on system design and problem-solving.",
    shortlistDate: "2026-04-06",
    resumeResultDate: "2026-04-08",
    oaDate: "2026-04-10",
    oaResultDate: "2026-04-12",
    interviewDate: "2026-04-15",
    interviewResultDate: "2026-04-18",
    finalResultDate: "2026-04-20",
    createdAt: new Date(),
  },
  {
    name: "DE Shaw",
    roles: "QAE, SDE",
    offerType: "Placement",
    cgpaCutoff: "8.5",
    ctc: "42 LPA",
    location: "Hyderabad",
    lastDate: "2026-03-28",
    driveType: "On-campus",
    branches: "CSE, IT, ECE, Maths",
    backlogs: "No backlogs",
    bond: "2 year bond",
    description: "DE Shaw is a global technology and investment firm. Roles include quantitative analysis and engineering.",
    shortlistDate: "2026-03-29",
    resumeResultDate: "2026-03-31",
    oaDate: "2026-04-02",
    oaResultDate: "2026-04-04",
    interviewDate: "2026-04-07",
    interviewResultDate: "2026-04-10",
    finalResultDate: "2026-04-12",
    createdAt: new Date(),
  },
  {
    name: "Goldman Sachs",
    roles: "Analyst, SDE",
    offerType: "Internship",
    cgpaCutoff: "7.5",
    ctc: "28 LPA",
    stipend: "1 Lakh/mo",
    location: "Bangalore",
    lastDate: "2026-04-10",
    driveType: "On-campus",
    branches: "All branches",
    description: "Goldman Sachs summer analyst internship program. Strong preference for problem-solving and analytical skills.",
    shortlistDate: "2026-04-11",
    resumeResultDate: "2026-04-13",
    oaDate: "2026-04-15",
    oaResultDate: "2026-04-17",
    interviewDate: "2026-04-20",
    interviewResultDate: "2026-04-23",
    finalResultDate: "2026-04-25",
    createdAt: new Date(),
  },
];

async function seed() {
  const col = collection(db, "opportunities");

  // Delete existing
  const existing = await getDocs(col);
  console.log(`🗑️  Deleting ${existing.size} existing opportunities...`);
  for (const d of existing.docs) await deleteDoc(doc(db, "opportunities", d.id));

  // Add new
  for (const opp of OPPORTUNITIES) {
    const docRef = await addDoc(col, opp);
    console.log(`✅ ${opp.name} | Last: ${opp.lastDate} | OA: ${opp.oaDate} | Interview: ${opp.interviewDate} | Result: ${opp.finalResultDate}`);
  }
  console.log("\n🎉 8 opportunities seeded with full process timeline!");
  process.exit(0);
}

seed().catch((err) => { console.error("❌", err); process.exit(1); });
