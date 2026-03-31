import db from "../config/firebaseAdmin.js";
import {
    getLeetCodeStats,
    getCodeforcesStats,
    getCodeChefStats,
    getGithubStats
} from "../utils/codingPlatformApis.js";

const getCodingStats = async (req, res) => {
    try {
        const { uid } = req.params;

        if (!uid) {
            return res.status(400).json({ error: "UID is required!" });
        }

        const userSnapshot = await db.ref(`users/${uid}`).once("value");
        if (!userSnapshot.exists()) {
            return res.status(404).json({ error: "User not found." });
        }

        const userData = userSnapshot.val();

        const promises = [
            getLeetCodeStats(userData.leetcode || null),
            getCodeforcesStats(userData.codeforces || null),
            getCodeChefStats(userData.codechef || null),
            getGithubStats(userData.github || null)
        ];

        const fallbackCards = [
            { id: "leetcode", name: "LeetCode", handle: userData.leetcode || "Not Set", rating: "N/A", solved: "N/A", easy: 0, medium: 0, hard: 0, color: "text-amber-500", bg: "bg-amber-100" },
            { id: "codeforces", name: "Codeforces", handle: userData.codeforces || "Not Set", rating: "N/A", solved: "N/A", color: "text-blue-500", bg: "bg-blue-100" },
            { id: "codechef", name: "CodeChef", handle: userData.codechef || "Not Set", rating: "N/A", solved: "N/A", color: "text-orange-500", bg: "bg-orange-100" },
            { id: "github", name: "GitHub", handle: userData.github || "Not Set", repos: "N/A", commits: "N/A", color: "text-slate-600", bg: "bg-slate-100" }
        ];

        const results = await Promise.allSettled(promises);

        const platformsInfo = [];
        let dashboardStats = {
            totalSolved: 0,
            activeDays: 0,
            totalContests: 0,
            problems: { easy: 0, medium: 0, hard: 0 },
            contestRankings: { codeforces: "Unrated", leetcode: "Unrated", codechef: "Unrated" }
        };

        const dailyCounts = {};

        results.forEach((result, index) => {
            const pd = (result.status === "fulfilled" && result.value) ? result.value : fallbackCards[index];
            platformsInfo.push(pd);

            if (pd.id !== "github" && typeof pd.solved === "number") {
                dashboardStats.totalSolved += pd.solved || 0;
            }

            if (pd.id === "leetcode") {
                dashboardStats.problems.easy += pd.easy || 0;
                dashboardStats.problems.medium += pd.medium || 0;
                dashboardStats.problems.hard += pd.hard || 0;
                dashboardStats.contestRankings.leetcode = pd.rating;
                dashboardStats.totalContests += pd.contestsAttended || 0;

                if (pd.calendar) {
                    Object.entries(pd.calendar).forEach(([date, count]) => {
                        dailyCounts[date] = (dailyCounts[date] || 0) + count;
                    });
                }
            }

            if (pd.id === "codeforces") {
                dashboardStats.contestRankings.codeforces = pd.rating;
                dashboardStats.totalContests += pd.contestsAttended || 0;

                if (pd.calendar) {
                    Object.entries(pd.calendar).forEach(([date, count]) => {
                        dailyCounts[date] = (dailyCounts[date] || 0) + count;
                    });
                }
            }

            if (pd.id === "codechef") {
                dashboardStats.contestRankings.codechef = pd.rating;
                dashboardStats.totalContests += pd.contestsAttended || 0;

                if (pd.calendar) {
                    Object.entries(pd.calendar).forEach(([date, count]) => {
                        dailyCounts[date] = (dailyCounts[date] || 0) + count;
                    });
                }
            }
        });

        const heatmapData = [];
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);

        for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const count = dailyCounts[dateStr] || 0;

            let level = 0;
            if (count > 0) level = 1;
            if (count >= 3) level = 2;
            if (count >= 5) level = 3;
            if (count >= 10) level = 4;

            heatmapData.push({ date: dateStr, count, level });
        }

        dashboardStats.activeDays = Object.keys(dailyCounts).length;

        return res.status(200).json({
            success: true,
            stats: dashboardStats,
            platforms: platformsInfo,
            heatmapData: heatmapData
        });

    } catch (error) {
        console.error("Error fetching coding stats:", error);
        res.status(500).json({ error: "Failed to load coding statistics." });
    }
};

export default { getCodingStats };