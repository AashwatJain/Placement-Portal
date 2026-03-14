/**
 * generateDummyData.js
 *
 * Generates 600 dense, realistic profiles and REPLACES the entire
 * `pastPlacements` node in Firebase Realtime Database using .set().
 *
 * ─────────────────────────────────────────────────────────────────────
 * Rules
 * ─────────────────────────────────────────────────────────────────────
 *
 * - Gender: Male/Female. Females get 10-15% lower score thresholds.
 * - Top MNCs (Google, Microsoft, Amazon, Adobe, Uber, Directi):
 *     DSA-heavy. Male: DSA 85-100, Dev 50-80. Female: DSA 75-100, Dev 45-80.
 * - Startups (Swiggy, Zomato, PhonePe, Oyo Rooms, Flipkart, Paytm):
 *     Dev-heavy. DevScore 85-100, DSA can be average 60-80.
 * - Finance (JP Morgan Chase & Co., Goldman Sachs, Morgan Stanley,
 *            DE Shaw, Arcesium, Bajaj Finserv):
 *     Balanced. DSA 70-90, Dev 60-80.
 * - Mass Recruiters (TCS, Infosys, Wipro):
 *     Low bar. DSA 40-55, Dev 40-55. Baseline never 0%.
 *
 * Dense distribution: many overlapping profiles per tier so KNN always
 * finds close neighbors → 70%+ probabilities for reasonable matches.
 *
 * Run (from Backend/):
 *   node src/scripts/generateDummyData.js
 */

import admin from "firebase-admin";
import { createRequire } from "module";

// ── Firebase Admin init ──────────────────────────────────────────────────────

const require = createRequire(import.meta.url);
const serviceAccount = require("../config/serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://placement-portal-c0bdf-default-rtdb.firebaseio.com",
  });
}

const db = admin.database();
const pastPlacementsRef = db.ref("pastPlacements");

// ── Helpers ──────────────────────────────────────────────────────────────────

const rand = (min, max) =>
  Math.round((Math.random() * (max - min) + min) * 100) / 100;

const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Tier Definitions ─────────────────────────────────────────────────────────
//
// Each tier has Male and Female score ranges.
// Female thresholds are 10-15% lower for DSA/CP to reflect diversity hiring.

const tiers = [

  // ── Tier 1: Top MNCs — DSA-heavy ──────────────────────────────────────────
  {
    name: "Top MNCs",
    count: 140,
    companies: ["Google", "Microsoft", "Amazon", "Adobe", "Uber", "Directi"],
    male:   { dsa: [85, 100], dev: [50, 80], cp: [55, 85] },
    female: { dsa: [75, 100], dev: [45, 80], cp: [45, 80] },
  },
  // Extra dense Tier 1 at slightly lower scores (so good profiles match)
  {
    name: "Top MNCs — Near Miss",
    count: 50,
    companies: ["Google", "Microsoft", "Amazon", "Adobe", "Uber", "Directi"],
    male:   { dsa: [75, 90], dev: [45, 70], cp: [45, 70] },
    female: { dsa: [65, 85], dev: [40, 65], cp: [35, 65] },
  },

  // ── Tier 2: Startups/Unicorns — DEV-heavy ─────────────────────────────────
  {
    name: "Startups/Unicorns",
    count: 120,
    companies: ["Swiggy", "Zomato", "PhonePe", "Oyo Rooms", "Flipkart", "Paytm"],
    male:   { dsa: [60, 80], dev: [85, 100], cp: [30, 60] },
    female: { dsa: [50, 75], dev: [80, 100], cp: [25, 55] },
  },
  // Extra dense startup profiles at moderate dev
  {
    name: "Startups — Balanced Dev",
    count: 40,
    companies: ["Swiggy", "Zomato", "PhonePe", "Oyo Rooms", "Flipkart", "Paytm"],
    male:   { dsa: [55, 75], dev: [75, 95], cp: [25, 50] },
    female: { dsa: [45, 70], dev: [70, 92], cp: [20, 45] },
  },

  // ── Tier 3: Finance — Balanced ─────────────────────────────────────────────
  {
    name: "Finance",
    count: 100,
    companies: ["JP Morgan Chase & Co.", "Goldman Sachs", "Morgan Stanley", "DE Shaw", "Arcesium", "Bajaj Finserv"],
    male:   { dsa: [70, 90], dev: [60, 80], cp: [50, 75] },
    female: { dsa: [60, 85], dev: [55, 78], cp: [40, 70] },
  },
  // Extra dense finance at slightly lower scores
  {
    name: "Finance — Accessible",
    count: 40,
    companies: ["JP Morgan Chase & Co.", "Goldman Sachs", "Morgan Stanley", "Bajaj Finserv"],
    male:   { dsa: [62, 82], dev: [55, 75], cp: [40, 65] },
    female: { dsa: [52, 78], dev: [50, 72], cp: [30, 60] },
  },

  // ── Tier 4: Mass Recruiters / Safe Nets — Low bar ──────────────────────────
  {
    name: "Mass Recruiters",
    count: 80,
    companies: ["TCS", "Infosys", "Wipro"],
    male:   { dsa: [35, 55], dev: [35, 55], cp: [15, 40] },
    female: { dsa: [30, 50], dev: [30, 50], cp: [10, 35] },
  },
  // Extra dense: slightly better profiles also placed at mass recruiters
  // This ensures even moderate students see 85%+ for TCS/Infosys
  {
    name: "Mass Recruiters — Better Profiles",
    count: 30,
    companies: ["TCS", "Infosys", "Wipro"],
    male:   { dsa: [50, 65], dev: [50, 65], cp: [25, 50] },
    female: { dsa: [45, 60], dev: [45, 60], cp: [20, 45] },
  },
];

// ── Profile builder ──────────────────────────────────────────────────────────

const buildProfile = (tier, index) => {
  const gender = Math.random() < 0.45 ? "Female" : "Male";
  const ranges = gender === "Female" ? tier.female : tier.male;

  const dsaScore = rand(ranges.dsa[0], ranges.dsa[1]);
  const devScore = rand(ranges.dev[0], ranges.dev[1]);
  const cpScore  = rand(ranges.cp[0],  ranges.cp[1]);
  const placedCompany = pick(tier.companies);

  return {
    dsaScore,
    devScore,
    cpScore,
    gender,
    placedCompany,
  };
};

// ── Main seeder ──────────────────────────────────────────────────────────────

async function generateDummyData() {
  console.log("🗑️  Replacing entire pastPlacements node...\n");

  const allProfiles = {};
  let totalCount = 0;

  for (const tier of tiers) {
    console.log(`📦 [${tier.name}] → ${tier.count} records (${tier.companies.join(", ")})`);

    for (let i = 0; i < tier.count; i++) {
      const profile = buildProfile(tier, i);
      const key = `entry_${totalCount}`;
      allProfiles[key] = profile;
      totalCount++;
    }

    console.log(`   ✅ Generated — running total: ${totalCount}\n`);
  }

  // ── Overwrite entire node with .set() ──────────────────────────────────
  console.log(`⏳ Writing ${totalCount} records to Firebase RTDB...`);
  await pastPlacementsRef.set(allProfiles);
  console.log("   ✅ pastPlacements node overwritten!\n");

  console.log("🎉 Success! Data summary:");
  console.log("───────────────────────────────────────────────────────");
  tiers.forEach(t => {
    console.log(`   ${t.name.padEnd(35)} ${String(t.count).padStart(3)} records`);
  });
  console.log("───────────────────────────────────────────────────────");
  console.log(`   TOTAL: ${totalCount} records`);

  process.exit(0);
}

generateDummyData().catch((error) => {
  console.error("❌ Fatal error during seeding:", error);
  process.exit(1);
});
