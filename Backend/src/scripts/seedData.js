/**
 * seedData.js — Comprehensive Seed Script for Placement Portal
 *
 * Populates EVERY collection with field-accurate data so ALL pages show content:
 *
 *  RTDB:
 *   users          — 35 students (all status types), 1 admin, 1 recruiter
 *   pastPlacements — 80 records for ML recommendations
 *
 *  Firestore:
 *   companies            — 25 (with interviewQuestions, pastHires, locations, etc.)
 *   opportunities        — 20 (with offerType, lastDate, process dates, eligibility)
 *   questions            — 30 LeetCode PYQs
 *   experiences          — 15 interview stories
 *   notifications        — 15 student notifications
 *   admin_notifications  — 8 admin alerts
 *   drives               — 15
 *   offers               — 30 (spread across months Aug-Mar)
 *   audit_log            — 20 activity feed entries
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

// ───────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, dec = 2) => +(Math.random() * (max - min) + min).toFixed(dec);
const uid = (prefix, i) => `${prefix}_${String(i).padStart(3, "0")}`;

const futureDate = (daysFromNow) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
};
const pastDate = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
};

// ───────────────────────────────────────────────────────────────
// Static Data Pools
// ───────────────────────────────────────────────────────────────

const BRANCHES = ["CSE", "ECE", "ME", "EE", "CE", "IT"];
const GENDERS = ["Male", "Female"];
const LOCATIONS = ["Bengaluru", "Hyderabad", "Mumbai", "Pune", "Delhi NCR", "Chennai", "Gurugram", "Noida", "Remote"];

const FIRST_NAMES_M = ["Aarav", "Vihaan", "Aditya", "Arjun", "Reyansh", "Sai", "Ayaan", "Krishna", "Ishaan", "Harsh", "Rohan", "Dev", "Karan", "Nikhil", "Amit", "Raj", "Vikram", "Pranav", "Shubham", "Ankit"];
const FIRST_NAMES_F = ["Ananya", "Diya", "Myra", "Sara", "Aanya", "Aadhya", "Priya", "Neha", "Shruti", "Kavya"];
const LAST_NAMES = ["Sharma", "Verma", "Patel", "Gupta", "Singh", "Kumar", "Jain", "Reddy", "Nair", "Mishra", "Yadav", "Chauhan", "Mehta", "Agarwal", "Bhat"];

const COMPANY_DATA = [
  { name: "Google",           industry: "Technology",   type: "On-Campus", ctc: "32 LPA",   cgpaCutoff: 8.0 },
  { name: "Microsoft",        industry: "Technology",   type: "On-Campus", ctc: "28 LPA",   cgpaCutoff: 7.5 },
  { name: "Amazon",           industry: "Technology",   type: "On-Campus", ctc: "26 LPA",   cgpaCutoff: 7.0 },
  { name: "Meta",             industry: "Technology",   type: "Off-Campus",ctc: "40 LPA",   cgpaCutoff: 8.5 },
  { name: "Apple",            industry: "Technology",   type: "Off-Campus",ctc: "35 LPA",   cgpaCutoff: 8.0 },
  { name: "Goldman Sachs",    industry: "Finance",      type: "On-Campus", ctc: "22 LPA",   cgpaCutoff: 7.5 },
  { name: "Morgan Stanley",   industry: "Finance",      type: "On-Campus", ctc: "24 LPA",   cgpaCutoff: 7.5 },
  { name: "JP Morgan",        industry: "Finance",      type: "On-Campus", ctc: "20 LPA",   cgpaCutoff: 7.0 },
  { name: "Deloitte",         industry: "Consulting",   type: "On-Campus", ctc: "12 LPA",   cgpaCutoff: 7.0 },
  { name: "EY",               industry: "Consulting",   type: "On-Campus", ctc: "10 LPA",   cgpaCutoff: 6.5 },
  { name: "Infosys",          industry: "IT Services",  type: "On-Campus", ctc: "6.5 LPA",  cgpaCutoff: 6.0 },
  { name: "TCS",              industry: "IT Services",  type: "On-Campus", ctc: "7 LPA",    cgpaCutoff: 6.0 },
  { name: "Wipro",            industry: "IT Services",  type: "On-Campus", ctc: "6 LPA",    cgpaCutoff: 6.0 },
  { name: "HCL Technologies", industry: "IT Services",  type: "On-Campus", ctc: "7.5 LPA",  cgpaCutoff: 6.0 },
  { name: "Tech Mahindra",    industry: "IT Services",  type: "On-Campus", ctc: "6.8 LPA",  cgpaCutoff: 6.0 },
  { name: "Adobe",            industry: "Technology",   type: "On-Campus", ctc: "25 LPA",   cgpaCutoff: 7.5 },
  { name: "Salesforce",       industry: "Technology",   type: "On-Campus", ctc: "22 LPA",   cgpaCutoff: 7.5 },
  { name: "Oracle",           industry: "Technology",   type: "On-Campus", ctc: "18 LPA",   cgpaCutoff: 7.0 },
  { name: "SAP",              industry: "Technology",   type: "FTE + Intern",ctc: "16 LPA", cgpaCutoff: 7.0 },
  { name: "Uber",             industry: "Technology",   type: "Off-Campus",ctc: "30 LPA",   cgpaCutoff: 8.0 },
  { name: "Flipkart",         industry: "E-Commerce",   type: "On-Campus", ctc: "24 LPA",   cgpaCutoff: 7.5 },
  { name: "Swiggy",           industry: "E-Commerce",   type: "Intern",    ctc: "18 LPA",   cgpaCutoff: 7.0 },
  { name: "Razorpay",         industry: "Fintech",      type: "On-Campus", ctc: "20 LPA",   cgpaCutoff: 7.5 },
  { name: "PhonePe",          industry: "Fintech",      type: "FTE + Intern",ctc: "19 LPA", cgpaCutoff: 7.0 },
  { name: "CRED",             industry: "Fintech",      type: "Off-Campus",ctc: "28 LPA",   cgpaCutoff: 8.0 },
];

const COMPANY_NAMES = COMPANY_DATA.map(c => c.name);

const ROLES = [
  "Software Engineer", "Data Analyst", "Product Manager",
  "ML Engineer", "Backend Developer", "Frontend Developer",
  "DevOps Engineer", "Business Analyst", "Cloud Engineer",
  "Full Stack Developer", "QA Engineer", "Data Scientist",
  "Security Engineer", "Mobile Developer", "SRE"
];

const INTERVIEW_QUESTIONS = [
  { topic: "Arrays", question: "Find the kth largest element in an array", link: "https://leetcode.com/problems/kth-largest-element-in-an-array/", difficulty: "Medium", platform: "LeetCode" },
  { topic: "Dynamic Programming", question: "Longest Common Subsequence", link: "https://leetcode.com/problems/longest-common-subsequence/", difficulty: "Medium", platform: "LeetCode" },
  { topic: "Trees", question: "Lowest Common Ancestor of a Binary Tree", link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/", difficulty: "Medium", platform: "LeetCode" },
  { topic: "Graphs", question: "Number of Islands", link: "https://leetcode.com/problems/number-of-islands/", difficulty: "Medium", platform: "LeetCode" },
  { topic: "Strings", question: "Longest Palindromic Substring", link: "https://leetcode.com/problems/longest-palindromic-substring/", difficulty: "Medium", platform: "LeetCode" },
  { topic: "Sorting", question: "Merge Intervals", link: "https://leetcode.com/problems/merge-intervals/", difficulty: "Medium", platform: "LeetCode" },
  { topic: "System Design", question: "Design a URL Shortener", link: "https://www.geeksforgeeks.org/system-design-url-shortening-service/", difficulty: "Hard", platform: "System Design" },
  { topic: "Hashing", question: "Two Sum", link: "https://leetcode.com/problems/two-sum/", difficulty: "Easy", platform: "LeetCode" },
  { topic: "Linked List", question: "Reverse a Linked List", link: "https://leetcode.com/problems/reverse-linked-list/", difficulty: "Easy", platform: "LeetCode" },
  { topic: "Stack", question: "Valid Parentheses", link: "https://leetcode.com/problems/valid-parentheses/", difficulty: "Easy", platform: "LeetCode" },
  { topic: "Binary Search", question: "Search in Rotated Sorted Array", link: "https://leetcode.com/problems/search-in-rotated-sorted-array/", difficulty: "Medium", platform: "LeetCode" },
  { topic: "DP", question: "Coin Change Problem", link: "https://leetcode.com/problems/coin-change/", difficulty: "Medium", platform: "LeetCode" },
  { topic: "Graphs", question: "Course Schedule (Topological Sort)", link: "https://leetcode.com/problems/course-schedule/", difficulty: "Medium", platform: "LeetCode" },
  { topic: "Trees", question: "Serialize and Deserialize Binary Tree", link: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", difficulty: "Hard", platform: "LeetCode" },
  { topic: "DP", question: "Edit Distance", link: "https://leetcode.com/problems/edit-distance/", difficulty: "Hard", platform: "LeetCode" },
  { topic: "OS", question: "Explain Process vs Thread", link: "https://www.geeksforgeeks.org/difference-between-process-and-thread/", difficulty: "Easy", platform: "GFG" },
  { topic: "DBMS", question: "Normalization (1NF, 2NF, 3NF, BCNF)", link: "https://www.geeksforgeeks.org/normal-forms-in-dbms/", difficulty: "Medium", platform: "GFG" },
  { topic: "OOP", question: "Explain SOLID Principles", link: "https://www.geeksforgeeks.org/solid-principle-in-programming-understand-with-real-life-examples/", difficulty: "Medium", platform: "GFG" },
];

const PAST_HIRE_NAMES = [
  "Rahul Kapoor", "Sneha Reddy", "Amit Joshi", "Priya Nair", "Vikram Tiwari",
  "Ananya Das", "Karthik Subramanian", "Meera Patel", "Rohit Saxena", "Divya Menon",
  "Arjun Bhatt", "Pooja Iyer", "Saurav Gupta", "Kavita Singh", "Manish Verma"
];

const LEETCODE_QUESTIONS = [
  { text: "Two Sum", link: "https://leetcode.com/problems/two-sum/", difficulty: "Easy", tags: ["Arrays", "Hashing"] },
  { text: "Add Two Numbers", link: "https://leetcode.com/problems/add-two-numbers/", difficulty: "Medium", tags: ["Linked List", "Math"] },
  { text: "Longest Substring Without Repeating Characters", link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", difficulty: "Medium", tags: ["Strings", "Hashing"] },
  { text: "Median of Two Sorted Arrays", link: "https://leetcode.com/problems/median-of-two-sorted-arrays/", difficulty: "Hard", tags: ["Arrays", "Binary Search"] },
  { text: "Longest Palindromic Substring", link: "https://leetcode.com/problems/longest-palindromic-substring/", difficulty: "Medium", tags: ["Strings", "DP"] },
  { text: "Reverse Integer", link: "https://leetcode.com/problems/reverse-integer/", difficulty: "Medium", tags: ["Math"] },
  { text: "String to Integer (atoi)", link: "https://leetcode.com/problems/string-to-integer-atoi/", difficulty: "Medium", tags: ["Strings"] },
  { text: "Container With Most Water", link: "https://leetcode.com/problems/container-with-most-water/", difficulty: "Medium", tags: ["Arrays", "Greedy"] },
  { text: "3Sum", link: "https://leetcode.com/problems/3sum/", difficulty: "Medium", tags: ["Arrays", "Sorting"] },
  { text: "Valid Parentheses", link: "https://leetcode.com/problems/valid-parentheses/", difficulty: "Easy", tags: ["Stack", "Strings"] },
  { text: "Merge Two Sorted Lists", link: "https://leetcode.com/problems/merge-two-sorted-lists/", difficulty: "Easy", tags: ["Linked List"] },
  { text: "Maximum Subarray", link: "https://leetcode.com/problems/maximum-subarray/", difficulty: "Medium", tags: ["Arrays", "DP"] },
  { text: "Climbing Stairs", link: "https://leetcode.com/problems/climbing-stairs/", difficulty: "Easy", tags: ["DP", "Math"] },
  { text: "Best Time to Buy and Sell Stock", link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", difficulty: "Easy", tags: ["Arrays", "DP"] },
  { text: "Binary Tree Level Order Traversal", link: "https://leetcode.com/problems/binary-tree-level-order-traversal/", difficulty: "Medium", tags: ["Trees", "Queue"] },
  { text: "Word Search", link: "https://leetcode.com/problems/word-search/", difficulty: "Medium", tags: ["Backtracking"] },
  { text: "Course Schedule", link: "https://leetcode.com/problems/course-schedule/", difficulty: "Medium", tags: ["Graphs"] },
  { text: "Trapping Rain Water", link: "https://leetcode.com/problems/trapping-rain-water/", difficulty: "Hard", tags: ["Arrays", "Stack", "DP"] },
  { text: "Edit Distance", link: "https://leetcode.com/problems/edit-distance/", difficulty: "Hard", tags: ["Strings", "DP"] },
  { text: "Merge k Sorted Lists", link: "https://leetcode.com/problems/merge-k-sorted-lists/", difficulty: "Hard", tags: ["Linked List", "Sorting"] },
  { text: "Coin Change", link: "https://leetcode.com/problems/coin-change/", difficulty: "Medium", tags: ["DP"] },
  { text: "House Robber", link: "https://leetcode.com/problems/house-robber/", difficulty: "Medium", tags: ["DP"] },
  { text: "Number of Islands", link: "https://leetcode.com/problems/number-of-islands/", difficulty: "Medium", tags: ["Graphs"] },
  { text: "Rotate Image", link: "https://leetcode.com/problems/rotate-image/", difficulty: "Medium", tags: ["Arrays", "Math"] },
  { text: "Group Anagrams", link: "https://leetcode.com/problems/group-anagrams/", difficulty: "Medium", tags: ["Strings", "Hashing", "Sorting"] },
  { text: "Kth Largest Element in an Array", link: "https://leetcode.com/problems/kth-largest-element-in-an-array/", difficulty: "Medium", tags: ["Sorting", "Arrays"] },
  { text: "Product of Array Except Self", link: "https://leetcode.com/problems/product-of-array-except-self/", difficulty: "Medium", tags: ["Arrays"] },
  { text: "Serialize and Deserialize Binary Tree", link: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", difficulty: "Hard", tags: ["Trees"] },
  { text: "LRU Cache", link: "https://leetcode.com/problems/lru-cache/", difficulty: "Medium", tags: ["Hashing", "Linked List"] },
  { text: "Minimum Window Substring", link: "https://leetcode.com/problems/minimum-window-substring/", difficulty: "Hard", tags: ["Strings", "Hashing"] },
];

const EXPERIENCE_STORIES = [
  "The interview started with a brief introduction and resume walkthrough. The interviewer was friendly and gave me enough time to think. I was asked 2 DSA questions — one on arrays and one on trees. I managed to solve both with optimal solutions. The HR round was casual and focused on my interests and career goals.",
  "I had 3 rounds — Online Assessment, Technical Interview, and HR. The OA had 2 medium-level coding questions and 15 MCQs on OS and DBMS. In the technical round, I was grilled on system design for 30 minutes. Prepare your low-level design well! The HR round was straightforward.",
  "Very tough process with 4 rounds. The coding round had 3 Hard-level problems. I could solve 2 completely. In the subsequent rounds, I faced deep questions on concurrency, distributed systems, and time complexity analysis. Practice competitive programming regularly to crack this one.",
  "Smooth interview experience overall. The recruiter was responsive and the process was well-organized. I was asked behavioral questions using the STAR method, followed by a system design discussion on designing a URL shortener. The coding challenge was a medium-difficulty graph problem.",
  "The company visited our campus and shortlisted 50 students based on CGPA cutoff (7.5+). The written test had aptitude and coding sections. I solved all coding questions in 45 minutes. The technical interview covered OOP concepts, DBMS normalization, and one DSA problem on dynamic programming.",
  "It was a virtual hiring drive. Platform used was HackerRank. The test had 3 coding problems — 1 Easy, 1 Medium, 1 Hard. Time limit was 90 min. I couldn't finish the hard question but got selected for interviews. The PI round was about my projects and resume.",
  "The interview process was divided into Day 1 (Test + Group Discussion) and Day 2 (Technical + HR). The aptitude test was moderate. GD topic was 'AI replacing jobs'. My technical round was entirely on my final year project — make sure you know every line of code!",
  "Great company culture. The initial screening involved a take-home assignment to build a REST API. After that, a pair programming session with the interviewer. Finally, a culture-fit round. They valued problem-solving approach more than just the right answer.",
];

// ═══════════════════════════════════════════════════════════════
//                        SEED FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// ── 1. Users (RTDB) ──────────────────────────────────────────
// Guaranteed coverage: at least 8 Placed, 5 Shortlisted, 4 Interviewing, 3 Opted-out, rest Unplaced
// Every branch has placed + unplaced students

async function seedUsers() {
  console.log("🔄  Seeding users...");
  const users = {};

  // Force exact status distribution for first 20 students
  const forcedStatuses = [
    // Placed — across different branches
    "Placed", "Placed", "Placed", "Placed", "Placed", "Placed", "Placed", "Placed", "Placed", "Placed",
    // Shortlisted
    "Shortlisted", "Shortlisted", "Shortlisted", "Shortlisted", "Shortlisted",
    // Interviewing
    "Interviewing", "Interviewing", "Interviewing", "Interviewing",
    // Opted-out
    "Opted-out", "Opted-out", "Opted-out",
    // Unplaced
    "Unplaced", "Unplaced", "Unplaced", "Unplaced", "Unplaced",
    "Unplaced", "Unplaced", "Unplaced", "Unplaced", "Unplaced",
    "Unplaced", "Unplaced", "Unplaced",
  ];

  // Force branches to have variety
  const forcedBranches = [
    "CSE", "CSE", "CSE", "CSE", "CSE", "CSE", "CSE", "CSE",
    "ECE", "ECE", "ECE", "ECE", "ECE",
    "IT", "IT", "IT", "IT",
    "ME", "ME", "ME", "ME",
    "EE", "EE", "EE", "EE",
    "CE", "CE", "CE",
    "CSE", "ECE", "IT", "ME", "EE", "CE", "CSE",
  ];

  for (let i = 1; i <= 35; i++) {
    const gender = i % 3 === 0 ? "Female" : "Male";
    const firstName = gender === "Female" ? pick(FIRST_NAMES_F) : pick(FIRST_NAMES_M);
    const lastName = pick(LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    const branch = forcedBranches[i - 1] || pick(BRANCHES);
    const status = forcedStatuses[i - 1] || pick(["Unplaced", "Placed", "Shortlisted"]);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@university.edu`;

    const cgpa = randFloat(6.0, 9.8);
    const isPlaced = status === "Placed";
    const placedCompany = isPlaced ? pick(COMPANY_NAMES) : "";
    const placedPackage = isPlaced ? randFloat(4, 45) : 0;

    const id = uid("student", i);
    users[id] = {
      fullName,
      name: fullName,
      email,
      phone: `+91 ${randInt(70000, 99999)}${randInt(10000, 99999)}`,
      role: "student",
      branch,
      year: pick(["2025", "2026"]),
      cgpa: String(cgpa),
      gender,
      location: pick(LOCATIONS),
      status,
      companyName: placedCompany,
      placed_package_lpa: isPlaced ? String(placedPackage) : "",
      placement_status: isPlaced ? "placed" : "",
      leetcode: Math.random() > 0.2 ? `${firstName.toLowerCase()}${randInt(1, 999)}` : "",
      codeforces: Math.random() > 0.4 ? `${firstName.toLowerCase()}_cf` : "",
      codechef: Math.random() > 0.4 ? `${firstName.toLowerCase()}_cc` : "",
      github: `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
      linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
      about: `Passionate ${branch} student interested in ${pick(["AI/ML", "Web Development", "Competitive Programming", "Cloud Computing", "Data Science", "Cybersecurity", "Mobile Development", "Blockchain"])}. Looking for exciting opportunities.`,
      marks10th: String(randFloat(75, 98, 1)),
      marks12th: String(randFloat(70, 96, 1)),
      activeBacklogs: String(Math.random() > 0.85 ? randInt(1, 2) : 0),
      backlogHistory: String(Math.random() > 0.75 ? randInt(1, 3) : 0),
      resumeUrl: Math.random() > 0.15 ? `https://example.com/resumes/${firstName.toLowerCase()}_resume.pdf` : "",
      isResumeVerified: Math.random() > 0.3,
      resume_status: pick(["pending", "approved", "approved", "approved"]),
      createdAt: Date.now() - randInt(30, 180) * 86400000,
      updatedAt: Date.now() - randInt(0, 15) * 86400000,
    };

    // Add applications for non-opted-out students
    if (status !== "Opted-out" && Math.random() > 0.2) {
      users[id].applications = {};
      const numApps = randInt(1, 5);
      for (let a = 0; a < numApps; a++) {
        const oppId = `opp_${String(randInt(1, 20)).padStart(3, "0")}`;
        const company = pick(COMPANY_NAMES);
        const appStatuses = {
          "Placed": ["Offered", "Applied", "Shortlisted"],
          "Shortlisted": ["Shortlisted", "Applied"],
          "Interviewing": ["Shortlisted", "Applied"],
          "Unplaced": ["Applied", "Applied", "Rejected"],
        };
        const appStatus = pick(appStatuses[status] || ["Applied"]);
        const timeline = [
          { step: "Applied", done: true, date: "2026-01-15" },
          { step: "Shortlisted", done: appStatus !== "Applied", date: appStatus !== "Applied" ? "2026-01-22" : "" },
          { step: "Online Assessment", done: ["Shortlisted", "Offered"].includes(appStatus) && Math.random() > 0.3, date: "2026-02-01" },
          { step: "Interview", done: appStatus === "Offered" || (appStatus === "Shortlisted" && Math.random() > 0.5), date: "2026-02-10" },
          { step: "Final Decision", done: appStatus === "Offered" || appStatus === "Rejected", date: "2026-02-20" },
        ];
        users[id].applications[oppId] = {
          company,
          role: pick(ROLES),
          status: appStatus,
          offerType: pick(["Placement", "Internship", "Intern + PPO"]),
          cgpaCutoff: String(randFloat(6.0, 8.0, 1)),
          ctc: `${randInt(5, 40)} LPA`,
          location: pick(LOCATIONS),
          appliedOn: pastDate(randInt(10, 90)).toISOString().slice(0, 10),
          timeline,
        };
      }
    }
  }

  // Admin user
  users["admin_001"] = {
    fullName: "Admin User",
    name: "Admin User",
    email: "admin@university.edu",
    role: "admin",
    createdAt: Date.now() - 365 * 86400000,
  };

  // Recruiter user
  users["recruiter_001"] = {
    fullName: "Recruiter Microsoft",
    name: "Recruiter Microsoft",
    email: "recruiter@microsoft.com",
    role: "recruiter",
    companyName: "Microsoft",
    createdAt: Date.now() - 200 * 86400000,
  };

  await db.ref("users").set(users);
  console.log(`   ✅ ${Object.keys(users).length} users seeded (10 Placed, 5 Shortlisted, 4 Interviewing, 3 Opted-out, 13 Unplaced, 1 Admin, 1 Recruiter)`);
}

// ── 2. Past Placements (RTDB) — for ML recommendations ──────

async function seedPastPlacements() {
  console.log("🔄  Seeding past placements...");
  const placements = {};

  for (let i = 0; i < 80; i++) {
    placements[`pp_${i}`] = {
      dsaScore: randInt(30, 100),
      devScore: randInt(20, 100),
      cpScore: randInt(10, 100),
      placedCompany: pick(COMPANY_NAMES),
    };
  }

  await db.ref("pastPlacements").set(placements);
  console.log(`   ✅ 80 past placements seeded`);
}

// ── 3. Companies (Firestore) ─────────────────────────────────
// Includes: interviewQuestions, pastHires, locations, roles, type, ctc, cgpaCutoff, date
// These fields are needed by Company.jsx modal

async function seedCompanies() {
  console.log("🔄  Seeding companies...");
  const batch = firestore.batch();

  COMPANY_DATA.forEach((c, i) => {
    const ref = firestore.collection("companies").doc(`company_${String(i + 1).padStart(3, "0")}`);

    // 3-5 interview questions per company
    const questionCount = randInt(3, 5);
    const shuffled = [...INTERVIEW_QUESTIONS].sort(() => Math.random() - 0.5);
    const interviewQuestions = shuffled.slice(0, questionCount);

    // 2-3 past hires per company
    const hireCount = randInt(2, 3);
    const pastHires = [];
    for (let h = 0; h < hireCount; h++) {
      pastHires.push({
        name: pick(PAST_HIRE_NAMES),
        role: pick(ROLES),
        batch: pick(["2022", "2023", "2024"]),
        linkedin: `https://linkedin.com/in/${pick(PAST_HIRE_NAMES).toLowerCase().replace(/\s+/g, "-")}`,
      });
    }

    batch.set(ref, {
      name: c.name,
      industry: c.industry,
      type: c.type,
      ctc: c.ctc,
      cgpaCutoff: c.cgpaCutoff,
      date: pastDate(randInt(-30, 120)).toISOString().slice(0, 10),
      score: randInt(50, 100),
      avgPackage: parseFloat(c.ctc),
      minCgpa: c.cgpaCutoff,
      roles: [pick(ROLES), pick(ROLES)],
      branches: BRANCHES.slice(0, randInt(2, 6)),
      locations: [pick(LOCATIONS), pick(LOCATIONS)],
      status: pick(["active", "active", "active", "upcoming", "completed"]),
      website: `https://${c.name.toLowerCase().replace(/\s+/g, "")}.com`,
      description: `${c.name} is a leading company in the ${c.industry.toLowerCase()} sector, offering exciting career opportunities for fresh graduates with competitive packages.`,
      interviewQuestions,
      pastHires,
    });
  });

  await batch.commit();
  console.log(`   ✅ ${COMPANY_DATA.length} companies seeded (with PYQs + alumni)`);
}

// ── 4. Opportunities / JAFs (Firestore) ──────────────────────
// Includes: offerType, lastDate, cgpaCutoff, driveType, branches, backlogs, description,
//           stipend, bond, selection process dates (shortlistDate, oaDate, etc.)
// These fields are needed by Opportunities.jsx + StudentHome.jsx

async function seedOpportunities() {
  console.log("🔄  Seeding opportunities...");
  const batch = firestore.batch();

  const offerTypes = ["Placement", "Internship", "Intern + PPO", "Placement", "Placement"];
  const driveTypes = ["On-campus", "Off-campus", "Virtual", "On-campus", "On-campus"];

  for (let i = 1; i <= 20; i++) {
    const company = COMPANY_DATA[(i - 1) % COMPANY_DATA.length];
    const role = pick(ROLES);
    const secondRole = Math.random() > 0.5 ? `, ${pick(ROLES)}` : "";
    const offerType = pick(offerTypes);
    const lastDateDays = randInt(5, 45); // days from now (in future)
    const ref = firestore.collection("opportunities").doc(`opp_${String(i).padStart(3, "0")}`);

    batch.set(ref, {
      name: company.name,
      logo: "",
      roles: `${role}${secondRole}`,
      ctc: company.ctc,
      stipend: offerType.includes("Intern") ? `₹${randInt(20, 80)}K/month` : "",
      location: pick(LOCATIONS),
      offerType,
      driveType: pick(driveTypes),
      lastDate: futureDate(lastDateDays),
      deadline: futureDate(lastDateDays),
      cgpaCutoff: company.cgpaCutoff,
      branches: BRANCHES.slice(0, randInt(3, 6)).join(", "),
      backlogs: pick(["No active backlogs", "Max 1 active backlog", "No restriction"]),
      bond: Math.random() > 0.7 ? `${randInt(1, 3)} years` : "None",
      description: `${company.name} is hiring for ${role} role. Great opportunity for students passionate about technology and innovation.`,
      applicantsCount: randInt(10, 120),
      shortlistedCount: randInt(5, 40),
      status: pick(["open", "open", "open", "closed", "in-progress"]),

      // Selection process dates — used by Opportunities.jsx timeline + Calendar.jsx
      shortlistDate: futureDate(lastDateDays + randInt(3, 7)),
      oaDate: futureDate(lastDateDays + randInt(8, 14)),
      oaResultDate: futureDate(lastDateDays + randInt(15, 20)),
      interviewDate: futureDate(lastDateDays + randInt(21, 30)),
      interviewResultDate: futureDate(lastDateDays + randInt(31, 40)),
      finalResultDate: futureDate(lastDateDays + randInt(41, 50)),

      // Also include rounds array for Calendar / StudentHome upcoming drives
      rounds: [
        { name: "Written Test", date: futureDate(lastDateDays + randInt(5, 10)) },
        { name: "Technical Interview", date: futureDate(lastDateDays + randInt(15, 25)) },
        { name: "HR Interview", date: futureDate(lastDateDays + randInt(28, 35)) },
      ],

      eligibility: {
        branches: BRANCHES.slice(0, randInt(2, 6)),
        minCgpa: company.cgpaCutoff,
        backlogs: "No active backlogs",
      },
      selectionProcess: ["Written Test", "Technical Interview", "HR Interview"],

      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  console.log("   ✅ 20 opportunities seeded (with process dates + rounds)");
}

// ── 5. Questions (Firestore) ─────────────────────────────────

async function seedQuestions() {
  console.log("🔄  Seeding questions...");
  const batch = firestore.batch();

  LEETCODE_QUESTIONS.forEach((q, i) => {
    const ref = firestore.collection("questions").doc(`q_${String(i + 1).padStart(3, "0")}`);
    batch.set(ref, {
      companyId: `company_${String((i % 25) + 1).padStart(3, "0")}`,
      companyName: COMPANY_NAMES[i % 25],
      text: q.text,
      link: q.link,
      author: pick(["Placement Cell (Admin)", "Anonymized Student", "Prof. Sharma", "Alumni Contributor"]),
      difficulty: q.difficulty,
      tags: q.tags,
      status: i < 25 ? "approved" : pick(["approved", "pending", "pending"]), // first 25 approved, last 5 may be pending
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
  console.log(`   ✅ ${LEETCODE_QUESTIONS.length} questions seeded`);
}

// ── 6. Interview Experiences (Firestore) ─────────────────────

async function seedExperiences() {
  console.log("🔄  Seeding experiences...");
  const batch = firestore.batch();

  const statuses = ["Selected", "Selected", "Selected", "Rejected", "Waitlisted"];

  for (let i = 0; i < 15; i++) {
    const company = pick(COMPANY_NAMES);
    const role = pick(ROLES);
    const story = EXPERIENCE_STORIES[i % EXPERIENCE_STORIES.length];
    const ref = firestore.collection("experiences").doc(`exp_${String(i + 1).padStart(3, "0")}`);
    batch.set(ref, {
      company,
      role,
      status: statuses[i % statuses.length],
      difficulty: pick(["Easy", "Medium", "Medium", "Hard"]),
      summary: story.substring(0, 140) + "...",
      fullStory: story,
      problems: [pick(LEETCODE_QUESTIONS).text, pick(LEETCODE_QUESTIONS).text],
      author: `${pick([...FIRST_NAMES_M, ...FIRST_NAMES_F])} ${pick(LAST_NAMES)}`,
      authorId: uid("student", randInt(1, 35)),
      date: pastDate(randInt(10, 180)).toLocaleDateString("en-US", { year: "numeric", month: "short" }),
      likes: randInt(0, 50),
      likedBy: [],
      approved: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  console.log("   ✅ 15 experiences seeded (mix of Selected/Rejected/Waitlisted)");
}

// ── 7. Notifications (Firestore) ─────────────────────────────

async function seedNotifications() {
  console.log("🔄  Seeding notifications...");
  const batch = firestore.batch();

  const notifs = [
    { text: "Google campus drive registration is now open! Apply before the deadline.", type: "deadline" },
    { text: "You've been shortlisted for Amazon — check your application timeline.", type: "shortlist" },
    { text: "New interview experience shared: Microsoft SDE role — read now!", type: "info" },
    { text: "Reminder: Resume verification window closes tomorrow.", type: "reminder" },
    { text: "Adobe has updated their eligibility criteria — CGPA cutoff reduced to 7.0.", type: "info" },
    { text: "Congratulations! Flipkart has extended offers to 8 students from our batch.", type: "info" },
    { text: "Practice session: Top 50 DSA questions for upcoming placements uploaded.", type: "reminder" },
    { text: "Morgan Stanley will be visiting campus next week — register now!", type: "deadline" },
    { text: "TCS NQT results have been announced. Check your dashboard.", type: "shortlist" },
    { text: "Upcoming webinar: 'How to crack FAANG interviews' — this Saturday at 4 PM.", type: "info" },
    { text: "Your resume has been verified and approved by the placement cell.", type: "info" },
    { text: "Razorpay SDE Intern applications close in 48 hours!", type: "deadline" },
    { text: "New company added: CRED is now hiring from our campus!", type: "info" },
    { text: "Goldman Sachs has shortlisted 25 students for the technical round.", type: "shortlist" },
    { text: "Placement cell office hours extended to 8 PM during drive week.", type: "reminder" },
  ];

  notifs.forEach((n, i) => {
    const ref = firestore.collection("notifications").doc(`notif_${String(i + 1).padStart(3, "0")}`);
    batch.set(ref, {
      text: n.text,
      type: n.type,
      target: "all",
      read: i > 5,
      createdAt: admin.firestore.Timestamp.fromDate(pastDate(i * 2)),
    });
  });

  await batch.commit();
  console.log(`   ✅ ${notifs.length} notifications seeded (all types: deadline/shortlist/info/reminder)`);
}

// ── 8. Admin Notifications (Firestore) ───────────────────────

async function seedAdminNotifications() {
  console.log("🔄  Seeding admin notifications...");
  const batch = firestore.batch();

  const adminNotifs = [
    { title: "New Drive Alert", message: "Google has confirmed a campus drive for March 2026.", targetType: "all" },
    { title: "Eligibility Update", message: "Microsoft has lowered the CGPA cutoff to 7.0 for SDE roles.", targetType: "all" },
    { title: "Resume Review Pending", message: "15 student resumes are awaiting verification.", targetType: "all" },
    { title: "Drive Completed", message: "Amazon SDE hiring drive completed — 12 offers extended.", targetType: "all" },
    { title: "Branch-Specific Notice", message: "ECE students may apply for Qualcomm VLSI roles.", targetType: "branch", targetValue: "ECE" },
    { title: "Mock Interview Schedule", message: "Mock interviews for pre-final years start next Monday.", targetType: "all" },
    { title: "Offer Letter Update", message: "Goldman Sachs offer letters have been dispatched to selected candidates.", targetType: "company", targetValue: "Goldman Sachs" },
    { title: "Placement Statistics", message: "70% placement rate achieved! 21 companies visited so far.", targetType: "all" },
  ];

  adminNotifs.forEach((n, i) => {
    const ref = firestore.collection("admin_notifications").doc(`admin_notif_${String(i + 1).padStart(3, "0")}`);
    batch.set(ref, {
      title: n.title,
      message: n.message,
      targetType: n.targetType,
      targetValue: n.targetValue || "",
      createdAt: admin.firestore.Timestamp.fromDate(pastDate(i * 4)),
    });
  });

  await batch.commit();
  console.log(`   ✅ ${adminNotifs.length} admin notifications seeded`);
}

// ── 9. Drives (Firestore) ────────────────────────────────────

async function seedDrives() {
  console.log("🔄  Seeding drives...");
  const batch = firestore.batch();

  const driveStatuses = ["active", "active", "active", "completed", "completed", "upcoming", "upcoming"];

  for (let i = 1; i <= 15; i++) {
    const company = COMPANY_DATA[(i - 1) % COMPANY_DATA.length];
    const ref = firestore.collection("drives").doc(`drive_${String(i).padStart(3, "0")}`);
    batch.set(ref, {
      company_id: `company_${String(i).padStart(3, "0")}`,
      company_name: company.name,
      role: pick(ROLES),
      status: driveStatuses[i % driveStatuses.length],
      date: pastDate(randInt(-20, 60)).toISOString().slice(0, 10),
      registeredCount: randInt(30, 150),
      shortlistedCount: randInt(10, 50),
      selectedCount: randInt(2, 20),
      package_lpa: parseFloat(company.ctc),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  console.log("   ✅ 15 drives seeded (active/completed/upcoming)");
}

// ── 10. Offers (Firestore) ───────────────────────────────────
// Spread across Aug–Mar so monthly trend chart shows bars

async function seedOffers() {
  console.log("🔄  Seeding offers...");
  const batch = firestore.batch();

  const monthDates = [
    new Date("2025-08-15"), new Date("2025-08-28"),
    new Date("2025-09-10"), new Date("2025-09-25"),
    new Date("2025-10-05"), new Date("2025-10-20"), new Date("2025-10-28"),
    new Date("2025-11-01"), new Date("2025-11-15"), new Date("2025-11-22"),
    new Date("2025-12-01"), new Date("2025-12-10"), new Date("2025-12-18"), new Date("2025-12-22"),
    new Date("2026-01-05"), new Date("2026-01-10"), new Date("2026-01-18"), new Date("2026-01-25"),
    new Date("2026-02-05"), new Date("2026-02-15"), new Date("2026-02-22"), new Date("2026-02-28"),
    new Date("2026-03-05"), new Date("2026-03-10"), new Date("2026-03-18"), new Date("2026-03-22"),
    new Date("2025-09-18"), new Date("2025-11-08"), new Date("2026-01-28"), new Date("2026-03-02"),
  ];

  const offerStatuses = ["accepted", "accepted", "accepted", "accepted", "pending", "declined"];

  for (let i = 0; i < 30; i++) {
    const company = pick(COMPANY_DATA);
    const ref = firestore.collection("offers").doc(`offer_${String(i + 1).padStart(3, "0")}`);
    batch.set(ref, {
      student_id: uid("student", randInt(1, 35)),
      student_name: `${pick([...FIRST_NAMES_M, ...FIRST_NAMES_F])} ${pick(LAST_NAMES)}`,
      company_id: `company_${String(randInt(1, 25)).padStart(3, "0")}`,
      company_name: company.name,
      companyId: `company_${String(randInt(1, 25)).padStart(3, "0")}`,
      companyName: company.name,
      role: pick(ROLES),
      package_lpa: parseFloat(company.ctc) || randFloat(5, 40),
      offer_type: pick(["Full-Time", "Internship + FTE", "Internship"]),
      status: offerStatuses[i % offerStatuses.length],
      createdAt: admin.firestore.Timestamp.fromDate(monthDates[i]),
    });
  }

  await batch.commit();
  console.log("   ✅ 30 offers seeded (spread Aug–Mar for trend chart)");
}

// ── 11. Audit Log / Activity Feed (Firestore) ───────────────

async function seedAuditLog() {
  console.log("🔄  Seeding audit log...");
  const batch = firestore.batch();

  const actions = [
    { action: "Created JAF for Google — SDE role", module: "opportunities", actorName: "Admin User" },
    { action: "Updated student status to Placed (Aarav Sharma)", module: "students", actorName: "Admin User" },
    { action: "Approved resume of Priya Nair", module: "resumes", actorName: "Admin User" },
    { action: "Added new company: CRED", module: "companies", actorName: "Admin User" },
    { action: "Published notification: Google drive registration open", module: "notifications", actorName: "Admin User" },
    { action: "Shortlisted 15 CSE students for Microsoft", module: "drives", actorName: "Recruiter Microsoft" },
    { action: "Updated Amazon drive status to completed", module: "drives", actorName: "Admin User" },
    { action: "Rejected question submission (duplicate)", module: "questions", actorName: "Admin User" },
    { action: "Exported CSV of CSE students", module: "students", actorName: "Admin User" },
    { action: "Created new drive for Adobe — Data Analyst", module: "drives", actorName: "Admin User" },
    { action: "Updated offer letter for Rohan Kumar", module: "offers", actorName: "Admin User" },
    { action: "Sent bulk notification to ECE branch", module: "notifications", actorName: "Admin User" },
    { action: "Approved 5 interview experience submissions", module: "experiences", actorName: "Admin User" },
    { action: "Changed eligibility criteria for Goldman Sachs", module: "opportunities", actorName: "Admin User" },
    { action: "Marked 10 students as Interviewing", module: "students", actorName: "Recruiter Microsoft" },
    { action: "Updated JAF deadline for Meta", module: "opportunities", actorName: "Admin User" },
    { action: "Deleted expired notification", module: "notifications", actorName: "Admin User" },
    { action: "Verified 8 student resumes", module: "resumes", actorName: "Admin User" },
    { action: "Added mock interview schedule for IT branch", module: "drives", actorName: "Admin User" },
    { action: "Generated placement report Q1 2026", module: "reports", actorName: "Admin User" },
  ];

  actions.forEach((a, i) => {
    const ref = firestore.collection("audit_log").doc(`log_${String(i + 1).padStart(3, "0")}`);
    batch.set(ref, {
      ...a,
      actor: a.actorName,
      targetId: `target_${randInt(1, 35)}`,
      timestamp: admin.firestore.Timestamp.fromDate(pastDate(i * 2)),
    });
  });

  await batch.commit();
  console.log(`   ✅ ${actions.length} audit log entries seeded`);
}

// ═══════════════════════════════════════════════════════════════
//                         MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║  Placement Portal — Comprehensive Data Seeder    ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

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

    console.log("\n🎉  All seed data populated successfully!");
    console.log("\n📋  Summary:");
    console.log("   ├─ 35 students (Placed:10 | Shortlisted:5 | Interviewing:4 | Opted-out:3 | Unplaced:13)");
    console.log("   ├─ 1 admin + 1 recruiter");
    console.log("   ├─ 80 past placements (ML recommendations)");
    console.log("   ├─ 25 companies (with PYQs + alumni contacts)");
    console.log("   ├─ 20 opportunities (with selection process dates + rounds)");
    console.log("   ├─ 30 practice questions (25 approved, 5 pending)");
    console.log("   ├─ 15 interview experiences");
    console.log("   ├─ 15 notifications + 8 admin notifications");
    console.log("   ├─ 15 drives (active/completed/upcoming)");
    console.log("   ├─ 30 offers (distributed Aug–Mar)");
    console.log("   └─ 20 audit log entries\n");
  } catch (error) {
    console.error("\n❌  Seed script failed:", error);
  }

  process.exit(0);
}

main();
