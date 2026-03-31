import axios from "axios";

const getLeetCodeTitle = (rating) => {
    if (typeof rating !== "number") return "";
    if (rating >= 2400) return "Guardian";
    if (rating >= 1800) return "Knight";
    return "";
};

const getCodeforcesTitle = (rating) => {
    if (typeof rating !== "number") return "";
    if (rating >= 2400) return "International Master";
    if (rating >= 2100) return "Master";
    if (rating >= 1900) return "Candidate Master";
    if (rating >= 1600) return "Expert";
    if (rating >= 1400) return "Specialist";
    if (rating >= 1200) return "Pupil";
    return "Newbie";
};

const getCodeChefTitle = (rating) => {
    if (typeof rating !== "number") return "";
    if (rating >= 2500) return "7★";
    if (rating >= 2200) return "6★";
    if (rating >= 2000) return "5★";
    if (rating >= 1800) return "4★";
    if (rating >= 1600) return "3★";
    if (rating >= 1400) return "2★";
    return "1★";
};

export const getLeetCodeStats = async (handle) => {
    if (!handle) return null;
    try {
        const query = `
        query getUserProfile($username: String!) {
            matchedUser(username: $username) {
                profile {
                    ranking
                }
                submitStatsGlobal {
                    acSubmissionNum {
                        difficulty
                        count
                    }
                }
                userCalendar {
                    submissionCalendar
                }
            }
            userContestRanking(username: $username) {
                rating
                attendedContestsCount
            }
        }`;

        const response = await axios.post("https://leetcode.com/graphql", {
            query,
            variables: { username: handle }
        }, {
            headers: {
                "Content-Type": "application/json",
                "Referer": "https://leetcode.com",
                "Origin": "https://leetcode.com",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            },
            timeout: 10000
        });

        const user = response.data?.data?.matchedUser;
        if (!user) return null;

        const acStats = user.submitStatsGlobal?.acSubmissionNum || [];
        let easy = 0, medium = 0, hard = 0, totalSolved = 0;
        acStats.forEach(s => {
            if (s.difficulty === "Easy") easy = s.count;
            else if (s.difficulty === "Medium") medium = s.count;
            else if (s.difficulty === "Hard") hard = s.count;
            else if (s.difficulty === "All") totalSolved = s.count;
        });

        let calendar = {};
        let calendarFormatted = {};
        if (user.userCalendar?.submissionCalendar) {
            calendar = typeof user.userCalendar.submissionCalendar === 'string'
                ? JSON.parse(user.userCalendar.submissionCalendar)
                : user.userCalendar.submissionCalendar;
            Object.entries(calendar).forEach(([ts, count]) => {
                const date = new Date(parseInt(ts) * 1000).toISOString().split('T')[0];
                calendarFormatted[date] = (calendarFormatted[date] || 0) + count;
            });
        }

        const contestRating = response.data?.data?.userContestRanking?.rating;
        const numericRating = contestRating ? Math.round(contestRating) : null;
        const displayRating = numericRating || "Unrated";

        return {
            id: "leetcode",
            name: "LeetCode",
            handle: handle,
            rating: displayRating,
            title: getLeetCodeTitle(numericRating),
            solved: totalSolved || (easy + medium + hard),
            easy,
            medium,
            hard,
            contestsAttended: response.data?.data?.userContestRanking?.attendedContestsCount || 0,
            calendar: calendarFormatted,
            color: "text-amber-500",
            bg: "bg-amber-100"
        };
    } catch (error) {
        console.error(`LeetCode Error for ${handle}:`, error.message);
        return {
            id: "leetcode", name: "LeetCode", handle,
            rating: "N/A", title: "", solved: "N/A", easy: 0, medium: 0, hard: 0,
            calendar: {}, color: "text-amber-500", bg: "bg-amber-100"
        };
    }
};

export const getLeetCodeSolvedSlugs = async (handle) => {
    if (!handle) return [];
    try {
        const query = `
        query recentAcSubmissions($username: String!, $limit: Int!) {
            recentAcSubmissionList(username: $username, limit: $limit) {
                titleSlug
            }
        }`;

        const response = await axios.post("https://leetcode.com/graphql", {
            query,
            variables: { username: handle, limit: 500 }
        }, {
            headers: {
                "Content-Type": "application/json",
                "Referer": "https://leetcode.com",
                "Origin": "https://leetcode.com",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            },
            timeout: 15000
        });

        const submissions = response.data?.data?.recentAcSubmissionList || [];
        return [...new Set(submissions.map(s => s.titleSlug))];
    } catch (error) {
        console.error(`LeetCode Slugs Error for ${handle}:`, error.message);
        return [];
    }
};

export const getCodeforcesStats = async (handle) => {
    if (!handle) return null;
    try {
        const [infoRes, statusRes, ratingRes] = await Promise.all([
            axios.get(`https://codeforces.com/api/user.info?handles=${handle}`).catch(() => null),
            axios.get(`https://codeforces.com/api/user.status?handle=${handle}`).catch(() => null),
            axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`).catch(() => null)
        ]);

        const userInfo = infoRes?.data?.result?.[0] || {};
        let solvedCount = 0;
        const calendar = {};

        if (statusRes?.data?.status === "OK") {
            const solvedSet = new Set();
            statusRes.data.result.forEach(sub => {
                if (sub.creationTimeSeconds) {
                    const date = new Date(sub.creationTimeSeconds * 1000).toISOString().split('T')[0];
                    calendar[date] = (calendar[date] || 0) + 1;
                }

                if (sub.verdict === "OK" && sub.problem) {
                    solvedSet.add(`${sub.problem.contestId}${sub.problem.index}`);
                }
            });
            solvedCount = solvedSet.size;
        }

        const contestsAttended = ratingRes?.data?.result?.length || 0;
        const numericRating = userInfo.rating || null;

        return {
            id: "codeforces",
            name: "Codeforces",
            handle: handle,
            rating: numericRating || "Unrated",
            title: getCodeforcesTitle(numericRating),
            solved: solvedCount,
            contestsAttended: contestsAttended,
            calendar: calendar,
            color: "text-blue-500",
            bg: "bg-blue-100"
        };
    } catch (error) {
        console.error(`Codeforces Error for ${handle}:`, error.message);
        return {
            id: "codeforces", name: "Codeforces", handle,
            rating: "N/A", title: "", solved: "N/A",
            calendar: {}, color: "text-blue-500", bg: "bg-blue-100"
        };
    }
};

export const getCodeChefStats = async (handle) => {
    if (!handle) return null;
    try {
        const response = await axios.get(`https://www.codechef.com/users/${handle}`, {
            headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
            timeout: 10000
        });
        const html = response.data;

        let rating = "Unrated";
        let numericRating = null;
        let contestsAttended = 0;

        const jsonArrays = html.match(/var\s+\w+\s*=\s*(\[.*?\]);/gs) || [];
        for (const block of jsonArrays) {
            try {
                const jsonStr = block.match(/=\s*(\[.*?\]);/s)?.[1];
                if (!jsonStr) continue;
                const arr = JSON.parse(jsonStr);
                if (!Array.isArray(arr) || arr.length === 0) continue;

                if (arr[0].rating && arr[0].code && arr[0].rank) {
                    contestsAttended = arr.length;
                    const lastContest = arr[arr.length - 1];
                    numericRating = parseInt(lastContest.rating);
                    rating = numericRating;
                }
            } catch (e) {  }
        }

        const calendar = {};
        for (const block of jsonArrays) {
            try {
                const jsonStr = block.match(/=\s*(\[.*?\]);/s)?.[1];
                if (!jsonStr) continue;
                const arr = JSON.parse(jsonStr);
                if (!Array.isArray(arr) || arr.length === 0) continue;

                if (arr[0].date && arr[0].value !== undefined) {
                    arr.forEach(entry => {
                        const parts = entry.date.split('-');
                        const normalized = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                        calendar[normalized] = (calendar[normalized] || 0) + entry.value;
                    });
                }
            } catch (e) {  }
        }

        let solved = 0;
        const solvedMatch = html.match(/Problems Solved.*?(\d+)/s);
        if (solvedMatch) solved = parseInt(solvedMatch[1]);

        return {
            id: "codechef",
            name: "CodeChef",
            handle: handle,
            rating: rating,
            title: getCodeChefTitle(numericRating),
            solved: solved,
            contestsAttended: contestsAttended,
            calendar: calendar,
            color: "text-orange-500",
            bg: "bg-orange-100"
        };
    } catch (error) {
        console.error(`CodeChef Error for ${handle}:`, error.message);
        return {
            id: "codechef", name: "CodeChef", handle,
            rating: "N/A", title: "", solved: "N/A", contestsAttended: 0,
            calendar: {}, color: "text-orange-500", bg: "bg-orange-100"
        };
    }
};

export const getGithubStats = async (handle) => {
    if (!handle) return null;
    try {
        let username = handle.trim();
        username = username.replace(/https?:\/\/(www\.)?github\.com\/?/i, "").replace(/^(www\.)?github\.com\/?/i, "").replace(/\/+$/, "");
        if (!username) return null;

        const response = await axios.get(`https://api.github.com/users/${username}`, {
            headers: {
                "User-Agent": "PlacementPortal/1.0",
                "Accept": "application/vnd.github.v3+json"
            },
            timeout: 10000
        });
        return {
            id: "github",
            name: "GitHub",
            handle: username,
            repos: response.data.public_repos || 0,
            commits: response.data.public_gists || 0,
            color: "text-slate-800",
            bg: "bg-slate-200"
        };
    } catch (error) {
        console.error(`GitHub Error for ${handle}:`, error.message);
        return {
            id: "github", name: "GitHub", handle,
            repos: "N/A", commits: "N/A",
            color: "text-slate-800", bg: "bg-slate-200"
        };
    }
};