/**
 * generateDummyData.js
 *
 * Generates 500 realistic past student profiles and pushes them to
 * the Firebase Realtime Database `pastPlacements` node.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Clusters (realistic industry patterns)
 * ─────────────────────────────────────────────────────────────────────────
 *
 * 1. Big Tech / FAANG (Google, Microsoft, Amazon, Meta)
 *    → Very High DSA + Medium-High CP + Low Dev
 *
 * 2. Quant / Trading Firms (Jane Street, Tower Research, DE Shaw, Graviton)
 *    → Medium DSA + VERY HIGH CP + Almost No Dev
 *
 * 3. Product Startups (Razorpay, Swiggy, Cred, PhonePe, Zomato)
 *    → High DSA + Medium CP + Medium Dev
 *
 * 4. Service / Mass Recruiters (TCS, Infosys, Wipro, Cognizant, Accenture)
 *    → Low-Medium DSA + Low CP + Low Dev
 *
 * 5. Fintech / Banks (Goldman Sachs, Morgan Stanley, JP Morgan)
 *    → High DSA + Medium-High CP + Low Dev
 *
 * 6. Dev-Oriented Startups (Vercel, Postman, Hashnode)
 *    → Low DSA + Low CP + High Dev  (smallest cluster — rare)
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

const randomFloat = (min, max) =>
  Math.round((Math.random() * (max - min) + min) * 100) / 100;

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Cluster definitions ──────────────────────────────────────────────────────
//
// dsaScore  ←  LeetCode problems solved (normalized /500 × 100)
// cpScore   ←  Codeforces rating (normalized /2400 × 100)
// devScore  ←  GitHub public repos (normalized /50 × 100)
//
// Ranges below are for the NORMALIZED SCORES (0–100).

const clusterDefinitions = [
  // ── 1. Big Tech / FAANG ────────────────────────────────────────────────────
  // These companies gate on DSA rounds (LC mediums/hards). CP helps but isn't
  // required. Dev/projects barely matter in screening.
  {
    clusterName:           "Big Tech / FAANG",
    count:                 120,
    dsaScoreRange:         { min: 60, max: 100 },   // very high
    cpScoreRange:          { min: 35, max: 75  },   // medium-high
    devScoreRange:         { min: 5,  max: 30  },   // low
    placedCompanies:       ["Google", "Microsoft", "Amazon", "Meta"],
    leetCodeSolvedRange:   { min: 300, max: 500 },
    codeforcesRatingRange: { min: 840, max: 1800 },
    githubReposRange:      { min: 2,  max: 15  },
    cgpaRange:             { min: 7.5, max: 9.8 },
  },

  // ── 2. Quant / Trading Firms ───────────────────────────────────────────────
  // CP is KING here. They need 1800+ CF rated coders. LC matters less.
  // Dev/projects almost irrelevant for these roles.
  {
    clusterName:           "Quant / Trading Firms",
    count:                 70,
    dsaScoreRange:         { min: 30, max: 65  },   // moderate
    cpScoreRange:          { min: 75, max: 100 },   // VERY high
    devScoreRange:         { min: 2,  max: 15  },   // almost none
    placedCompanies:       ["Jane Street", "Tower Research", "DE Shaw", "Graviton"],
    leetCodeSolvedRange:   { min: 150, max: 325 },
    codeforcesRatingRange: { min: 1800, max: 2400 },
    githubReposRange:      { min: 1,  max: 8   },
    cgpaRange:             { min: 8.0, max: 9.9 },
  },

  // ── 3. Product Startups ────────────────────────────────────────────────────
  // Strong DSA + decent CP + some project/dev exposure helps.
  {
    clusterName:           "Product Startups",
    count:                 100,
    dsaScoreRange:         { min: 50, max: 85  },   // high
    cpScoreRange:          { min: 25, max: 55  },   // medium
    devScoreRange:         { min: 25, max: 55  },   // medium
    placedCompanies:       ["Razorpay", "Swiggy", "Cred", "PhonePe", "Zomato"],
    leetCodeSolvedRange:   { min: 250, max: 425 },
    codeforcesRatingRange: { min: 600, max: 1320 },
    githubReposRange:      { min: 12, max: 28  },
    cgpaRange:             { min: 7.0, max: 9.2 },
  },

  // ── 4. Service / Mass Recruiters ───────────────────────────────────────────
  // Low bar overall. Hire in bulk. Aptitude + basic DSA enough.
  {
    clusterName:           "Service / Mass Recruiters",
    count:                 110,
    dsaScoreRange:         { min: 10, max: 40  },   // low-medium
    cpScoreRange:          { min: 5,  max: 30  },   // low
    devScoreRange:         { min: 5,  max: 30  },   // low
    placedCompanies:       ["TCS", "Infosys", "Wipro", "Cognizant", "Accenture"],
    leetCodeSolvedRange:   { min: 50,  max: 200 },
    codeforcesRatingRange: { min: 100, max: 720 },
    githubReposRange:      { min: 2,  max: 15  },
    cgpaRange:             { min: 6.0, max: 8.0 },
  },

  // ── 5. Fintech / Banks ─────────────────────────────────────────────────────
  // Similar to FAANG but slightly more CP-heavy (algo trading teams).
  {
    clusterName:           "Fintech / Banks",
    count:                 65,
    dsaScoreRange:         { min: 55, max: 90  },   // high
    cpScoreRange:          { min: 45, max: 80  },   // medium-high
    devScoreRange:         { min: 5,  max: 25  },   // low
    placedCompanies:       ["Goldman Sachs", "Morgan Stanley", "JP Morgan"],
    leetCodeSolvedRange:   { min: 275, max: 450 },
    codeforcesRatingRange: { min: 1080, max: 1920 },
    githubReposRange:      { min: 2, max: 12  },
    cgpaRange:             { min: 7.5, max: 9.6 },
  },

  // ── 6. Dev-Oriented Startups ───────────────────────────────────────────────
  // Rare niche: these look at GitHub/projects/open-source more than DSA.
  // Smallest cluster because most companies still care about DSA/CP first.
  {
    clusterName:           "Dev-Oriented Startups",
    count:                 35,
    dsaScoreRange:         { min: 10, max: 40  },   // low
    cpScoreRange:          { min: 5,  max: 25  },   // low
    devScoreRange:         { min: 65, max: 100 },   // HIGH
    placedCompanies:       ["Vercel", "Postman", "Hashnode"],
    leetCodeSolvedRange:   { min: 50,  max: 200 },
    codeforcesRatingRange: { min: 100, max: 600 },
    githubReposRange:      { min: 32, max: 50  },
    cgpaRange:             { min: 6.0, max: 8.5 },
  },
];

// ── Misc ─────────────────────────────────────────────────────────────────────

const branches        = ["CS", "IT", "AIML", "ECE", "MECH", "AIDS"];
const graduationYears = [2021, 2022, 2023, 2024, 2025];

// ── Profile builder ──────────────────────────────────────────────────────────

const buildStudentProfile = (clusterDef, index) => {
  const {
    clusterName, dsaScoreRange, cpScoreRange, devScoreRange,
    placedCompanies, leetCodeSolvedRange, codeforcesRatingRange,
    githubReposRange, cgpaRange,
  } = clusterDef;

  const dsaScore         = randomFloat(dsaScoreRange.min,         dsaScoreRange.max);
  const cpScore          = randomFloat(cpScoreRange.min,          cpScoreRange.max);
  const devScore         = randomFloat(devScoreRange.min,         devScoreRange.max);
  const leetCodeSolved   = randomInt(leetCodeSolvedRange.min,     leetCodeSolvedRange.max);
  const codeforcesRating = randomInt(codeforcesRatingRange.min,   codeforcesRatingRange.max);
  const githubRepos      = randomInt(githubReposRange.min,        githubReposRange.max);
  const cgpa             = randomFloat(cgpaRange.min,             cgpaRange.max);
  const placedCompany    = pickRandom(placedCompanies);
  const branch           = pickRandom(branches);
  const graduationYear   = pickRandom(graduationYears);

  const overallScore =
    Math.round((dsaScore * 0.4 + cpScore * 0.35 + devScore * 0.25) * 100) / 100;

  return {
    studentId:        `dummy_${clusterName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${index}`,
    clusterName,
    dsaScore,
    cpScore,
    devScore,
    overallScore,
    leetCodeSolved,
    codeforcesRating,
    githubRepos,
    cgpa,
    branch,
    graduationYear,
    placedCompany,
    createdAt: Date.now(),
  };
};

// ── Main seeder ──────────────────────────────────────────────────────────────

async function generateDummyData() {
  // ── Step 0: Delete old data ──────────────────────────────────────────────
  console.log("🗑️  Deleting old pastPlacements data...");
  await pastPlacementsRef.remove();
  console.log("   ✅ Old data deleted.\n");

  console.log("🚀 Generating new realistic placement data → RTDB: pastPlacements\n");

  let totalWritten = 0;
  let grandTotal = 0;
  clusterDefinitions.forEach(c => { grandTotal += c.count; });

  for (const clusterDef of clusterDefinitions) {
    console.log(`📦 [${clusterDef.clusterName}] → ${clusterDef.count} records (${clusterDef.placedCompanies.join(", ")})`);

    const pushPromises = [];
    for (let i = 0; i < clusterDef.count; i++) {
      const profile = buildStudentProfile(clusterDef, i);
      pushPromises.push(pastPlacementsRef.push(profile));
    }

    await Promise.all(pushPromises);
    totalWritten += clusterDef.count;
    console.log(`   ✅ Done — ${totalWritten}/${grandTotal} written\n`);
  }

  console.log("🎉 Success! New placement data summary:");
  console.log("───────────────────────────────────────────────────────");
  clusterDefinitions.forEach(c => {
    console.log(`   ${c.clusterName.padEnd(28)} ${String(c.count).padStart(3)} records → ${c.placedCompanies.join(", ")}`);
  });
  console.log("───────────────────────────────────────────────────────");
  console.log(`   TOTAL: ${totalWritten} records`);

  process.exit(0);
}

generateDummyData().catch((error) => {
  console.error("❌ Fatal error during seeding:", error);
  process.exit(1);
});
