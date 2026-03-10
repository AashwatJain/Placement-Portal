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

  // ── Atlassian ──
  { company: "Atlassian", text: "Design Hit Counter — Design a hit counter that counts hits in the past 5 minutes.", link: "https://leetcode.com/problems/design-hit-counter/", difficulty: "Medium", tags: ["Design", "Queue"] },
  { company: "Atlassian", text: "Rate Limiter — Implement a rate limiter using token bucket or sliding window.", link: "https://leetcode.com/problems/logger-rate-limiter/", difficulty: "Easy", tags: ["Design", "Hash Map"] },
  { company: "Atlassian", text: "Find All Anagrams in a String — Find all start indices of anagrams of p in s.", link: "https://leetcode.com/problems/find-all-anagrams-in-a-string/", difficulty: "Medium", tags: ["Sliding Window", "Strings"] },
  { company: "Atlassian", text: "LFU Cache — Implement a Least Frequently Used cache.", link: "https://leetcode.com/problems/lfu-cache/", difficulty: "Hard", tags: ["Design", "Hash Map", "Linked List"] },

  // ── DE Shaw ──
  { company: "DE Shaw", text: "Longest Increasing Subsequence — Find the length of the longest strictly increasing subsequence.", link: "https://leetcode.com/problems/longest-increasing-subsequence/", difficulty: "Medium", tags: ["DP", "Binary Search"] },
  { company: "DE Shaw", text: "Edit Distance — Find minimum operations to convert one string to another.", link: "https://leetcode.com/problems/edit-distance/", difficulty: "Medium", tags: ["DP", "Strings"] },
  { company: "DE Shaw", text: "Count of Smaller Numbers After Self", link: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/", difficulty: "Hard", tags: ["Binary Indexed Tree", "Divide and Conquer"] },
  { company: "DE Shaw", text: "Regular Expression Matching — Implement regex with '.' and '*' support.", link: "https://leetcode.com/problems/regular-expression-matching/", difficulty: "Hard", tags: ["DP", "Strings", "Recursion"] },

  // ── Sprinklr ──
  { company: "Sprinklr", text: "Word Search — Search for a word in a 2D grid of characters.", link: "https://leetcode.com/problems/word-search/", difficulty: "Medium", tags: ["Backtracking", "Matrix"] },
  { company: "Sprinklr", text: "Combination Sum — Find all unique combinations that sum to a target.", link: "https://leetcode.com/problems/combination-sum/", difficulty: "Medium", tags: ["Backtracking", "Arrays"] },
  { company: "Sprinklr", text: "Alien Dictionary — Derive the order of characters in an alien language.", link: "https://leetcode.com/problems/alien-dictionary/", difficulty: "Hard", tags: ["Graphs", "Topological Sort"] },
  { company: "Sprinklr", text: "Sliding Window Maximum — Find max in each sliding window of size k.", link: "https://leetcode.com/problems/sliding-window-maximum/", difficulty: "Hard", tags: ["Deque", "Sliding Window"] },

  // ── Media.net ──
  { company: "Media.net", text: "Implement Trie (Prefix Tree) — Design a trie with insert, search, and startsWith.", link: "https://leetcode.com/problems/implement-trie-prefix-tree/", difficulty: "Medium", tags: ["Trie", "Design"] },
  { company: "Media.net", text: "Find Median from Data Stream — Design a data structure for streaming median.", link: "https://leetcode.com/problems/find-median-from-data-stream/", difficulty: "Hard", tags: ["Heap", "Design"] },
  { company: "Media.net", text: "Largest Rectangle in Histogram — Find the largest rectangular area in a histogram.", link: "https://leetcode.com/problems/largest-rectangle-in-histogram/", difficulty: "Hard", tags: ["Stack", "Arrays"] },
  { company: "Media.net", text: "Daily Temperatures — Find days until a warmer temperature for each day.", link: "https://leetcode.com/problems/daily-temperatures/", difficulty: "Medium", tags: ["Stack", "Arrays"] },

  // ── Zomato ──
  { company: "Zomato", text: "Search in Rotated Sorted Array — Search a target in a rotated sorted array.", link: "https://leetcode.com/problems/search-in-rotated-sorted-array/", difficulty: "Medium", tags: ["Binary Search", "Arrays"] },
  { company: "Zomato", text: "Coin Change — Find minimum coins needed to make up a given amount.", link: "https://leetcode.com/problems/coin-change/", difficulty: "Medium", tags: ["DP", "Greedy"] },
  { company: "Zomato", text: "Word Break — Determine if a string can be segmented into dictionary words.", link: "https://leetcode.com/problems/word-break/", difficulty: "Medium", tags: ["DP", "Strings"] },
  { company: "Zomato", text: "Set Matrix Zeroes — Set entire row and column to 0 if an element is 0.", link: "https://leetcode.com/problems/set-matrix-zeroes/", difficulty: "Medium", tags: ["Matrix", "Arrays"] },

  // ── Oracle ──
  { company: "Oracle", text: "N-Queens — Place N queens on an N×N board so no two queens attack each other.", link: "https://leetcode.com/problems/n-queens/", difficulty: "Hard", tags: ["Backtracking", "Recursion"] },
  { company: "Oracle", text: "Top K Frequent Elements — Find the k most frequent elements.", link: "https://leetcode.com/problems/top-k-frequent-elements/", difficulty: "Medium", tags: ["Heap", "Hash Map", "Sorting"] },
  { company: "Oracle", text: "Lowest Common Ancestor of a Binary Tree", link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/", difficulty: "Medium", tags: ["Trees", "DFS", "Recursion"] },
  { company: "Oracle", text: "Flatten Binary Tree to Linked List", link: "https://leetcode.com/problems/flatten-binary-tree-to-linked-list/", difficulty: "Medium", tags: ["Trees", "DFS"] },

  // ── Samsung ──
  { company: "Samsung", text: "Longest Valid Parentheses — Find length of the longest valid parentheses substring.", link: "https://leetcode.com/problems/longest-valid-parentheses/", difficulty: "Hard", tags: ["Stack", "DP", "Strings"] },
  { company: "Samsung", text: "Unique Paths — Count unique paths from top-left to bottom-right of an m×n grid.", link: "https://leetcode.com/problems/unique-paths/", difficulty: "Medium", tags: ["DP", "Math"] },
  { company: "Samsung", text: "Graph Valid Tree — Determine if an undirected graph is a valid tree.", link: "https://leetcode.com/problems/graph-valid-tree/", difficulty: "Medium", tags: ["Graphs", "Union Find", "BFS"] },
  { company: "Samsung", text: "Surrounded Regions — Capture regions surrounded by 'X'.", link: "https://leetcode.com/problems/surrounded-regions/", difficulty: "Medium", tags: ["BFS", "DFS", "Matrix"] },

  // ── Intuit ──
  { company: "Intuit", text: "Task Scheduler — Find least intervals needed to finish all tasks with cooldown.", link: "https://leetcode.com/problems/task-scheduler/", difficulty: "Medium", tags: ["Greedy", "Heap", "Arrays"] },
  { company: "Intuit", text: "Accounts Merge — Merge accounts that share common emails.", link: "https://leetcode.com/problems/accounts-merge/", difficulty: "Medium", tags: ["Union Find", "DFS", "Graphs"] },
  { company: "Intuit", text: "House Robber — Maximum money without robbing two adjacent houses.", link: "https://leetcode.com/problems/house-robber/", difficulty: "Medium", tags: ["DP", "Arrays"] },
  { company: "Intuit", text: "Permutations — Generate all permutations of a list of distinct integers.", link: "https://leetcode.com/problems/permutations/", difficulty: "Medium", tags: ["Backtracking", "Arrays"] },
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
