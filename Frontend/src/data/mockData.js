// src/data/mockData.js

// --- PLACEMENT DATA ---

export const MOCK_COMPANIES = [
  // 1. Google
  { 
    id: 1, 
    name: "Google", 
    type: "On-Campus", 
    year: 2025, 
    roles: ["SDE", "SRE"], 
    cgpaCutoff: 8.5, 
    ctc: "32 LPA", 
    locations: ["Bangalore", "Hyderabad"],
    status: "Upcoming", 
    date: "15th Oct 2025",
    score: 98,
    pastHires: [
      { name: "Aditya Verma", batch: "2024", role: "SDE", linkedin: "#" },
      { name: "Riya Sharma", batch: "2023", role: "SRE", linkedin: "#" }
    ],
    interviewQuestions: [
      { topic: "DP", question: "Maximum Subarray Sum (Kadane's)", platform: "LeetCode", difficulty: "Medium" },
      { topic: "Graphs", question: "Course Schedule II", platform: "LeetCode", difficulty: "Hard" },
      { topic: "Trees", question: "Diameter of Binary Tree", platform: "LeetCode", difficulty: "Medium" }
    ]
  },
  // 2. Microsoft
  { 
    id: 2, 
    name: "Microsoft", 
    type: "On-Campus", 
    year: 2025, 
    roles: ["SDE", "Data Science"], 
    cgpaCutoff: 7.5, 
    ctc: "45 LPA", 
    locations: ["Noida", "Bangalore"],
    status: "Completed",
    date: "10th Aug 2025",
    score: 93,
    pastHires: [
      { name: "Kartik Aryan", batch: "2024", role: "SDE", linkedin: "#" },
      { name: "Anjali Singh", batch: "2024", role: "Data Scientist", linkedin: "#" }
    ],
    interviewQuestions: [
      { topic: "Trees", question: "Lowest Common Ancestor", platform: "LeetCode", difficulty: "Medium" },
      { topic: "OS", question: "Explain Paging and Segmentation", platform: "Theory", difficulty: "Medium" },
      { topic: "System Design", question: "Design a URL Shortener", platform: "System Design", difficulty: "Medium" }
    ]
  },
  // 3. Zomato
  { 
    id: 3, 
    name: "Zomato", 
    type: "Off-Campus", 
    year: 2024, 
    roles: ["Backend Dev", "SDE-1"], 
    cgpaCutoff: 7.0, 
    ctc: "28 LPA", 
    locations: ["Gurgaon"],
    status: "Active Hiring",
    date: "Rolling Basis",
    score: 87,
    pastHires: [
      { name: "Rohan Das", batch: "2023", role: "Backend Eng.", linkedin: "#" }
    ],
    interviewQuestions: [
      { topic: "System Design", question: "Design a Rate Limiter", platform: "System Design", difficulty: "Hard" },
      { topic: "Heaps", question: "Merge K Sorted Lists", platform: "LeetCode", difficulty: "Hard" }
    ]
  },
  // 4. Atlassian
  { 
    id: 4, 
    name: "Atlassian", 
    type: "On-Campus", 
    year: 2025, 
    roles: ["SDE", "QA"], 
    cgpaCutoff: 8.0, 
    ctc: "54 LPA", 
    locations: ["Bangalore"],
    status: "Upcoming",
    date: "20th Oct 2025",
    score: 96,
    pastHires: [
      { name: "Sneha Gupta", batch: "2024", role: "SDE", linkedin: "#" }
    ],
    interviewQuestions: [
      { topic: "Greedy", question: "Jump Game II", platform: "LeetCode", difficulty: "Medium" },
      { topic: "HashMap", question: "Design a Cache (LRU)", platform: "LeetCode", difficulty: "Medium" }
    ]
  },
  // 5. DE Shaw
  { 
    id: 5, 
    name: "DE Shaw", 
    type: "On-Campus", 
    year: 2025, 
    roles: ["QAE", "SDE"], 
    cgpaCutoff: 8.5, 
    ctc: "42 LPA", 
    locations: ["Hyderabad"],
    status: "OA Scheduled",
    date: "12th Nov 2025",
    score: 95,
    pastHires: [],
    interviewQuestions: [
      { topic: "DP", question: "Egg Dropping Puzzle", platform: "GFG", difficulty: "Hard" },
      { topic: "OOPs", question: "Implement Polymorphism in C++", platform: "Theory", difficulty: "Easy" }
    ]
  },
  // 6. Uber
  { 
    id: 6, 
    name: "Uber", 
    type: "FTE", 
    year: 2025,
    roles: ["SDE I"], 
    cgpaCutoff: 8.0, 
    ctc: "38 LPA", 
    locations: ["Bangalore", "Hyderabad"], 
    score: 94,
    status: "Upcoming",
    date: "Dec 2025",
    pastHires: [],
    interviewQuestions: []
  },
  // 7. Media.net
  { 
    id: 7, 
    name: "Media.net", 
    type: "FTE", 
    year: 2025,
    roles: ["SDE", "Web Dev"], 
    cgpaCutoff: 7.5, 
    ctc: "30 LPA", 
    locations: ["Mumbai", "Bangalore"], 
    score: 90,
    status: "Completed",
    date: "Jan 2025",
    pastHires: [],
    interviewQuestions: []
  },
  // 8. Sprinklr
  { 
    id: 8, 
    name: "Sprinklr", 
    type: "Intern", 
    year: 2026,
    roles: ["Product Engineer"], 
    cgpaCutoff: 8.0, 
    ctc: "2 Lakh/mo", 
    locations: ["Gurgaon"], 
    score: 92,
    status: "Active",
    date: "Feb 2026",
    pastHires: [],
    interviewQuestions: []
  },
  // 9. Amazon
  { 
    id: 9, 
    name: "Amazon", 
    type: "FTE + Intern", 
    year: 2025,
    roles: ["SDE", "BIE"], 
    cgpaCutoff: 7.0, 
    ctc: "44 LPA", 
    locations: ["Bangalore", "Hyderabad", "Chennai"], 
    score: 88,
    status: "Completed",
    date: "Aug 2025",
    pastHires: [],
    interviewQuestions: []
  },
  // 10. Goldman Sachs
  { 
    id: 10, 
    name: "Goldman Sachs", 
    type: "FTE", 
    year: 2025,
    roles: ["Analyst"], 
    cgpaCutoff: 7.5, 
    ctc: "28 LPA", 
    locations: ["Bangalore"], 
    score: 89,
    status: "Completed",
    date: "Sep 2025",
    pastHires: [],
    interviewQuestions: []
  }
];

export const MOCK_STUDENTS = [
  { id: 1, name: "Aarav Sharma", cgpa: 9.2, branch: "CSE", year: 2026, status: "Placed" },
  { id: 2, name: "Priya Singh", cgpa: 8.8, branch: "ECE", year: 2026, status: "Shortlisted" },
  { id: 3, name: "Rahul Verma", cgpa: 8.1, branch: "IT", year: 2026, status: "Applied" },
  { id: 4, name: "Ananya Gupta", cgpa: 9.5, branch: "CSE", year: 2026, status: "Placed" },
  { id: 5, name: "Vikram Reddy", cgpa: 7.4, branch: "EEE", year: 2026, status: "Eligible" },
  { id: 6, name: "Sneha Kapoor", cgpa: 8.9, branch: "IT", year: 2026, status: "Interviewing" },
  { id: 7, name: "Rohan Das", cgpa: 6.8, branch: "MECH", year: 2026, status: "Eligible" },
  { id: 8, name: "Ishaan Malhotra", cgpa: 7.9, branch: "ECE", year: 2026, status: "Applied" },
];

export const MOCK_APPLICATIONS = [
  { id: 1, company: "Google", role: "SDE", status: "Interview Scheduled", date: "2026-02-12" },
  { id: 2, company: "Microsoft", role: "Data Science", status: "Shortlisted", date: "2026-02-10" },
  { id: 3, company: "Amazon", role: "SDE Intern", status: "Rejected", date: "2026-01-25" },
  { id: 4, company: "Atlassian", role: "SDE", status: "Applied", date: "2026-02-08" },
  { id: 5, company: "De Shaw", role: "QAE", status: "OA Pending", date: "2026-02-14" },
  { id: 6, company: "Goldman Sachs", role: "Analyst", status: "Rejected", date: "2026-01-15" },
  { id: 7, company: "Zomato", role: "Backend Dev", status: "Applied", date: "2026-02-01" },
  { id: 8, company: "Samsung R&D", role: "Researcher", status: "Offered", date: "2026-01-30" },
  { id: 9, company: "Oracle", role: "App Dev", status: "Shortlisted", date: "2026-02-05" },
  { id: 10, company: "Uber", role: "SDE I", status: "Applied", date: "2026-02-11" },
];

export const MOCK_QUESTIONS = [
  { id: 1, text: "Google: 3 DP questions (Hard). One on Tree DP, one Matrix Chain Multiplication variation.", companyId: 1, author: "Mickey", date: "2 days ago" },
  { id: 2, text: "Microsoft: Asked to design a URL Shortener (System Design) and one Linked List cycle detection.", companyId: 2, author: "Aarav", date: "5 days ago" },
  { id: 3, text: "Amazon: Leadership principles are KEY. Tech round had Sliding Window maximum problem.", companyId: 3, author: "Priya", date: "1 week ago" },
  { id: 4, text: "Atlassian: Low Level Design of a Parking Lot. Also standard Graph BFS question.", companyId: 2, author: "Rahul", date: "1 week ago" },
  { id: 5, text: "Goldman Sachs: Quant section was tough. Probability and PnC questions were tricky.", companyId: 4, author: "Sneha", date: "2 weeks ago" },
  { id: 6, text: "Uber: Pure CP round. 3 questions in 60 mins. Segment Tree required for the last one.", companyId: 4, author: "Mickey", date: "3 weeks ago" },
  { id: 7, text: "Oracle: SQL queries on Joins and Subqueries. Core Java questions on Multithreading.", companyId: 11, author: "Vikram", date: "1 month ago" },
];

export const MOCK_EVENTS = [
  { id: 1, title: "Google OA Round", date: "2026-02-14", type: "OA", company: "Google" },
  { id: 2, title: "Microsoft Interview", date: "2026-02-16", type: "Interview", company: "Microsoft" },
  { id: 3, title: "Resume Freeze", date: "2026-02-15", type: "Deadline", company: "T&P Cell" },
  { id: 4, title: "Atlassian PPT", date: "2026-02-18", type: "PPT", company: "Atlassian" },
  { id: 5, title: "DE Shaw Hackathon", date: "2026-02-20", type: "OA", company: "DE Shaw" },
  { id: 6, title: "Uber Coding Round", date: "2026-02-22", type: "OA", company: "Uber" },
  { id: 7, title: "Zomato Interview", date: "2026-02-24", type: "Interview", company: "Zomato" },
  { id: 8, title: "Salesforce OA", date: "2026-02-25", type: "OA", company: "Salesforce" },
  { id: 9, title: "Placement Orientation", date: "2026-02-28", type: "Event", company: "NIT KKR" },
  { id: 10, title: "Sprinklr Resume Shortlist", date: "2026-03-01", type: "Deadline", company: "Sprinklr" },
];

// --- CODING DASHBOARD DATA ---

export const DASHBOARD_STATS = {
  totalQuestions: 1625,
  activeDays: 432,
  totalContests: 78,
  maxStreak: 305,
  problems: { easy: 507, medium: 983, hard: 135 },
  contestRankings: { codeforces: 1970, leetcode: 2150, codechef: 2045 }
};

export const PLATFORM_DATA = [
  { 
    id: "codeforces", 
    name: "Codeforces", 
    handle: "Mickey_CF", 
    rating: 1970, 
    rank: "Candidate Master", 
    solved: 850, 
    maxRating: 2100, 
    color: "text-purple-600", 
    bg: "bg-purple-50 dark:bg-purple-900/20", 
    isConnected: true 
  },
  { 
    id: "leetcode", 
    name: "LeetCode", 
    handle: "Mickey_LC", 
    rating: 2150, 
    rank: "Guardian", 
    solved: 1200, 
    contests: 45, 
    color: "text-amber-500", 
    bg: "bg-amber-50 dark:bg-amber-900/20", 
    isConnected: true 
  },
  { 
    id: "codechef", 
    name: "CodeChef", 
    handle: "Mickey_CC", 
    rating: 2045, 
    rank: "5 Star", 
    solved: 450, 
    globalRank: 1200, 
    color: "text-orange-700", 
    bg: "bg-orange-50 dark:bg-orange-900/20", 
    isConnected: true 
  },
  { 
    id: "github", 
    name: "GitHub", 
    handle: "Mickey_Git", 
    repos: 45, 
    commits: 1250, 
    stars: 142, 
    prs: 28, 
    color: "text-slate-900 dark:text-white", 
    bg: "bg-slate-50 dark:bg-slate-800", 
    isConnected: true 
  },
];

export const MOCK_EXPERIENCES = [
  {
    id: 1,
    author: "Ankit Mehra",
    batch: "2025",
    company: "Google",
    role: "SDE Intern",
    status: "Selected",
    difficulty: "Hard",
    date: "2 days ago",
    summary: "3 Rounds total. OA had 2 Hard DP problems. Interviews focused on Graphs.",
    fullStory: `**Round 1: Online Assessment (90 mins)**
- Platform: HackerRank
- Q1: Dynamic Programming (Variation of Partition Equal Subset Sum) - Hard
- Q2: Graph (DSU based) - Medium/Hard
- Could solve both, but Q2 required optimization for the last test case.

**Round 2: Technical Interview (45 mins)**
- Interviewer was friendly. Started with introductions.
- Problem: Given a weighted graph, find the shortest path between two nodes but you can skip at most K edges.
- Solution: Dijkstra's Algorithm with state modification (Node, SkippedCount).
- Code: Wrote clean C++ code. Dry ran with a test case.

**Round 3: Googleyness (Behavioral)**
- Standard behavioral questions.
- "Tell me about a time you had a conflict with a teammate."
- "How do you handle tight deadlines?"`,
    likes: 24,
  },
  {
    id: 2,
    author: "Riya Kapoor",
    batch: "2025",
    company: "Microsoft",
    role: "Data Science",
    status: "Rejected",
    difficulty: "Medium",
    date: "1 week ago",
    summary: "Asked standard OS questions and one DSA question on Linked Lists. Messed up SQL.",
    fullStory: `**Round 1: Coding Round**
- 3 Questions: 1 Easy (Strings), 1 Medium (Trees), 1 Hard (Greedy).
- Solved 2/3 completely.

**Round 2: Technical + CS Fundamentals**
- Asked a lot about Operating Systems: Paging, Semaphores, Deadlock conditions.
- DSA Question: Detect cycle in a Linked List (Floyd's Cycle Detection).
- SQL Question: Find the second highest salary. I used 'LIMIT' but they wanted a generic solution using subqueries. I struggled here.`,
    likes: 12,
  },
  {
    id: 3,
    author: "Vikram Singh",
    batch: "2025",
    company: "Amazon",
    role: "SDE",
    status: "Selected",
    difficulty: "Medium",
    date: "2 weeks ago",
    summary: "Focus heavily on Leadership Principles (LPs). Technical round was purely Sliding Window.",
    fullStory: `**Round 1: OA**
- Debugging questions (7) + Coding (2) + Aptitude.
- Coding Q1: Sliding Window Maximum.
- Coding Q2: Priority Queue based problem.

**Round 2: Technical Interview**
- Deep dive into my Resume Projects. Asked why I chose MongoDB over SQL.
- Leadership Principles: "Customer Obsession" and "Bias for Action" were tested.
- Coding: Longest Substring Without Repeating Characters.`,
    likes: 45,
  }
];