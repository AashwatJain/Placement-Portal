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
        const firestore = admin.firestore();
        await firestore.collection("questions").doc(id).update({ status: "approved" });
        res.status(200).json({ message: "Question approved" });
    } catch (error) {
        console.error("Error approving question:", error);
        res.status(500).json({ error: "Failed to approve question" });
    }
};

// 5. DELETE — Reject/remove a question
export const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const firestore = admin.firestore();
        await firestore.collection("questions").doc(id).delete();
        res.status(200).json({ message: "Question deleted" });
    } catch (error) {
        console.error("Error deleting question:", error);
        res.status(500).json({ error: "Failed to delete question" });
    }
};
