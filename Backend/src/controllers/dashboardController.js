// controllers/dashboardController.js
// ─────────────────────────────────────────────────────────────
// Dashboard & Analytics endpoints.
// All data is aggregated from Firebase Realtime DB (`users`) and
// Firestore (`drives`, `offers`, `audit_log`).
// ─────────────────────────────────────────────────────────────

import admin from "firebase-admin";

// ── Helpers ─────────────────────────────────────────────────

/**
 * Fetches all student records from Realtime Database.
 * Optionally filters by academic year.
 */
const fetchStudents = async (year) => {
    const snapshot = await admin.database().ref("users").once("value");
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    let students = Object.entries(data)
        .map(([uid, u]) => ({ uid, ...u }))
        .filter((u) => u.role === "student");

    if (year) {
        students = students.filter((s) => String(s.year) === String(year));
    }
    return students;
};

/**
 * Fetches Firestore documents from a collection with optional filters.
 */
const fetchCollection = async (collectionName, filters = {}) => {
    const firestore = admin.firestore();
    let query = firestore.collection(collectionName);

    for (const [field, value] of Object.entries(filters)) {
        query = query.where(field, "==", value);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ── 1. Headline KPI Stats ───────────────────────────────────

export const getStats = async (req, res) => {
    try {
        const { year } = req.query;
        const students = await fetchStudents(year);

        const totalStudents = students.length;

        const placed = students.filter(
            (s) => s.status === "Placed" || s.placement_status === "placed"
        );
        const placedCount = placed.length;
        const placementRate = totalStudents > 0
            ? ((placedCount / totalStudents) * 100).toFixed(1)
            : 0;

        const packages = placed
            .map((s) => parseFloat(s.placed_package_lpa) || 0)
            .filter((p) => p > 0);

        const avgPackage = packages.length > 0
            ? (packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(2)
            : 0;

        const highestPackage = packages.length > 0 ? Math.max(...packages) : 0;
        const highestPackageStudent = placed.find(
            (s) => parseFloat(s.placed_package_lpa) === highestPackage
        );

        // Drives (from Firestore)
        const drives = await fetchCollection("drives");
        const activeDrives = drives.filter((d) => d.status === "active").length;

        // Offers (from Firestore)
        const offers = await fetchCollection("offers");

        // Unique companies from drives
        const uniqueCompanyIds = new Set(drives.map((d) => d.company_id).filter(Boolean));

        // Pending reviews = unverified resumes + pending questions
        const pendingResumes = students.filter(
            (s) => s.resume_status === "pending" || (!s.resume_status && s.resumeUrl)
        ).length;

        const firestore = admin.firestore();
        const pendingQuestionsSnap = await firestore
            .collection("questions")
            .where("status", "!=", "approved")
            .get();
        const pendingQuestions = pendingQuestionsSnap.size;

        res.status(200).json({
            totalStudents,
            placedCount,
            placementRate: Number(placementRate),
            avgPackage: Number(avgPackage),
            highestPackage,
            highestPackageStudentName: highestPackageStudent?.name || null,
            activeDrives,
            companiesVisited: uniqueCompanyIds.size,
            totalOffers: offers.length,
            pendingReview: pendingResumes + pendingQuestions,
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
};

// ── 2. Placement Funnel ─────────────────────────────────────

export const getFunnel = async (req, res) => {
    try {
        const { year } = req.query;
        const students = await fetchStudents(year);

        const registered = students.length;
        const applied = students.filter(
            (s) => s.status && s.status !== "Unplaced" && s.status !== "Eligible"
        ).length;
        const shortlisted = students.filter(
            (s) => s.status === "Shortlisted" || s.status === "Interviewing" || s.status === "Placed"
        ).length;
        const appeared = students.filter(
            (s) => s.status === "Interviewing" || s.status === "Placed"
        ).length;

        // Offers from Firestore
        const offers = await fetchCollection("offers");
        const offered = offers.length;
        const accepted = offers.filter((o) => o.status === "accepted").length;

        res.status(200).json({
            stages: [
                { name: "Registered", count: registered },
                { name: "Applied", count: applied },
                { name: "Shortlisted", count: shortlisted },
                { name: "Appeared", count: appeared },
                { name: "Offered", count: offered },
                { name: "Accepted", count: accepted },
            ],
        });
    } catch (error) {
        console.error("Funnel error:", error);
        res.status(500).json({ error: "Failed to fetch funnel data" });
    }
};

// ── 3. Branch Breakdown ─────────────────────────────────────

export const getBranchBreakdown = async (req, res) => {
    try {
        const { year } = req.query;
        const students = await fetchStudents(year);

        const branchMap = {};

        for (const s of students) {
            const branch = (s.branch || "Unknown").toUpperCase();

            if (!branchMap[branch]) {
                branchMap[branch] = { branch, total: 0, placed: 0, packages: [] };
            }

            branchMap[branch].total += 1;

            if (s.status === "Placed" || s.placement_status === "placed") {
                branchMap[branch].placed += 1;
                const pkg = parseFloat(s.placed_package_lpa) || 0;
                if (pkg > 0) branchMap[branch].packages.push(pkg);
            }
        }

        const breakdown = Object.values(branchMap).map((b) => ({
            branch: b.branch,
            total: b.total,
            placed: b.placed,
            unplaced: b.total - b.placed,
            rate: b.total > 0 ? ((b.placed / b.total) * 100).toFixed(1) : 0,
            avgPackage: b.packages.length > 0
                ? (b.packages.reduce((a, c) => a + c, 0) / b.packages.length).toFixed(2)
                : 0,
            highestPackage: b.packages.length > 0 ? Math.max(...b.packages) : 0,
        }));

        // Sort by placement rate descending
        breakdown.sort((a, b) => Number(b.rate) - Number(a.rate));

        res.status(200).json(breakdown);
    } catch (error) {
        console.error("Branch breakdown error:", error);
        res.status(500).json({ error: "Failed to fetch branch breakdown" });
    }
};

// ── 4. Monthly Offer Trend ──────────────────────────────────

export const getMonthlyTrend = async (req, res) => {
    try {
        const offers = await fetchCollection("offers");

        // Month labels Aug(8) through May(5) of next year
        const monthLabels = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
        const monthNumbers = [8, 9, 10, 11, 12, 1, 2, 3, 4, 5];

        const trend = monthLabels.map((label, idx) => {
            const monthNum = monthNumbers[idx];
            const count = offers.filter((o) => {
                if (!o.createdAt) return false;
                const date = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
                return date.getMonth() + 1 === monthNum;
            }).length;

            return { month: label, count };
        });

        res.status(200).json(trend);
    } catch (error) {
        console.error("Monthly trend error:", error);
        res.status(500).json({ error: "Failed to fetch monthly trend" });
    }
};

// ── 5. Package Distribution ─────────────────────────────────

export const getPackageDistribution = async (req, res) => {
    try {
        const { year } = req.query;
        const students = await fetchStudents(year);

        const placed = students.filter(
            (s) => s.status === "Placed" || s.placement_status === "placed"
        );

        const buckets = [
            { label: "0–10 LPA", min: 0, max: 10, count: 0 },
            { label: "10–20 LPA", min: 10, max: 20, count: 0 },
            { label: "20–30 LPA", min: 20, max: 30, count: 0 },
            { label: "30–40 LPA", min: 30, max: 40, count: 0 },
            { label: "40+ LPA", min: 40, max: Infinity, count: 0 },
        ];

        for (const s of placed) {
            const pkg = parseFloat(s.placed_package_lpa) || 0;
            for (const bucket of buckets) {
                if (pkg >= bucket.min && pkg < bucket.max) {
                    bucket.count += 1;
                    break;
                }
            }
        }

        res.status(200).json(
            buckets.map(({ label, count }) => ({ label, count }))
        );
    } catch (error) {
        console.error("Package distribution error:", error);
        res.status(500).json({ error: "Failed to fetch package distribution" });
    }
};

// ── 6. Top Companies ────────────────────────────────────────

export const getTopCompanies = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const offers = await fetchCollection("offers");

        // Group offers by company
        const companyMap = {};
        for (const offer of offers) {
            const companyId = offer.company_id || offer.companyId || "unknown";
            if (!companyMap[companyId]) {
                companyMap[companyId] = {
                    companyId,
                    companyName: offer.company_name || offer.companyName || "Unknown",
                    offerCount: 0,
                    roles: new Set(),
                    packages: [],
                    offerTypes: new Set(),
                };
            }
            companyMap[companyId].offerCount += 1;
            if (offer.role) companyMap[companyId].roles.add(offer.role);
            if (offer.package_lpa) companyMap[companyId].packages.push(offer.package_lpa);
            if (offer.offer_type) companyMap[companyId].offerTypes.add(offer.offer_type);
        }

        const sorted = Object.values(companyMap)
            .map((c) => ({
                companyId: c.companyId,
                companyName: c.companyName,
                offerCount: c.offerCount,
                roles: [...c.roles],
                avgPackage: c.packages.length > 0
                    ? (c.packages.reduce((a, b) => a + b, 0) / c.packages.length).toFixed(2)
                    : 0,
                offerTypes: [...c.offerTypes],
            }))
            .sort((a, b) => b.offerCount - a.offerCount)
            .slice(0, limit);

        res.status(200).json(sorted);
    } catch (error) {
        console.error("Top companies error:", error);
        res.status(500).json({ error: "Failed to fetch top companies" });
    }
};

// ── 7. Activity Feed ────────────────────────────────────────

export const getActivityFeed = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const firestore = admin.firestore();

        const snapshot = await firestore
            .collection("audit_log")
            .orderBy("timestamp", "desc")
            .limit(limit)
            .get();

        const events = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                actor: data.actorName || data.actor,
                action: data.action,
                module: data.module,
                targetId: data.targetId,
                timestamp: data.timestamp?.toDate?.() || null,
            };
        });

        res.status(200).json(events);
    } catch (error) {
        console.error("Activity feed error:", error);
        res.status(500).json({ error: "Failed to fetch activity feed" });
    }
};
