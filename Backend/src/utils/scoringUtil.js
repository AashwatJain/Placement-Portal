/**
 * scoringUtil.js
 *
 * Utility for computing a student's profile vector — three normalized
 * scores (0–100) representing their DSA, Competitive Programming, and
 * Development strengths.
 */

// ── Normalization ceilings ──────────────────────────────────────────────────
// Values at or above these thresholds receive a perfect score of 100.

/** LeetCode problems solved ceiling (top competitive range) */
const MAX_LEETCODE_SOLVED = 500;

/** Codeforces rating ceiling (International Master threshold) */
const MAX_CODEFORCES_RATING = 2400;

/** GitHub public repositories ceiling (strong dev portfolio) */
const MAX_GITHUB_REPOS = 50;

// ── Helper ──────────────────────────────────────────────────────────────────

/**
 * Clamps a value between 0 and 100 and rounds to two decimal places.
 * @param {number} rawScore - Unnormalized score value.
 * @returns {number} Score in the range [0, 100].
 */
const clampScore = (rawScore) => {
    const clamped = Math.min(100, Math.max(0, rawScore));
    return Math.round(clamped * 100) / 100;
};

// ── Core export ─────────────────────────────────────────────────────────────

/**
 * Calculates a normalized profile vector for a student based on their
 * coding-platform statistics.
 *
 * @param {Object} studentData - Raw student platform data.
 * @param {number|string} studentData.leetCodeSolved  - Total LeetCode problems solved.
 * @param {number|string} studentData.codeforcesRating - Current Codeforces rating.
 * @param {number|string} studentData.githubRepos     - Number of public GitHub repositories.
 *
 * @returns {[number, number, number]} A tuple of [dsaScore, devScore, cpScore],
 *   each normalized to the range [0, 100].
 */
export const calculateProfileVector = (studentData) => {
    const { leetCodeSolved, codeforcesRating, githubRepos } = studentData;

    // Parse inputs safely — treat missing / non-numeric values as 0
    const parsedLeetCodeSolved   = parseFloat(leetCodeSolved)   || 0;
    const parsedCodeforcesRating = parseFloat(codeforcesRating) || 0;
    const parsedGithubRepos      = parseFloat(githubRepos)      || 0;

    // DSA score: how many LeetCode problems has the student solved?
    // Formula: (solved / ceiling) × 100, clamped to [0, 100]
    const dsaScore = clampScore(
        (parsedLeetCodeSolved / MAX_LEETCODE_SOLVED) * 100
    );

    // Dev score: how active is the student on GitHub?
    // Formula: (repos / ceiling) × 100, clamped to [0, 100]
    const devScore = clampScore(
        (parsedGithubRepos / MAX_GITHUB_REPOS) * 100
    );

    // CP score: how high is the student's Codeforces rating?
    // Formula: (rating / ceiling) × 100, clamped to [0, 100]
    const cpScore = clampScore(
        (parsedCodeforcesRating / MAX_CODEFORCES_RATING) * 100
    );

    return [dsaScore, devScore, cpScore];
};
