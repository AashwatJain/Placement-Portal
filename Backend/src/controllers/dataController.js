import admin from "firebase-admin";

// Controller for fetching data (Companies, Opportunities) from Firestore
// and User Applications from Realtime Database.

export const getCompanies = async (req, res) => {
    try {
        const firestore = admin.firestore();
        // In frontend: orderBy("score", "desc")
        const snapshot = await firestore.collection("companies").orderBy("score", "desc").get();

        const companies = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(companies);
    } catch (error) {
        console.error("Error fetching companies:", error);
        res.status(500).json({ error: "Failed to fetch companies" });
    }
};

export const getOpportunities = async (req, res) => {
    try {
        const firestore = admin.firestore();
        // In frontend: orderBy("createdAt", "desc")
        const snapshot = await firestore.collection("opportunities").orderBy("createdAt", "desc").get();

        const opportunities = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(opportunities);
    } catch (error) {
        console.error("Error fetching opportunities:", error);
        res.status(500).json({ error: "Failed to fetch opportunities" });
    }
};

export const getUserApplications = async (req, res) => {
    try {
        const { uid } = req.params;
        if (!uid) return res.status(400).json({ error: "UID is required" });

        const db = admin.database();
        const snapshot = await db.ref(`users/${uid}/applications`).once("value");

        if (snapshot.exists()) {
            const data = snapshot.val();
            // The frontend expects the map of applications or an array. 
            // The old firebaseDb.js onUserApplications did:
            // Object.entries(data).map(([id, v]) => ({ id, ...v }))
            // We will return it exactly like that so the frontend doesn't need to transform it.
            const applicationsArray = Object.entries(data).map(([id, v]) => ({ id, ...v }));
            res.status(200).json(applicationsArray);
        } else {
            res.status(200).json([]); // No applications
        }
    } catch (error) {
        console.error("Error fetching user applications:", error);
        res.status(500).json({ error: "Failed to fetch user applications" });
    }
};

export const registerUserApplication = async (req, res) => {
    try {
        const { uid } = req.params;
        const { oppId, appData } = req.body;

        if (!uid || !oppId || !appData) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const db = admin.database();
        await db.ref(`users/${uid}/applications/${oppId}`).set(appData);

        res.status(200).json({ message: "Application registered successfully" });
    } catch (error) {
        console.error("Error registering user application:", error);
        res.status(500).json({ error: "Failed to register application" });
    }
};

// ── Interview Experiences ─────────────────────────────────

export const getExperiences = async (req, res) => {
    try {
        const firestore = admin.firestore();
        // Fetch all experiences (no orderBy to avoid needing a Firestore index)
        const snapshot = await firestore.collection("experiences").get();

        const experiences = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Sort by createdAt descending in JS (newest first)
        experiences.sort((a, b) => {
            const aTime = a.createdAt?._seconds || 0;
            const bTime = b.createdAt?._seconds || 0;
            return bTime - aTime;
        });

        res.status(200).json(experiences);
    } catch (error) {
        console.error("Error fetching experiences:", error);
        res.status(500).json({ error: "Failed to fetch experiences" });
    }
};

export const addExperience = async (req, res) => {
    try {
        const { company, role, status, difficulty, experience, problems, author, authorId } = req.body;

        if (!company || !role || !experience) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const firestore = admin.firestore();

        const newExperience = {
            company,
            role,
            status: status || "Selected",
            difficulty: difficulty || "Medium",
            summary: experience.substring(0, 150) + "...", // Auto-generate summary
            fullStory: experience,
            problems: problems || [],
            author: author || "Anonymous Student",
            authorId: authorId || "unknown",
            date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short' }),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            likes: 0,
            approved: true // Auto-approved for now, can be changed to false for moderation
        };

        const docRef = await firestore.collection("experiences").add(newExperience);

        res.status(201).json({
            message: "Experience added successfully",
            id: docRef.id,
            ...newExperience
        });
    } catch (error) {
        console.error("Error adding experience:", error);
        res.status(500).json({ error: "Failed to add experience" });
    }
};

// ── Toggle Like on Interview Experience ───────────────────

export const toggleExperienceLike = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!id || !userId) {
            return res.status(400).json({ error: "Experience ID and User ID are required" });
        }

        const firestore = admin.firestore();
        const docRef = firestore.collection("experiences").doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Experience not found" });
        }

        const data = doc.data();
        const likedBy = data.likedBy || [];
        const hasLiked = likedBy.includes(userId);

        if (hasLiked) {
            // Unlike
            await docRef.update({
                likedBy: admin.firestore.FieldValue.arrayRemove(userId),
                likes: Math.max((data.likes || 1) - 1, 0),
            });
        } else {
            // Like
            await docRef.update({
                likedBy: admin.firestore.FieldValue.arrayUnion(userId),
                likes: (data.likes || 0) + 1,
            });
        }

        res.status(200).json({
            liked: !hasLiked,
            likes: hasLiked ? Math.max((data.likes || 1) - 1, 0) : (data.likes || 0) + 1,
        });
    } catch (error) {
        console.error("Error toggling experience like:", error);
        res.status(500).json({ error: "Failed to toggle like" });
    }
};

// ── Notifications ─────────────────────────────────────────────

export const getNotifications = async (req, res) => {
    try {
        const firestore = admin.firestore();
        const snapshot = await firestore.collection("notifications").get();

        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Sort by createdAt descending (newest first)
        notifications.sort((a, b) => {
            const aTime = a.createdAt?._seconds || 0;
            const bTime = b.createdAt?._seconds || 0;
            return bTime - aTime;
        });

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

export const addNotification = async (req, res) => {
    try {
        const { text, type, target } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Notification text is required" });
        }

        const firestore = admin.firestore();
        const newNotification = {
            text,
            type: type || "info",       // deadline, shortlist, reminder, info
            target: target || "all",     // "all" or a specific user uid
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await firestore.collection("notifications").add(newNotification);
        res.status(201).json({ id: docRef.id, ...newNotification });
    } catch (error) {
        console.error("Error adding notification:", error);
        res.status(500).json({ error: "Failed to add notification" });
    }
};

// Mark all notifications as read
export const markAllNotificationsRead = async (req, res) => {
    try {
        const firestore = admin.firestore();
        const snapshot = await firestore.collection("notifications").where("read", "==", false).get();

        const batch = firestore.batch();
        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { read: true });
        });
        await batch.commit();

        res.status(200).json({ message: `${snapshot.size} notifications marked as read` });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        res.status(500).json({ error: "Failed to mark notifications as read" });
    }
};

// Delete a single notification
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const firestore = admin.firestore();
        await firestore.collection("notifications").doc(id).delete();
        res.status(200).json({ message: "Notification deleted" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ error: "Failed to delete notification" });
    }
};

// ── Practice Page: Approved Questions ─────────────────────────

export const getApprovedQuestions = async (req, res) => {
    try {
        const firestore = admin.firestore();
        const snapshot = await firestore.collection("questions")
            .where("status", "==", "approved")
            .get();

        const questions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(questions);
    } catch (error) {
        console.error("Error fetching approved questions:", error);
        res.status(500).json({ error: "Failed to fetch approved questions" });
    }
};

// ── Practice Page: Solved Questions Tracking ──────────────────

export const getSolvedQuestions = async (req, res) => {
    try {
        const { uid } = req.params;
        if (!uid) return res.status(400).json({ error: "UID is required" });

        const db = admin.database();
        const snapshot = await db.ref(`users/${uid}/solvedQuestions`).once("value");

        if (snapshot.exists()) {
            const data = snapshot.val();
            // Return array of solved question IDs
            res.status(200).json(Object.keys(data));
        } else {
            res.status(200).json([]);
        }
    } catch (error) {
        console.error("Error fetching solved questions:", error);
        res.status(500).json({ error: "Failed to fetch solved questions" });
    }
};

export const toggleSolvedQuestion = async (req, res) => {
    try {
        const { uid } = req.params;
        const { questionId, solved } = req.body;

        if (!uid || !questionId) {
            return res.status(400).json({ error: "UID and Question ID are required" });
        }

        const db = admin.database();
        const solvedRef = db.ref(`users/${uid}/solvedQuestions/${questionId}`);

        if (solved) {
            await solvedRef.set({ solvedAt: Date.now() });
        } else {
            await solvedRef.remove();
        }

        res.status(200).json({ message: solved ? "Marked as solved" : "Unmarked", questionId, solved });
    } catch (error) {
        console.error("Error toggling solved question:", error);
        res.status(500).json({ error: "Failed to toggle solved status" });
    }
};

// ── Practice Page: Auto-Sync with LeetCode ────────────────────

import { getLeetCodeSolvedSlugs } from "../utils/codingPlatformApis.js";

/**
 * Extracts the problem slug from a LeetCode URL.
 * e.g. "https://leetcode.com/problems/two-sum/" → "two-sum"
 */
function extractSlug(link) {
    if (!link) return null;
    const match = link.match(/leetcode\.com\/problems\/([^/?#]+)/i);
    return match ? match[1].toLowerCase() : null;
}

export const syncLeetCodeSolved = async (req, res) => {
    try {
        const { uid } = req.params;
        if (!uid) return res.status(400).json({ error: "UID is required" });

        // 1. Get user's LeetCode handle from RTDB
        const db = admin.database();
        const userSnap = await db.ref(`users/${uid}/leetcode`).once("value");
        const leetcodeHandle = userSnap.val();

        if (!leetcodeHandle) {
            return res.status(200).json({
                synced: 0,
                message: "No LeetCode handle found. Add it in your Profile → Coding Profiles."
            });
        }

        // 2. Fetch accepted slugs from LeetCode API
        const solvedSlugs = await getLeetCodeSolvedSlugs(leetcodeHandle);
        if (solvedSlugs.length === 0) {
            return res.status(200).json({ synced: 0, message: "No accepted submissions found on LeetCode." });
        }
        const solvedSlugSet = new Set(solvedSlugs);

        // 3. Fetch all approved questions from Firestore
        const firestore = admin.firestore();
        const qSnap = await firestore.collection("questions")
            .where("status", "==", "approved")
            .get();

        // 4. Match questions whose link slug is in the solved set
        const matchedIds = [];
        qSnap.docs.forEach(doc => {
            const data = doc.data();
            const slug = extractSlug(data.link);
            if (slug && solvedSlugSet.has(slug)) {
                matchedIds.push(doc.id);
            }
        });

        // 5. Get already-solved set from RTDB
        const solvedSnap = await db.ref(`users/${uid}/solvedQuestions`).once("value");
        const existingSolved = solvedSnap.exists() ? Object.keys(solvedSnap.val()) : [];
        const existingSet = new Set(existingSolved);

        // 6. Write only newly solved entries
        let newlySynced = 0;
        const updates = {};
        for (const qId of matchedIds) {
            if (!existingSet.has(qId)) {
                updates[`users/${uid}/solvedQuestions/${qId}`] = { solvedAt: Date.now(), source: "leetcode-sync" };
                newlySynced++;
            }
        }

        if (newlySynced > 0) {
            await db.ref().update(updates);
        }

        res.status(200).json({
            synced: newlySynced,
            totalMatched: matchedIds.length,
            message: newlySynced > 0
                ? `✅ Synced ${newlySynced} new question(s) from LeetCode!`
                : "All matching questions are already marked as solved."
        });
    } catch (error) {
        console.error("Error syncing LeetCode solved:", error);
        res.status(500).json({ error: "Failed to sync with LeetCode." });
    }
};
