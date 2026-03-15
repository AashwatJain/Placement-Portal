import admin from "firebase-admin";

// ── Admin Controller ─────────────────────────────────────────
// Handles: Student listing, Question management

// 1. GET all students (from Realtime Database `users` node)
// Both Admin StudentManagement and Recruiter Dashboard use this
export const getAllStudents = async (req, res) => {
    try {
        const db = admin.database();
        const snapshot = await db.ref("users").once("value");

        if (!snapshot.exists()) {
            return res.status(200).json([]);
        }

        const data = snapshot.val();
        const students = Object.entries(data)
            .map(([uid, userData]) => ({
                id: uid,
                uid,
                ...userData,
            }))
            .filter(u => u.role === "student"); // Only return students

        res.status(200).json(students);
    } catch (error) {
        console.error("Error fetching all students:", error);
        res.status(500).json({ error: "Failed to fetch students" });
    }
};

// 1.c GET students by filter (for shortlisting)
export const getStudentsByFilter = async (req, res) => {
    try {
        const { branch, minCgpa } = req.query;
        const db = admin.database();
        const snapshot = await db.ref("users").once("value");

        if (!snapshot.exists()) {
            return res.status(200).json([]);
        }

        const data = snapshot.val();
        let students = Object.entries(data)
            .map(([uid, userData]) => ({ id: uid, uid, ...userData }))
            .filter(u => u.role === "student" && u.status !== 'Placed' && u.status !== 'Opted-out');

        if (branch) {
            students = students.filter(s => s.branch && s.branch.toUpperCase() === branch.toUpperCase());
        }
        if (minCgpa) {
            const cgpaThreshold = parseFloat(minCgpa);
            students = students.filter(s => s.cgpa && parseFloat(s.cgpa) >= cgpaThreshold);
        }

        res.status(200).json(students);
    } catch (error) {
        console.error("Error fetching filtered students:", error);
        res.status(500).json({ error: "Failed to fetch filtered students" });
    }
};

// 1.a UPDATE student placement status
export const updateStudentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, companyName, offerLetterUrl } = req.body;
        const db = admin.database();
        await db.ref(`users/${id}`).update({
            status,
            ...(status === 'Placed' ? { companyName, offerLetterUrl } : {})
        });
        res.status(200).json({ message: "Student status updated" });
    } catch (error) {
        console.error("Error updating student status:", error);
        res.status(500).json({ error: "Failed to update student status" });
    }
};

// 1.b UPDATE student resume status
export const updateStudentResume = async (req, res) => {
    try {
        const { id } = req.params;
        const { isResumeVerified, adminResumeComment } = req.body;
        const db = admin.database();
        await db.ref(`users/${id}`).update({
            isResumeVerified,
            adminResumeComment
        });
        res.status(200).json({ message: "Student resume updated" });
    } catch (error) {
        console.error("Error updating student resume:", error);
        res.status(500).json({ error: "Failed to update student resume" });
    }
};

// 2. GET all questions from Firestore `questions` collection
export const getQuestions = async (req, res) => {
    try {
        const firestore = admin.firestore();
        const snapshot = await firestore.collection("questions").get();

        const questions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(questions);
    } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({ error: "Failed to fetch questions" });
    }
};

// 3. POST a new question (Admin adds a PYQ)
export const addQuestion = async (req, res) => {
    try {
        const { companyId, companyName, text, link, author, difficulty, tags } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Question text is required" });
        }

        const firestore = admin.firestore();
        const newQuestion = {
            companyId: companyId || "",
            companyName: companyName || "Unknown",
            text,
            link: link || "",
            author: author || "Placement Cell (Admin)",
            difficulty: difficulty || "Medium",
            tags: Array.isArray(tags) ? tags : [],
            status: "approved",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await firestore.collection("questions").add(newQuestion);
        res.status(201).json({ id: docRef.id, ...newQuestion });
    } catch (error) {
        console.error("Error adding question:", error);
        res.status(500).json({ error: "Failed to add question" });
    }
};

// 4. PUT — Approve a question (set status = "approved")
export const approveQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body || {};
        const firestore = admin.firestore();
        await firestore.collection("questions").doc(id).update({ 
            ...updates,
            status: "approved" 
        });
        res.status(200).json({ message: "Question approved" });
    } catch (error) {
        console.error("Error approving question:", error);
        res.status(500).json({ error: "Failed to approve question" });
    }
};

// 5. POST — Reject a question
export const rejectQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const firestore = admin.firestore();
        await firestore.collection("questions").doc(id).update({
            status: "rejected",
            rejectionReason: reason || "No reason provided",
            rejectedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(200).json({ message: "Question rejected" });
    } catch (error) {
        console.error("Error rejecting question:", error);
        res.status(500).json({ error: "Failed to reject question" });
    }
};

// ── Recruiter JAF (Job Announcement Form) Management ─────────

// 6. GET JAFs via Company Name or globally
export const getJafs = async (req, res) => {
    try {
        const { companyName } = req.query;
        const firestore = admin.firestore();
        
        let query = firestore.collection("opportunities");
        
        if (companyName) {
            query = query.where("name", "==", companyName);
        }
        
        const snapshot = await query.get();
        let jafs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Sort in memory to avoid Firebase Composite Index requirement
        jafs.sort((a, b) => {
            const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
            return timeB - timeA;
        });

        res.status(200).json(jafs);
    } catch (error) {
        console.error("Error fetching JAFs:", error);
        res.status(500).json({ error: "Failed to fetch JAFs" });
    }
};

// 7. POST a new JAF (Opportunity)
export const createJaf = async (req, res) => {
    try {
        const jafData = req.body;
        
        if (!jafData.name || !jafData.roles) {
            return res.status(400).json({ error: "Company name and roles are required" });
        }

        const firestore = admin.firestore();
        const newJaf = {
            ...jafData,
            applicantsCount: 0,
            shortlistedCount: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await firestore.collection("opportunities").add(newJaf);
        res.status(201).json({ id: docRef.id, ...newJaf });
    } catch (error) {
        console.error("Error creating JAF:", error);
        res.status(500).json({ error: "Failed to create JAF" });
    }
};

// 8. PUT (Update) an existing JAF
export const updateJaf = async (req, res) => {
    try {
        const { id } = req.params;
        const jafData = req.body;
        
        const firestore = admin.firestore();
        const docRef = firestore.collection("opportunities").doc(id);
        
        // Strip createdAt to preserve original
        if (jafData.createdAt) delete jafData.createdAt;

        await docRef.update({
            ...jafData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.status(200).json({ message: "JAF updated successfully", id });
    } catch (error) {
        console.error("Error updating JAF:", error);
        res.status(500).json({ error: "Failed to update JAF" });
    }
};

// ── Admin Dashboard & Analytics ─────────

// 9. GET Placement Overview Stats
export const getPlacementOverview = async (req, res) => {
    try {
        const db = admin.database();
        const firestore = admin.firestore();

        // 1. Fetch Students
        const usersSnapshot = await db.ref("users").once("value");
        let totalStudents = 0;
        let placedStudents = 0;
        let avgPackage = 0; // Simplified for now, would need actual CTC data normally

        if (usersSnapshot.exists()) {
            const users = Object.values(usersSnapshot.val());
            const students = users.filter(u => u.role === "student");
            totalStudents = students.length;
            placedStudents = students.filter(s => s.status === 'Placed').length;
        }

        // 2. Fetch Active Drives
        const jafsSnapshot = await firestore.collection("opportunities").get();
        const totalDrives = jafsSnapshot.docs.length;

        // Note: For a real production app, average package would sum a designated `ctc` field 
        // across placed students or jafs, but here we just return a placeholder formatted stat.

        res.status(200).json({
            stats: {
                totalStudents,
                placedStudents,
                totalDrives,
                placementPercentage: totalStudents ? Math.round((placedStudents / totalStudents) * 100) : 0,
            }
        });
    } catch (error) {
        console.error("Error fetching overview stats:", error);
        res.status(500).json({ error: "Failed to fetch overview stats" });
    }
};

// ── Admin Notifications ─────────

// 10. POST — Create an admin notification
export const createNotification = async (req, res) => {
    try {
        const { title, message, targetType, targetValue } = req.body;
        if (!title || !message) {
            return res.status(400).json({ error: "Title and message are required" });
        }

        const firestore = admin.firestore();
        const notification = {
            title,
            message,
            targetType: targetType || "all", // "all", "branch", "status", "company"
            targetValue: targetValue || "",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await firestore.collection("admin_notifications").add(notification);
        res.status(201).json({ id: docRef.id, ...notification });
    } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({ error: "Failed to create notification" });
    }
};

// 11. GET — List admin notifications
export const getNotifications = async (req, res) => {
    try {
        const firestore = admin.firestore();
        const snapshot = await firestore.collection("admin_notifications")
            .orderBy("createdAt", "desc")
            .limit(50)
            .get();

        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
        }));

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};
