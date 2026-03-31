import admin from "firebase-admin";

export const getAllStudents = async (req, res) => {
    try {
        const db = admin.database();
        const snapshot = await db.ref("users").once("value");

        if (!snapshot.exists()) {
            return res.status(200).json([]);
        }

        const data = snapshot.val();
        const students = Object.entries(data)
            .map(([uid, userData]) => {
                const fullName = userData.fullName || userData.name || userData.email?.split("@")[0] || "Unknown";
                return {
                    id: uid,
                    uid,
                    ...userData,
                    fullName,
                    name: fullName,
                    status: userData.status || "Unplaced",
                };
            })
            .filter(u => u.role === "student");

        res.status(200).json(students);
    } catch (error) {
        console.error("Error fetching all students:", error);
        res.status(500).json({ error: "Failed to fetch students" });
    }
};

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

export const updateJaf = async (req, res) => {
    try {
        const { id } = req.params;
        const jafData = req.body;
        
        const firestore = admin.firestore();
        const docRef = firestore.collection("opportunities").doc(id);
        
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

export const deleteJaf = async (req, res) => {
    try {
        const { id } = req.params;
        const firestore = admin.firestore();
        await firestore.collection("opportunities").doc(id).delete();
        res.status(200).json({ message: "JAF deleted successfully", id });
    } catch (error) {
        console.error("Error deleting JAF:", error);
        res.status(500).json({ error: "Failed to delete JAF" });
    }
};

export const getPlacementOverview = async (req, res) => {
    try {
        const db = admin.database();
        const firestore = admin.firestore();

        const usersSnapshot = await db.ref("users").once("value");
        let totalStudents = 0;
        let placedStudents = 0;
        let avgPackage = 0;

        if (usersSnapshot.exists()) {
            const users = Object.values(usersSnapshot.val());
            const students = users.filter(u => u.role === "student");
            totalStudents = students.length;
            placedStudents = students.filter(s => s.status === 'Placed').length;
        }

        const jafsSnapshot = await firestore.collection("opportunities").get();
        const totalDrives = jafsSnapshot.docs.length;

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
            targetType: targetType || "all",
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

export const updateStudentApplication = async (req, res) => {
    try {
        const { id, oppId } = req.params;
        const { stepIndex, done, date, newStatus } = req.body;

        const db = admin.database();
        const appRef = db.ref(`users/${id}/applications/${oppId}`);
        const appSnap = await appRef.once("value");

        if (!appSnap.exists()) {
            return res.status(404).json({ error: "Application not found" });
        }

        const appData = appSnap.val();
        const timeline = appData.timeline || [];

        if (stepIndex !== undefined && stepIndex >= 0 && stepIndex < timeline.length) {
            if (done) {
                const today = date || new Date().toISOString().slice(0, 10);
                for (let i = 0; i <= stepIndex; i++) {
                    timeline[i].done = true;
                    if (!timeline[i].date) timeline[i].date = today;
                }
            } else {
                for (let i = stepIndex; i < timeline.length; i++) {
                    timeline[i].done = false;
                }
            }
        }

        const status = newStatus || appData.status;

        await appRef.update({ timeline, status });

        const stepName = stepIndex !== undefined ? timeline[stepIndex]?.step : status;
        const company = appData.company || "a company";

        const stepMessages = {
            "Applied":           `Your application for ${company} has been received and confirmed by the placement cell.`,
            "Shortlisted":       `Great news! You've been shortlisted for ${company}. Keep an eye out for next steps.`,
            "Online Assessment": `The Online Assessment round for ${company} has been updated. Please check your timeline for details.`,
            "OA/Assessment":     `The OA/Assessment round for ${company} has been updated. Please check your timeline for details.`,
            "OA Result":         `OA results for ${company} are out! Check your application timeline for details.`,
            "Interview":         `Interview update for ${company} — please check your application timeline for schedule details.`,
            "Interview Result":  `Interview results for ${company} have been updated. Check your timeline now!`,
            "Final Decision":    `🎉 Final decision for ${company} is in! Check your application for the outcome.`,
            "Decision Pending":  `Your application for ${company} is under final review. Hang tight!`,
            "Rejected":          `We're sorry — your application for ${company} was not shortlisted this time. Don't lose heart, keep preparing!`,
            "Offered":           `🎉 Congratulations! You've received an offer from ${company}! Check your application for details.`,
        };

        let notifText;
        if (done && stepMessages[stepName]) {
            notifText = stepMessages[stepName];
        } else if (done) {
            notifText = `Update from Placement Cell: "${stepName}" stage for ${company} has been completed.`;
        } else {
            notifText = `Placement Cell has revised the "${stepName}" stage for your ${company} application. Please review your timeline.`;
        }

        const firestore = admin.firestore();
        await firestore.collection("notifications").add({
            text: notifText,
            type: "shortlist",
            target: id,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(200).json({ message: "Application updated & student notified", timeline, status });
    } catch (error) {
        console.error("Error updating student application:", error);
        res.status(500).json({ error: "Failed to update application" });
    }
};

