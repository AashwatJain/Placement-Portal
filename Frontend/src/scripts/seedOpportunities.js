// Temporary script to seed sample opportunities into Firestore.
// Run from the Frontend directory: node --experimental-modules src/scripts/seedOpportunities.js
// Or just import and call seedOpportunities() once from the browser console.

import { fsdb } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const SAMPLE_OPPORTUNITIES = [
  {
    name: "Google",
    roles: "SDE, SRE",
    offerType: "Placement",
    cgpaCutoff: "8.5",
    ctc: "32 LPA",
    location: "Bangalore, Hyderabad",
    lastDate: "2026-03-20",
    driveType: "On-campus",
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
    createdAt: new Date(),
  },
  {
    name: "Amazon",
    roles: "SDE, BIE",
    offerType: "Intern + PPO",
    cgpaCutoff: "7.0",
    ctc: "44 LPA",
    location: "Bangalore, Hyderabad, Chennai",
    lastDate: "2026-03-25",
    driveType: "On-campus",
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
    createdAt: new Date(),
  },
  {
    name: "Sprinklr",
    roles: "Product Engineer",
    offerType: "Internship",
    cgpaCutoff: "8.0",
    ctc: "2 Lakh/mo",
    location: "Gurgaon",
    lastDate: "2026-04-01",
    driveType: "On-campus",
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
    createdAt: new Date(),
  },
];

export async function seedOpportunities() {
  const col = collection(fsdb, "opportunities");
  for (const opp of SAMPLE_OPPORTUNITIES) {
    await addDoc(col, opp);
    console.log(`✅ Added: ${opp.name}`);
  }
  console.log("🎉 All sample opportunities seeded!");
}
