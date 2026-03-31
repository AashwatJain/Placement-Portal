/**
 * seedData.js — Comprehensive Seed Script for Placement Portal (NIT Kurukshetra)
 *
 * Usage:  node src/scripts/seedData.js
 */

import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const serviceAccount = require("../config/serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://placement-portal-c0bdf-default-rtdb.firebaseio.com",
  });
}

const db = admin.database();
const firestore = admin.firestore();

// ─── Helpers ──────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, dec = 2) => +(Math.random() * (max - min) + min).toFixed(dec);
const uid = (prefix, i) => `${prefix}_${String(i).padStart(3, "0")}`;
const futureDate = (d) => { const x = new Date(); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10); };
const pastDate = (d) => { const x = new Date(); x.setDate(x.getDate() - d); return x; };

// ─── Data Pools ───────────────────────────────────────────────
const BRANCHES = ["CSE", "IT", "AIML", "AIDS", "MNC"];
const LOCATIONS = ["Bengaluru", "Hyderabad", "Mumbai", "Pune", "Delhi NCR", "Chennai", "Gurugram", "Noida", "Remote"];

const FIRST_M = ["Aarav","Vihaan","Aditya","Arjun","Reyansh","Sai","Ayaan","Krishna","Ishaan","Harsh","Rohan","Dev","Karan","Nikhil","Amit","Raj","Vikram","Pranav","Shubham","Ankit","Mohit","Rahul","Deepak","Gaurav","Tushar"];
const FIRST_F = ["Ananya","Diya","Myra","Sara","Aanya","Aadhya","Priya","Neha","Shruti","Kavya","Pooja","Riya","Simran","Tanvi","Megha"];
const LAST = ["Sharma","Verma","Patel","Gupta","Singh","Kumar","Jain","Reddy","Nair","Mishra","Yadav","Chauhan","Mehta","Agarwal","Bhat"];

const COMPANY_DATA = [
  { name: "Google", industry: "Technology", type: "On-Campus", ctc: "32 LPA", cgpa: 8.0 },
  { name: "Microsoft", industry: "Technology", type: "On-Campus", ctc: "28 LPA", cgpa: 7.5 },
  { name: "Amazon", industry: "Technology", type: "On-Campus", ctc: "26 LPA", cgpa: 7.0 },
  { name: "Meta", industry: "Technology", type: "Off-Campus", ctc: "40 LPA", cgpa: 8.5 },
  { name: "Apple", industry: "Technology", type: "Off-Campus", ctc: "35 LPA", cgpa: 8.0 },
  { name: "Goldman Sachs", industry: "Finance", type: "On-Campus", ctc: "22 LPA", cgpa: 7.5 },
  { name: "Morgan Stanley", industry: "Finance", type: "On-Campus", ctc: "24 LPA", cgpa: 7.5 },
  { name: "JP Morgan", industry: "Finance", type: "On-Campus", ctc: "20 LPA", cgpa: 7.0 },
  { name: "Deloitte", industry: "Consulting", type: "On-Campus", ctc: "12 LPA", cgpa: 7.0 },
  { name: "EY", industry: "Consulting", type: "On-Campus", ctc: "10 LPA", cgpa: 6.5 },
  { name: "Infosys", industry: "IT Services", type: "On-Campus", ctc: "6.5 LPA", cgpa: 6.0 },
  { name: "TCS", industry: "IT Services", type: "On-Campus", ctc: "7 LPA", cgpa: 6.0 },
  { name: "Wipro", industry: "IT Services", type: "On-Campus", ctc: "6 LPA", cgpa: 6.0 },
  { name: "HCL Technologies", industry: "IT Services", type: "On-Campus", ctc: "7.5 LPA", cgpa: 6.0 },
  { name: "Tech Mahindra", industry: "IT Services", type: "On-Campus", ctc: "6.8 LPA", cgpa: 6.0 },
  { name: "Adobe", industry: "Technology", type: "On-Campus", ctc: "25 LPA", cgpa: 7.5 },
  { name: "Salesforce", industry: "Technology", type: "On-Campus", ctc: "22 LPA", cgpa: 7.5 },
  { name: "Oracle", industry: "Technology", type: "On-Campus", ctc: "18 LPA", cgpa: 7.0 },
  { name: "SAP", industry: "Technology", type: "FTE + Intern", ctc: "16 LPA", cgpa: 7.0 },
  { name: "Uber", industry: "Technology", type: "Off-Campus", ctc: "30 LPA", cgpa: 8.0 },
  { name: "Flipkart", industry: "E-Commerce", type: "On-Campus", ctc: "24 LPA", cgpa: 7.5 },
  { name: "Swiggy", industry: "E-Commerce", type: "Intern", ctc: "18 LPA", cgpa: 7.0 },
  { name: "Razorpay", industry: "Fintech", type: "On-Campus", ctc: "20 LPA", cgpa: 7.5 },
  { name: "PhonePe", industry: "Fintech", type: "FTE + Intern", ctc: "19 LPA", cgpa: 7.0 },
  { name: "CRED", industry: "Fintech", type: "Off-Campus", ctc: "28 LPA", cgpa: 8.0 },
];
const CNAMES = COMPANY_DATA.map(c => c.name);

const ROLES = ["Software Engineer","Data Analyst","Product Manager","ML Engineer","Backend Developer","Frontend Developer","DevOps Engineer","Business Analyst","Cloud Engineer","Full Stack Developer","QA Engineer","Data Scientist","Security Engineer","Mobile Developer","SRE"];

const IQ = [
  { topic:"Arrays", question:"Find the kth largest element", link:"https://leetcode.com/problems/kth-largest-element-in-an-array/", difficulty:"Medium", platform:"LeetCode" },
  { topic:"DP", question:"Longest Common Subsequence", link:"https://leetcode.com/problems/longest-common-subsequence/", difficulty:"Medium", platform:"LeetCode" },
  { topic:"Trees", question:"LCA of Binary Tree", link:"https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/", difficulty:"Medium", platform:"LeetCode" },
  { topic:"Graphs", question:"Number of Islands", link:"https://leetcode.com/problems/number-of-islands/", difficulty:"Medium", platform:"LeetCode" },
  { topic:"Strings", question:"Longest Palindromic Substring", link:"https://leetcode.com/problems/longest-palindromic-substring/", difficulty:"Medium", platform:"LeetCode" },
  { topic:"System Design", question:"Design a URL Shortener", link:"https://www.geeksforgeeks.org/system-design-url-shortening-service/", difficulty:"Hard", platform:"System Design" },
  { topic:"Hashing", question:"Two Sum", link:"https://leetcode.com/problems/two-sum/", difficulty:"Easy", platform:"LeetCode" },
  { topic:"Linked List", question:"Reverse a Linked List", link:"https://leetcode.com/problems/reverse-linked-list/", difficulty:"Easy", platform:"LeetCode" },
];

const ALUMNI = ["Rahul Kapoor","Sneha Reddy","Amit Joshi","Priya Nair","Vikram Tiwari","Ananya Das","Karthik S","Meera Patel","Rohit Saxena","Divya Menon","Arjun Bhatt","Pooja Iyer","Saurav Gupta","Kavita Singh","Manish Verma"];

const LQ = [
  { text:"Two Sum", link:"https://leetcode.com/problems/two-sum/", difficulty:"Easy", tags:["Arrays","Hashing"] },
  { text:"Add Two Numbers", link:"https://leetcode.com/problems/add-two-numbers/", difficulty:"Medium", tags:["Linked List","Math"] },
  { text:"Longest Substring Without Repeating Characters", link:"https://leetcode.com/problems/longest-substring-without-repeating-characters/", difficulty:"Medium", tags:["Strings","Hashing"] },
  { text:"Median of Two Sorted Arrays", link:"https://leetcode.com/problems/median-of-two-sorted-arrays/", difficulty:"Hard", tags:["Arrays","Binary Search"] },
  { text:"Longest Palindromic Substring", link:"https://leetcode.com/problems/longest-palindromic-substring/", difficulty:"Medium", tags:["Strings","DP"] },
  { text:"Reverse Integer", link:"https://leetcode.com/problems/reverse-integer/", difficulty:"Medium", tags:["Math"] },
  { text:"Container With Most Water", link:"https://leetcode.com/problems/container-with-most-water/", difficulty:"Medium", tags:["Arrays","Greedy"] },
  { text:"3Sum", link:"https://leetcode.com/problems/3sum/", difficulty:"Medium", tags:["Arrays","Sorting"] },
  { text:"Valid Parentheses", link:"https://leetcode.com/problems/valid-parentheses/", difficulty:"Easy", tags:["Stack","Strings"] },
  { text:"Merge Two Sorted Lists", link:"https://leetcode.com/problems/merge-two-sorted-lists/", difficulty:"Easy", tags:["Linked List"] },
  { text:"Maximum Subarray", link:"https://leetcode.com/problems/maximum-subarray/", difficulty:"Medium", tags:["Arrays","DP"] },
  { text:"Climbing Stairs", link:"https://leetcode.com/problems/climbing-stairs/", difficulty:"Easy", tags:["DP","Math"] },
  { text:"Best Time to Buy and Sell Stock", link:"https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", difficulty:"Easy", tags:["Arrays","DP"] },
  { text:"Binary Tree Level Order Traversal", link:"https://leetcode.com/problems/binary-tree-level-order-traversal/", difficulty:"Medium", tags:["Trees","Queue"] },
  { text:"Word Search", link:"https://leetcode.com/problems/word-search/", difficulty:"Medium", tags:["Backtracking"] },
  { text:"Course Schedule", link:"https://leetcode.com/problems/course-schedule/", difficulty:"Medium", tags:["Graphs"] },
  { text:"Trapping Rain Water", link:"https://leetcode.com/problems/trapping-rain-water/", difficulty:"Hard", tags:["Arrays","Stack","DP"] },
  { text:"Edit Distance", link:"https://leetcode.com/problems/edit-distance/", difficulty:"Hard", tags:["Strings","DP"] },
  { text:"Merge k Sorted Lists", link:"https://leetcode.com/problems/merge-k-sorted-lists/", difficulty:"Hard", tags:["Linked List","Sorting"] },
  { text:"Coin Change", link:"https://leetcode.com/problems/coin-change/", difficulty:"Medium", tags:["DP"] },
  { text:"House Robber", link:"https://leetcode.com/problems/house-robber/", difficulty:"Medium", tags:["DP"] },
  { text:"Number of Islands", link:"https://leetcode.com/problems/number-of-islands/", difficulty:"Medium", tags:["Graphs"] },
  { text:"Rotate Image", link:"https://leetcode.com/problems/rotate-image/", difficulty:"Medium", tags:["Arrays","Math"] },
  { text:"Group Anagrams", link:"https://leetcode.com/problems/group-anagrams/", difficulty:"Medium", tags:["Strings","Hashing","Sorting"] },
  { text:"Kth Largest Element", link:"https://leetcode.com/problems/kth-largest-element-in-an-array/", difficulty:"Medium", tags:["Sorting","Arrays"] },
  { text:"Product of Array Except Self", link:"https://leetcode.com/problems/product-of-array-except-self/", difficulty:"Medium", tags:["Arrays"] },
  { text:"Serialize and Deserialize Binary Tree", link:"https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", difficulty:"Hard", tags:["Trees"] },
  { text:"LRU Cache", link:"https://leetcode.com/problems/lru-cache/", difficulty:"Medium", tags:["Hashing","Linked List"] },
  { text:"Minimum Window Substring", link:"https://leetcode.com/problems/minimum-window-substring/", difficulty:"Hard", tags:["Strings","Hashing"] },
  { text:"Sliding Window Maximum", link:"https://leetcode.com/problems/sliding-window-maximum/", difficulty:"Hard", tags:["Arrays","Deque"] },
];

const STORIES = [
  "The interview started with a brief introduction and resume walkthrough. The interviewer was friendly and gave me enough time to think. I was asked 2 DSA questions — one on arrays and one on trees. I managed to solve both with optimal solutions. The HR round was casual and focused on my interests and career goals.",
  "I had 3 rounds — Online Assessment, Technical Interview, and HR. The OA had 2 medium-level coding questions and 15 MCQs on OS and DBMS. In the technical round, I was grilled on system design for 30 minutes. Prepare your low-level design well!",
  "Very tough process with 4 rounds. The coding round had 3 Hard-level problems. I could solve 2 completely. In the subsequent rounds, I faced deep questions on concurrency, distributed systems, and time complexity analysis.",
  "Smooth interview experience overall. The recruiter was responsive and the process was well-organized. I was asked behavioral questions using the STAR method, followed by a system design discussion on designing a URL shortener.",
  "The company visited our campus and shortlisted 50 students based on CGPA cutoff (7.5+). The written test had aptitude and coding sections. I solved all coding questions in 45 minutes.",
  "It was a virtual hiring drive. Platform used was HackerRank. The test had 3 coding problems — 1 Easy, 1 Medium, 1 Hard. Time limit was 90 min. I couldn't finish the hard question but got selected for interviews.",
  "The interview process was divided into Day 1 (Test + Group Discussion) and Day 2 (Technical + HR). The aptitude test was moderate. GD topic was 'AI replacing jobs'.",
  "Great company culture. The initial screening involved a take-home assignment to build a REST API. After that, a pair programming session with the interviewer. Finally, a culture-fit round.",
  "First round was a coding test on CoderPad with 2 medium DSA problems. Second round focused entirely on my projects and contributions. Third round was behavioral. Got the offer within a week!",
  "The selection had 5 rounds total. Aptitude → Coding → Tech1 → Tech2 → HR. Each tech round lasted 45 mins. Questions ranged from OS internals to DBMS query optimization. Very rigorous process.",
];

// ═══════════════════════════════════════════════════════════════
//                       SEED FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// ── 1. Users (RTDB) ──────────────────────────────────────────
async function seedUsers() {
  console.log("🔄  Seeding users...");
  const users = {};

  // Forced statuses: 12 Placed, 6 Shortlisted, 5 Interviewing, 4 Opted-out, 13 Unplaced = 40
  const statuses = [
    ...Array(12).fill("Placed"),
    ...Array(6).fill("Shortlisted"),
    ...Array(5).fill("Interviewing"),
    ...Array(4).fill("Opted-out"),
    ...Array(13).fill("Unplaced"),
  ];
  // Spread branches evenly
  const branches = [];
  for (let i = 0; i < 40; i++) branches.push(BRANCHES[i % BRANCHES.length]);
  // Shuffle branches to mix with statuses
  branches.sort(() => Math.random() - 0.5);

  const resumeStatuses = ["approved", "approved", "approved", "pending", "pending", "rejected"];

  for (let i = 1; i <= 40; i++) {
    const gender = i % 3 === 0 ? "Female" : "Male";
    const firstName = gender === "Female" ? pick(FIRST_F) : pick(FIRST_M);
    const lastName = pick(LAST);
    const fullName = `${firstName} ${lastName}`;
    const branch = branches[i - 1];
    const status = statuses[i - 1];
    const rollNo = `${randInt(121, 122)}${BRANCHES.indexOf(branch) + 10}${String(i).padStart(3, "0")}`;
    const email = `${firstName.toLowerCase()}_${rollNo}@nitkkr.ac.in`;
    const cgpa = randFloat(6.0, 9.8);
    const isPlaced = status === "Placed";
    const placedCompany = isPlaced ? pick(CNAMES) : "";
    const placedPkg = isPlaced ? randFloat(4, 45) : 0;

    const id = uid("student", i);
    users[id] = {
      fullName, name: fullName, email, rollNo,
      phone: `+91 ${randInt(70000, 99999)}${randInt(10000, 99999)}`,
      role: "student", branch, year: pick(["2025", "2026"]),
      cgpa: String(cgpa), gender, location: pick(LOCATIONS),
      status, companyName: placedCompany,
      placed_package_lpa: isPlaced ? String(placedPkg) : "",
      placement_status: isPlaced ? "placed" : "",
      leetcode: Math.random() > 0.2 ? `${firstName.toLowerCase()}${randInt(1, 999)}` : "",
      codeforces: Math.random() > 0.4 ? `${firstName.toLowerCase()}_cf` : "",
      codechef: Math.random() > 0.4 ? `${firstName.toLowerCase()}_cc` : "",
      github: `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
      linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
      about: `Passionate ${branch} student at NIT Kurukshetra interested in ${pick(["AI/ML","Web Development","Competitive Programming","Cloud Computing","Data Science","Cybersecurity","Mobile Dev","Blockchain","IoT","Embedded Systems"])}. Looking for exciting opportunities.`,
      marks10th: String(randFloat(75, 98, 1)),
      marks12th: String(randFloat(70, 96, 1)),
      activeBacklogs: String(Math.random() > 0.85 ? randInt(1, 2) : 0),
      backlogHistory: String(Math.random() > 0.75 ? randInt(1, 3) : 0),
      resumeUrl: Math.random() > 0.1 ? `https://example.com/resumes/${rollNo}_resume.pdf` : "",
      isResumeVerified: Math.random() > 0.3,
      resume_status: pick(resumeStatuses),
      createdAt: Date.now() - randInt(30, 180) * 86400000,
      updatedAt: Date.now() - randInt(0, 15) * 86400000,
    };

    // Applications for non-opted-out
    if (status !== "Opted-out" && Math.random() > 0.15) {
      users[id].applications = {};
      const numApps = randInt(1, 6);
      for (let a = 0; a < numApps; a++) {
        const oppId = `opp_${String(randInt(1, 25)).padStart(3, "0")}`;
        const appMap = {
          Placed: ["Offered","Applied","Shortlisted","Offered"],
          Shortlisted: ["Shortlisted","Applied","Shortlisted"],
          Interviewing: ["Shortlisted","Applied","Shortlisted"],
          Unplaced: ["Applied","Applied","Rejected","Applied"],
        };
        const appStatus = pick(appMap[status] || ["Applied"]);
        users[id].applications[oppId] = {
          company: pick(CNAMES), role: pick(ROLES), status: appStatus,
          offerType: pick(["Placement","Internship","Intern + PPO"]),
          cgpaCutoff: String(randFloat(6.0, 8.0, 1)),
          ctc: `${randInt(5, 40)} LPA`, location: pick(LOCATIONS),
          appliedOn: pastDate(randInt(10, 90)).toISOString().slice(0, 10),
          timeline: [
            { step: "Applied", done: true, date: "2026-01-15" },
            { step: "Shortlisted", done: appStatus !== "Applied", date: appStatus !== "Applied" ? "2026-01-22" : "" },
            { step: "Online Assessment", done: ["Shortlisted","Offered"].includes(appStatus) && Math.random() > 0.3, date: "2026-02-01" },
            { step: "Interview", done: appStatus === "Offered" || (appStatus === "Shortlisted" && Math.random() > 0.5), date: "2026-02-10" },
            { step: "Final Decision", done: appStatus === "Offered" || appStatus === "Rejected", date: "2026-02-20" },
          ],
        };
      }
    }
  }

  // Admin
  users["admin_001"] = {
    fullName: "Admin User", name: "Admin User", email: "admin@nitkkr.ac.in",
    role: "admin", createdAt: Date.now() - 365 * 86400000,
  };

  // Recruiters (2)
  users["recruiter_001"] = {
    fullName: "Recruiter Microsoft", name: "Recruiter Microsoft",
    email: "recruiter@microsoft.com", role: "recruiter", companyName: "Microsoft",
    createdAt: Date.now() - 200 * 86400000,
  };
  users["recruiter_002"] = {
    fullName: "Recruiter Google", name: "Recruiter Google",
    email: "recruiter@google.com", role: "recruiter", companyName: "Google",
    createdAt: Date.now() - 150 * 86400000,
  };

  await db.ref("users").set(users);
  console.log(`   ✅ ${Object.keys(users).length} users seeded (12P, 6S, 5I, 4O, 13U, 1 Admin, 2 Recruiters)`);
}

// ── 2. Past Placements (RTDB) ────────────────────────────────
async function seedPastPlacements() {
  console.log("🔄  Seeding past placements...");
  const placements = {};
  for (let i = 0; i < 100; i++) {
    placements[`pp_${i}`] = { dsaScore: randInt(30, 100), devScore: randInt(20, 100), cpScore: randInt(10, 100), placedCompany: pick(CNAMES) };
  }
  await db.ref("pastPlacements").set(placements);
  console.log("   ✅ 100 past placements seeded");
}

// ── 3. Companies (Firestore) ─────────────────────────────────
async function seedCompanies() {
  console.log("🔄  Seeding companies...");
  const batch = firestore.batch();
  COMPANY_DATA.forEach((c, i) => {
    const ref = firestore.collection("companies").doc(`company_${String(i + 1).padStart(3, "0")}`);
    const shuffled = [...IQ].sort(() => Math.random() - 0.5);
    const pastHires = Array.from({ length: randInt(2, 4) }, () => ({
      name: pick(ALUMNI), role: pick(ROLES), batch: pick(["2022","2023","2024","2025"]),
      linkedin: `https://linkedin.com/in/${pick(ALUMNI).toLowerCase().replace(/\s+/g, "-")}`,
    }));
    batch.set(ref, {
      name: c.name, industry: c.industry, type: c.type, ctc: c.ctc,
      cgpaCutoff: c.cgpa, date: pastDate(randInt(-30, 120)).toISOString().slice(0, 10),
      score: randInt(50, 100), avgPackage: parseFloat(c.ctc), minCgpa: c.cgpa,
      roles: [pick(ROLES), pick(ROLES)],
      branches: BRANCHES.slice(0, randInt(2, 6)),
      locations: [pick(LOCATIONS), pick(LOCATIONS)],
      status: pick(["active","active","active","upcoming","completed"]),
      website: `https://${c.name.toLowerCase().replace(/\s+/g, "")}.com`,
      description: `${c.name} is a leading company in the ${c.industry.toLowerCase()} sector, offering exciting career opportunities for NIT Kurukshetra graduates.`,
      interviewQuestions: shuffled.slice(0, randInt(3, 5)),
      pastHires,
    });
  });
  await batch.commit();
  console.log(`   ✅ ${COMPANY_DATA.length} companies seeded`);
}

// ── 4. Opportunities / JAFs ──────────────────────────────────
async function seedOpportunities() {
  console.log("🔄  Seeding opportunities...");
  const batch = firestore.batch();
  const offerTypes = ["Placement","Internship","Intern + PPO"];
  const driveTypes = ["On-campus","Off-campus","Virtual"];
  const oppStatuses = ["open","open","open","closed","in-progress"];

  for (let i = 1; i <= 25; i++) {
    const c = COMPANY_DATA[(i - 1) % COMPANY_DATA.length];
    const role = pick(ROLES);
    const offerType = offerTypes[(i - 1) % 3];
    const ld = randInt(5, 45);
    const ref = firestore.collection("opportunities").doc(`opp_${String(i).padStart(3, "0")}`);
    batch.set(ref, {
      name: c.name, logo: "", roles: role + (Math.random() > 0.5 ? `, ${pick(ROLES)}` : ""),
      ctc: c.ctc, stipend: offerType.includes("Intern") ? `₹${randInt(20, 80)}K/month` : "",
      location: pick(LOCATIONS), offerType, driveType: pick(driveTypes),
      lastDate: futureDate(ld), deadline: futureDate(ld),
      cgpaCutoff: c.cgpa, branches: BRANCHES.slice(0, randInt(3, 6)).join(", "),
      backlogs: pick(["No active backlogs","Max 1 active backlog","No restriction"]),
      bond: Math.random() > 0.7 ? `${randInt(1, 3)} years` : "None",
      description: `${c.name} is hiring for ${role} role. Great opportunity for NIT Kurukshetra students.`,
      applicantsCount: randInt(10, 120), shortlistedCount: randInt(5, 40),
      status: oppStatuses[(i - 1) % 5],
      shortlistDate: futureDate(ld + randInt(3, 7)), oaDate: futureDate(ld + randInt(8, 14)),
      oaResultDate: futureDate(ld + randInt(15, 20)), interviewDate: futureDate(ld + randInt(21, 30)),
      interviewResultDate: futureDate(ld + randInt(31, 40)), finalResultDate: futureDate(ld + randInt(41, 50)),
      rounds: [
        { name: "Written Test", date: futureDate(ld + randInt(5, 10)) },
        { name: "Technical Interview", date: futureDate(ld + randInt(15, 25)) },
        { name: "HR Interview", date: futureDate(ld + randInt(28, 35)) },
      ],
      eligibility: { branches: BRANCHES.slice(0, randInt(2, 6)), minCgpa: c.cgpa, backlogs: "No active backlogs" },
      selectionProcess: ["Written Test","Technical Interview","HR Interview"],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
  console.log("   ✅ 25 opportunities seeded");
}

// ── 5. Questions ─────────────────────────────────────────────
async function seedQuestions() {
  console.log("🔄  Seeding questions...");
  const batch = firestore.batch();
  LQ.forEach((q, i) => {
    const ref = firestore.collection("questions").doc(`q_${String(i + 1).padStart(3, "0")}`);
    batch.set(ref, {
      companyId: `company_${String((i % 25) + 1).padStart(3, "0")}`,
      companyName: CNAMES[i % 25], text: q.text, link: q.link,
      author: pick(["Placement Cell (Admin)","Anonymized Student","Prof. Sharma","Alumni Contributor"]),
      difficulty: q.difficulty, tags: q.tags,
      status: i < 24 ? "approved" : pick(["approved","pending","pending","rejected"]),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();
  console.log(`   ✅ ${LQ.length} questions seeded`);
}

// ── 6. Interview Experiences ─────────────────────────────────
async function seedExperiences() {
  console.log("🔄  Seeding experiences...");
  const batch = firestore.batch();
  const statuses = ["Selected","Selected","Rejected","Waitlisted","Selected"];
  const diffs = ["Easy","Medium","Medium","Hard"];
  for (let i = 0; i < 20; i++) {
    const story = STORIES[i % STORIES.length];
    const ref = firestore.collection("experiences").doc(`exp_${String(i + 1).padStart(3, "0")}`);
    batch.set(ref, {
      company: pick(CNAMES), role: pick(ROLES),
      status: statuses[i % statuses.length], difficulty: diffs[i % diffs.length],
      summary: story.substring(0, 140) + "...", fullStory: story,
      problems: [pick(LQ).text, pick(LQ).text],
      author: `${pick([...FIRST_M, ...FIRST_F])} ${pick(LAST)}`,
      authorId: uid("student", randInt(1, 40)),
      date: pastDate(randInt(10, 180)).toLocaleDateString("en-US", { year: "numeric", month: "short" }),
      likes: randInt(0, 50), likedBy: [], approved: i < 16,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
  console.log("   ✅ 20 experiences seeded (Selected/Rejected/Waitlisted + approved/unapproved)");
}

// ── 7. Notifications ─────────────────────────────────────────
async function seedNotifications() {
  console.log("🔄  Seeding notifications...");
  const batch = firestore.batch();
  const notifs = [
    { text:"Google campus drive registration is now open! Apply before the deadline.", type:"deadline" },
    { text:"You've been shortlisted for Amazon — check your application timeline.", type:"shortlist" },
    { text:"New interview experience shared: Microsoft SDE role — read now!", type:"info" },
    { text:"Reminder: Resume verification window closes tomorrow.", type:"reminder" },
    { text:"Adobe has updated their eligibility criteria — CGPA cutoff reduced to 7.0.", type:"info" },
    { text:"Congratulations! Flipkart has extended offers to 8 students.", type:"info" },
    { text:"Practice session: Top 50 DSA questions for upcoming placements uploaded.", type:"reminder" },
    { text:"Morgan Stanley will be visiting NIT Kurukshetra campus next week!", type:"deadline" },
    { text:"TCS NQT results have been announced. Check your dashboard.", type:"shortlist" },
    { text:"Upcoming webinar: 'How to crack FAANG interviews' — Saturday at 4 PM.", type:"info" },
    { text:"Your resume has been verified and approved by the placement cell.", type:"info" },
    { text:"Razorpay SDE Intern applications close in 48 hours!", type:"deadline" },
    { text:"New company added: CRED is now hiring from NIT Kurukshetra!", type:"info" },
    { text:"Goldman Sachs has shortlisted 25 students for the technical round.", type:"shortlist" },
    { text:"Placement cell office hours extended to 8 PM during drive week.", type:"reminder" },
    { text:"Meta off-campus registration link shared — apply via portal.", type:"deadline" },
    { text:"Deloitte aptitude test scheduled for next Monday. Prepare well!", type:"reminder" },
    { text:"Congratulations to all students placed at Google! 🎉", type:"info" },
    { text:"Wipro has completed hiring. Results announced on dashboard.", type:"shortlist" },
    { text:"Final year project submission deadline extended by 1 week.", type:"reminder" },
  ];
  notifs.forEach((n, i) => {
    const ref = firestore.collection("notifications").doc(`notif_${String(i + 1).padStart(3, "0")}`);
    batch.set(ref, { text: n.text, type: n.type, target: "all", read: i > 8, createdAt: admin.firestore.Timestamp.fromDate(pastDate(i * 2)) });
  });
  await batch.commit();
  console.log(`   ✅ ${notifs.length} notifications seeded`);
}

// ── 8. Admin Notifications ───────────────────────────────────
async function seedAdminNotifications() {
  console.log("🔄  Seeding admin notifications...");
  const batch = firestore.batch();
  const items = [
    { title:"New Drive Alert", message:"Google has confirmed a campus drive for March 2026.", targetType:"all" },
    { title:"Eligibility Update", message:"Microsoft lowered CGPA cutoff to 7.0 for SDE roles.", targetType:"all" },
    { title:"Resume Review Pending", message:"18 student resumes are awaiting verification.", targetType:"all" },
    { title:"Drive Completed", message:"Amazon SDE hiring drive completed — 12 offers extended.", targetType:"all" },
    { title:"Branch-Specific Notice", message:"IT students may apply for Qualcomm software roles.", targetType:"branch", targetValue:"IT" },
    { title:"Branch-Specific Notice", message:"CSE students: Prepare for Adobe coding round.", targetType:"branch", targetValue:"CSE" },
    { title:"Mock Interview Schedule", message:"Mock interviews for pre-final years start next Monday.", targetType:"all" },
    { title:"Offer Letter Update", message:"Goldman Sachs offer letters dispatched to selected candidates.", targetType:"company", targetValue:"Goldman Sachs" },
    { title:"Placement Statistics", message:"72% placement rate achieved! 25 companies visited.", targetType:"all" },
    { title:"Urgent: Drive Tomorrow", message:"Flipkart drive scheduled for tomorrow — ensure all eligible students attend.", targetType:"all" },
  ];
  items.forEach((n, i) => {
    const ref = firestore.collection("admin_notifications").doc(`admin_notif_${String(i + 1).padStart(3, "0")}`);
    batch.set(ref, { title: n.title, message: n.message, targetType: n.targetType, targetValue: n.targetValue || "", createdAt: admin.firestore.Timestamp.fromDate(pastDate(i * 4)) });
  });
  await batch.commit();
  console.log(`   ✅ ${items.length} admin notifications seeded`);
}

// ── 9. Drives ────────────────────────────────────────────────
async function seedDrives() {
  console.log("🔄  Seeding drives...");
  const batch = firestore.batch();
  const dStatuses = ["active","active","active","completed","completed","upcoming","upcoming"];
  for (let i = 1; i <= 20; i++) {
    const c = COMPANY_DATA[(i - 1) % COMPANY_DATA.length];
    const ref = firestore.collection("drives").doc(`drive_${String(i).padStart(3, "0")}`);
    batch.set(ref, {
      company_id: `company_${String(i).padStart(3, "0")}`, company_name: c.name,
      role: pick(ROLES), status: dStatuses[(i - 1) % dStatuses.length],
      date: pastDate(randInt(-20, 60)).toISOString().slice(0, 10),
      registeredCount: randInt(30, 150), shortlistedCount: randInt(10, 50),
      selectedCount: randInt(2, 20), package_lpa: parseFloat(c.ctc),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
  console.log("   ✅ 20 drives seeded (active/completed/upcoming)");
}

// ── 10. Offers (Aug–Mar spread) ──────────────────────────────
async function seedOffers() {
  console.log("🔄  Seeding offers...");
  const batch = firestore.batch();
  const dates = [];
  // Generate 40 dates spread across Aug 2025 – Mar 2026
  for (let m = 8; m <= 12; m++) for (let d = 0; d < (m <= 10 ? 3 : 5); d++) dates.push(new Date(`2025-${String(m).padStart(2,"0")}-${String(randInt(1, 28)).padStart(2,"0")}`));
  for (let m = 1; m <= 3; m++) for (let d = 0; d < 5; d++) dates.push(new Date(`2026-${String(m).padStart(2,"0")}-${String(randInt(1, 28)).padStart(2,"0")}`));
  while (dates.length < 40) dates.push(new Date(`2026-02-${String(randInt(1,28)).padStart(2,"0")}`));

  const oStatuses = ["accepted","accepted","accepted","accepted","pending","pending","declined"];
  const oTypes = ["Full-Time","Internship + FTE","Internship","Full-Time","Full-Time"];

  for (let i = 0; i < 40; i++) {
    const c = pick(COMPANY_DATA);
    const ref = firestore.collection("offers").doc(`offer_${String(i + 1).padStart(3, "0")}`);
    batch.set(ref, {
      student_id: uid("student", randInt(1, 40)),
      student_name: `${pick([...FIRST_M, ...FIRST_F])} ${pick(LAST)}`,
      company_id: `company_${String(randInt(1, 25)).padStart(3, "0")}`,
      company_name: c.name, companyId: `company_${String(randInt(1, 25)).padStart(3, "0")}`,
      companyName: c.name, role: pick(ROLES),
      package_lpa: parseFloat(c.ctc) || randFloat(5, 40),
      offer_type: oTypes[i % oTypes.length], status: oStatuses[i % oStatuses.length],
      createdAt: admin.firestore.Timestamp.fromDate(dates[i]),
    });
  }
  await batch.commit();
  console.log("   ✅ 40 offers seeded (spread Aug–Mar, accepted/pending/declined)");
}

// ── 11. Audit Log ────────────────────────────────────────────
async function seedAuditLog() {
  console.log("🔄  Seeding audit log...");
  const batch = firestore.batch();
  const actions = [
    { action:"Created JAF for Google — SDE role", module:"opportunities", actorName:"Admin User" },
    { action:"Updated student status to Placed (Aarav Sharma)", module:"students", actorName:"Admin User" },
    { action:"Approved resume of Priya Nair", module:"resumes", actorName:"Admin User" },
    { action:"Added new company: CRED", module:"companies", actorName:"Admin User" },
    { action:"Published notification: Google drive registration open", module:"notifications", actorName:"Admin User" },
    { action:"Shortlisted 15 CSE students for Microsoft", module:"drives", actorName:"Recruiter Microsoft" },
    { action:"Updated Amazon drive status to completed", module:"drives", actorName:"Admin User" },
    { action:"Rejected question submission (duplicate)", module:"questions", actorName:"Admin User" },
    { action:"Exported CSV of CSE students", module:"students", actorName:"Admin User" },
    { action:"Created new drive for Adobe — Data Analyst", module:"drives", actorName:"Admin User" },
    { action:"Updated offer letter for Rohan Kumar", module:"offers", actorName:"Admin User" },
    { action:"Sent bulk notification to IT branch", module:"notifications", actorName:"Admin User" },
    { action:"Approved 5 interview experience submissions", module:"experiences", actorName:"Admin User" },
    { action:"Changed eligibility criteria for Goldman Sachs", module:"opportunities", actorName:"Admin User" },
    { action:"Marked 10 students as Interviewing", module:"students", actorName:"Recruiter Microsoft" },
    { action:"Updated JAF deadline for Meta", module:"opportunities", actorName:"Admin User" },
    { action:"Deleted expired notification", module:"notifications", actorName:"Admin User" },
    { action:"Verified 8 student resumes", module:"resumes", actorName:"Admin User" },
    { action:"Added mock interview schedule for CSE branch", module:"drives", actorName:"Admin User" },
    { action:"Generated placement report Q1 2026", module:"reports", actorName:"Admin User" },
    { action:"Shortlisted 20 students for Google SDE", module:"drives", actorName:"Recruiter Google" },
    { action:"Rejected 3 student applications for Meta", module:"students", actorName:"Admin User" },
    { action:"Updated Razorpay drive package to 22 LPA", module:"drives", actorName:"Admin User" },
    { action:"Sent reminder for upcoming Flipkart drive", module:"notifications", actorName:"Admin User" },
    { action:"Bulk status update: marked 5 students as Opted-out", module:"students", actorName:"Admin User" },
  ];
  actions.forEach((a, i) => {
    const ref = firestore.collection("audit_log").doc(`log_${String(i + 1).padStart(3, "0")}`);
    batch.set(ref, { ...a, actor: a.actorName, targetId: `target_${randInt(1, 40)}`, timestamp: admin.firestore.Timestamp.fromDate(pastDate(i * 2)) });
  });
  await batch.commit();
  console.log(`   ✅ ${actions.length} audit log entries seeded`);
}

// ── 12. Recruiter Data (Firestore) ───────────────────────────
async function seedRecruiterData() {
  console.log("🔄  Seeding recruiter data...");
  const pipelineStatuses = ["screening","tech1","tech2","hr","selected","rejected"];

  for (const rId of ["recruiter_001", "recruiter_002"]) {
    const statuses = {};
    const notes = {};
    // Assign some students to various pipeline stages
    for (let i = 1; i <= 15; i++) {
      const sId = uid("student", randInt(1, 40));
      statuses[sId] = pick(pipelineStatuses);
      if (Math.random() > 0.4) {
        notes[sId] = pick([
          "Strong DSA skills, performed well in coding round",
          "Good communication but needs improvement in system design",
          "Excellent project portfolio, strong candidate",
          "Average performance, consider for next round",
          "Top performer — fast-track to HR round",
          "Weak in fundamentals, not recommended",
          "Impressive internship experience at startup",
        ]);
      }
    }
    const docRef = firestore.collection("recruiter_data").doc(rId);
    await docRef.set({ candidate_statuses: statuses, candidate_notes: notes }, { merge: true });
  }
  console.log("   ✅ Recruiter data seeded for 2 recruiters");
}

// ═══════════════════════════════════════════════════════════════
//                          MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║  NIT Kurukshetra Placement Portal — Full Data Seeder  ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  try {
    await seedUsers();
    await seedPastPlacements();
    await seedCompanies();
    await seedOpportunities();
    await seedQuestions();
    await seedExperiences();
    await seedNotifications();
    await seedAdminNotifications();
    await seedDrives();
    await seedOffers();
    await seedAuditLog();
    await seedRecruiterData();

    console.log("\n🎉  All seed data populated successfully!\n");
    console.log("📋  Summary:");
    console.log("   ├─ 40 students (Placed:12 | Shortlisted:6 | Interviewing:5 | Opted-out:4 | Unplaced:13)");
    console.log("   ├─ All emails: @nitkkr.ac.in domain");
    console.log("   ├─ 1 admin + 2 recruiters (Microsoft, Google)");
    console.log("   ├─ 100 past placements (ML recommendations)");
    console.log("   ├─ 25 companies (with PYQs + alumni contacts)");
    console.log("   ├─ 25 opportunities (Placement/Internship/Intern+PPO, open/closed/in-progress)");
    console.log("   ├─ 30 practice questions (approved + pending + rejected)");
    console.log("   ├─ 20 interview experiences (Selected/Rejected/Waitlisted)");
    console.log("   ├─ 20 notifications + 10 admin notifications (all types)");
    console.log("   ├─ 20 drives (active/completed/upcoming)");
    console.log("   ├─ 40 offers (Aug–Mar, accepted/pending/declined)");
    console.log("   ├─ 25 audit log entries");
    console.log("   └─ Recruiter pipeline data for 2 recruiters\n");
  } catch (error) {
    console.error("\n❌  Seed script failed:", error);
  }

  process.exit(0);
}

main();
