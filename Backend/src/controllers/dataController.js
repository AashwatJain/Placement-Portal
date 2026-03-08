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
