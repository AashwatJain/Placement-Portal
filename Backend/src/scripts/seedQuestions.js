// scripts/seedQuestions.js
// ─────────────────────────────────────────────────────────────
// Run: node src/scripts/seedQuestions.js
// Seeds the Firestore `questions` collection with company-wise
// practice questions (with difficulty, tags, and external links).
// ─────────────────────────────────────────────────────────────

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

const firestore = admin.firestore();

// ── First, fetch existing companies so we can use real IDs ──
async function getCompanyMap() {
  const snapshot = await firestore.collection("companies").get();
  const map = {};
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    map[data.name] = doc.id;
  });
  return map;
}

// ── Question Bank ───────────────────────────────────────────
// Each entry: { company, text, link, difficulty, tags }
const QUESTIONS = [
  // ── Google ──
  { company: "Google", text: "Two Sum — Given an array of integers, return indices of the two numbers such that they add up to a specific target.", link: "https://leetcode.com/problems/two-sum/", difficulty: "Easy", tags: ["Arrays", "Hash Map"] },
  { company: "Google", text: "Median of Two Sorted Arrays — Find the median of two sorted arrays of size m and n.", link: "https://leetcode.com/problems/median-of-two-sorted-arrays/", difficulty: "Hard", tags: ["Binary Search", "Divide and Conquer"] },
  { company: "Google", text: "Longest Substring Without Repeating Characters", link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", difficulty: "Medium", tags: ["Sliding Window", "Strings"] },
  { company: "Google", text: "Container With Most Water — Find two lines that form a container that holds the most water.", link: "https://leetcode.com/problems/container-with-most-water/", difficulty: "Medium", tags: ["Two Pointers", "Greedy"] },
  { company: "Google", text: "Word Ladder — Transform one word into another by changing a single letter at each step.", link: "https://leetcode.com/problems/word-ladder/", difficulty: "Hard", tags: ["BFS", "Graphs"] },

  // ── Amazon ──
  { company: "Amazon", text: "Best Time to Buy and Sell Stock — Find the maximum profit from a single buy-sell transaction.", link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", difficulty: "Easy", tags: ["Arrays", "Greedy"] },
  { company: "Amazon", text: "Number of Islands — Count the number of islands (connected 1s) in a 2D grid.", link: "https://leetcode.com/problems/number-of-islands/", difficulty: "Medium", tags: ["DFS", "BFS", "Matrix"] },
  { company: "Amazon", text: "LRU Cache — Design a data structure for Least Recently Used (LRU) cache.", link: "https://leetcode.com/problems/lru-cache/", difficulty: "Medium", tags: ["Design", "Hash Map", "Linked List"] },
  { company: "Amazon", text: "Trapping Rain Water — Compute how much water can be trapped after raining.", link: "https://leetcode.com/problems/trapping-rain-water/", difficulty: "Hard", tags: ["Stack", "Two Pointers", "DP"] },
  { company: "Amazon", text: "Rotting Oranges — Determine the minimum time for all oranges to rot.", link: "https://leetcode.com/problems/rotting-oranges/", difficulty: "Medium", tags: ["BFS", "Matrix"] },

  // ── Microsoft ──
  { company: "Microsoft", text: "Reverse Linked List — Reverse a singly linked list iteratively and recursively.", link: "https://leetcode.com/problems/reverse-linked-list/", difficulty: "Easy", tags: ["Linked List"] },
  { company: "Microsoft", text: "Valid Parentheses — Determine if the input string has valid bracket ordering.", link: "https://leetcode.com/problems/valid-parentheses/", difficulty: "Easy", tags: ["Stack", "Strings"] },
  { company: "Microsoft", text: "Merge Intervals — Merge all overlapping intervals.", link: "https://leetcode.com/problems/merge-intervals/", difficulty: "Medium", tags: ["Sorting", "Intervals"] },
  { company: "Microsoft", text: "Course Schedule — Detect cycle in a directed graph (prerequisites problem).", link: "https://leetcode.com/problems/course-schedule/", difficulty: "Medium", tags: ["Graphs", "Topological Sort"] },
  { company: "Microsoft", text: "Serialize and Deserialize Binary Tree", link: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", difficulty: "Hard", tags: ["Trees", "BFS", "Design"] },

  // ── Meta / Facebook ──
  { company: "Meta", text: "Product of Array Except Self — Return product array without using division.", link: "https://leetcode.com/problems/product-of-array-except-self/", difficulty: "Medium", tags: ["Arrays", "Prefix Sum"] },
  { company: "Meta", text: "Binary Tree Right Side View — Return nodes visible from the right side.", link: "https://leetcode.com/problems/binary-tree-right-side-view/", difficulty: "Medium", tags: ["Trees", "BFS"] },
  { company: "Meta", text: "Clone Graph — Deep clone a connected undirected graph.", link: "https://leetcode.com/problems/clone-graph/", difficulty: "Medium", tags: ["Graphs", "DFS"] },
  { company: "Meta", text: "Subarray Sum Equals K — Find total number of continuous subarrays with sum equal to K.", link: "https://leetcode.com/problems/subarray-sum-equals-k/", difficulty: "Medium", tags: ["Arrays", "Hash Map", "Prefix Sum"] },
  { company: "Meta", text: "Minimum Window Substring — Find the smallest substring containing all characters of another string.", link: "https://leetcode.com/problems/minimum-window-substring/", difficulty: "Hard", tags: ["Sliding Window", "Strings"] },

  // ── Goldman Sachs ──
  { company: "Goldman Sachs", text: "Valid Sudoku — Determine if a 9×9 board is valid.", link: "https://leetcode.com/problems/valid-sudoku/", difficulty: "Medium", tags: ["Matrix", "Hash Map"] },
  { company: "Goldman Sachs", text: "Spiral Matrix — Return all elements in spiral order.", link: "https://leetcode.com/problems/spiral-matrix/", difficulty: "Medium", tags: ["Matrix", "Simulation"] },
  { company: "Goldman Sachs", text: "Climbing Stairs — Count distinct ways to reach the top.", link: "https://leetcode.com/problems/climbing-stairs/", difficulty: "Easy", tags: ["DP", "Math"] },
  { company: "Goldman Sachs", text: "Stock Buy Sell Multiple Transactions — Maximize profit with multiple transactions allowed.", link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/", difficulty: "Medium", tags: ["Greedy", "DP"] },

  // ── Flipkart ──
  { company: "Flipkart", text: "Next Permutation — Implement next lexicographic permutation of numbers.", link: "https://leetcode.com/problems/next-permutation/", difficulty: "Medium", tags: ["Arrays", "Math"] },
  { company: "Flipkart", text: "Kth Largest Element in an Array — Find the Kth largest element.", link: "https://leetcode.com/problems/kth-largest-element-in-an-array/", difficulty: "Medium", tags: ["Heap", "Sorting"] },
  { company: "Flipkart", text: "Detect Cycle in Linked List — Floyd's cycle detection algorithm.", link: "https://leetcode.com/problems/linked-list-cycle/", difficulty: "Easy", tags: ["Linked List", "Two Pointers"] },
  { company: "Flipkart", text: "Longest Palindromic Substring", link: "https://leetcode.com/problems/longest-palindromic-substring/", difficulty: "Medium", tags: ["Strings", "DP"] },

  // ── TCS ──
  { company: "TCS", text: "FizzBuzz — Print Fizz, Buzz, FizzBuzz or the number.", link: "https://leetcode.com/problems/fizz-buzz/", difficulty: "Easy", tags: ["Strings", "Math"] },
  { company: "TCS", text: "Palindrome Number — Check if an integer is a palindrome.", link: "https://leetcode.com/problems/palindrome-number/", difficulty: "Easy", tags: ["Math"] },
  { company: "TCS", text: "Remove Duplicates from Sorted Array", link: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/", difficulty: "Easy", tags: ["Arrays", "Two Pointers"] },

  // ── Infosys ──
  { company: "Infosys", text: "Roman to Integer — Convert a roman numeral to an integer.", link: "https://leetcode.com/problems/roman-to-integer/", difficulty: "Easy", tags: ["Strings", "Math"] },
  { company: "Infosys", text: "Maximum Subarray — Kadane's Algorithm for max subarray sum.", link: "https://leetcode.com/problems/maximum-subarray/", difficulty: "Medium", tags: ["Arrays", "DP"] },
  { company: "Infosys", text: "Merge Two Sorted Lists", link: "https://leetcode.com/problems/merge-two-sorted-lists/", difficulty: "Easy", tags: ["Linked List", "Recursion"] },

  // ── Wipro ──
  { company: "Wipro", text: "Implement strStr() — Find first occurrence of a substring.", link: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/", difficulty: "Easy", tags: ["Strings"] },
  { company: "Wipro", text: "Move Zeroes — Move all zeroes to the end while maintaining order.", link: "https://leetcode.com/problems/move-zeroes/", difficulty: "Easy", tags: ["Arrays", "Two Pointers"] },
  { company: "Wipro", text: "Binary Search — Implement binary search on a sorted array.", link: "https://leetcode.com/problems/binary-search/", difficulty: "Easy", tags: ["Binary Search"] },

  // ── Uber ──
  { company: "Uber", text: "Design an Autocomplete System — Design a search autocomplete system.", link: "https://leetcode.com/problems/design-search-autocomplete-system/", difficulty: "Hard", tags: ["Design", "Trie"] },
  { company: "Uber", text: "Group Anagrams — Group strings that are anagrams of each other.", link: "https://leetcode.com/problems/group-anagrams/", difficulty: "Medium", tags: ["Strings", "Hash Map", "Sorting"] },
  { company: "Uber", text: "3Sum — Find all unique triplets in the array that sum to zero.", link: "https://leetcode.com/problems/3sum/", difficulty: "Medium", tags: ["Arrays", "Two Pointers", "Sorting"] },

  // ── Adobe ──
  { company: "Adobe", text: "Longest Common Prefix — Find the longest common prefix among an array of strings.", link: "https://leetcode.com/problems/longest-common-prefix/", difficulty: "Easy", tags: ["Strings"] },
  { company: "Adobe", text: "Decode Ways — Count ways to decode a digit string.", link: "https://leetcode.com/problems/decode-ways/", difficulty: "Medium", tags: ["DP", "Strings"] },
  { company: "Adobe", text: "Maximal Rectangle — Find the largest rectangle containing only 1s in a binary matrix.", link: "https://leetcode.com/problems/maximal-rectangle/", difficulty: "Hard", tags: ["Stack", "Matrix", "DP"] },
];

// ── Seed ─────────────────────────────────────────────────────
async function seed() {
  console.log("🔄 Fetching existing companies...");
  const companyMap = await getCompanyMap();
  console.log(`   Found ${Object.keys(companyMap).length} companies:`, Object.keys(companyMap).join(", "));

  const batch = firestore.batch();
  let count = 0;

  for (const q of QUESTIONS) {
    const companyId = companyMap[q.company] || "";
    const docRef = firestore.collection("questions").doc();

    batch.set(docRef, {
      companyId,
      companyName: q.company,
      text: q.text,
      link: q.link,
      difficulty: q.difficulty,
      tags: q.tags,
      author: "Placement Cell (Admin)",
      status: "approved",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    count++;
  }

  await batch.commit();
  console.log(`✅ Seeded ${count} questions across ${new Set(QUESTIONS.map(q => q.company)).size} companies!`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
