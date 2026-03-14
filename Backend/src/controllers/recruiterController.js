import admin from "firebase-admin";

// ── Recruiter Controller ─────────────────────────────────────────

// 1. GET active drives (Firestore: active_drives, Realtime DB: drive_attendance)
export const getActiveDrives = async (req, res) => {
    try {
        const firestore = admin.firestore();
        const snapshot = await firestore.collection("active_drives").where("status", "==", "active").get();

        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        const drives = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(drives);
    } catch (error) {
        console.error("Error fetching active drives:", error);
        res.status(500).json({ error: "Failed to fetch active drives" });
    }
};

// 2. POST extend drive time
export const extendDriveTime = async (req, res) => {
    try {
        const { id } = req.params;
        const { extensionMinutes } = req.body;
        
        if (!extensionMinutes) {
             return res.status(400).json({ error: "extensionMinutes is required" });
        }

        const firestore = admin.firestore();
        const docRef = firestore.collection("active_drives").doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Drive not found" });
        }

        const currentDuration = doc.data().durationMinutes || 0;
        await docRef.update({
            durationMinutes: currentDuration + parseInt(extensionMinutes),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ message: "Drive extended successfully", id });
    } catch (error) {
        console.error("Error extending drive:", error);
        res.status(500).json({ error: "Failed to extend drive" });
    }
};

// 3. POST end drive
export const endDrive = async (req, res) => {
     try {
        const { id } = req.params;
        const firestore = admin.firestore();
        const docRef = firestore.collection("active_drives").doc(id);
        
        await docRef.update({
            status: "ended",
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ message: "Drive ended successfully", id });
    } catch (error) {
        console.error("Error ending drive:", error);
        res.status(500).json({ error: "Failed to end drive" });
    }
}

// 4. GET support tickets
export const getTickets = async (req, res) => {
    try {
        // In a real app, query by recruiter's company or auth ID
        const firestore = admin.firestore();
        const snapshot = await firestore.collection("support_tickets").orderBy("updatedAt", "desc").get();

        const tickets = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            updatedAt: doc.data().updatedAt ? doc.data().updatedAt.toMillis() : Date.now()
        }));

        res.status(200).json(tickets);
    } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ error: "Failed to fetch tickets" });
    }
};

// 5. POST create ticket
export const createTicket = async (req, res) => {
    try {
        const { title, recruiterId } = req.body;
        if (!title) return res.status(400).json({ error: "Ticket title is required" });

        const firestore = admin.firestore();
        const newTicket = {
            title,
            recruiterId: recruiterId || "unknown",
            status: "pending",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await firestore.collection("support_tickets").add(newTicket);
        res.status(201).json({ id: docRef.id, ...newTicket, updatedAt: Date.now() });

    } catch (error) {
        console.error("Error creating ticket:", error);
        res.status(500).json({ error: "Failed to create ticket" });
    }
}

// 6. GET ticket messages
export const getTicketMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const firestore = admin.firestore();
        const snapshot = await firestore.collection("support_tickets").doc(id).collection("messages").orderBy("timestamp", "asc").get();

        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp ? doc.data().timestamp.toMillis() : Date.now()
        }));

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};

// 7. POST add ticket message
export const addTicketMessage = async (req, res) => {
     try {
        const { id } = req.params;
        const { text, senderRole, senderName, senderId } = req.body;
        
        if (!text) return res.status(400).json({ error: "Message text is required" });

        const firestore = admin.firestore();
        const message = {
            text,
            senderRole: senderRole || "recruiter",
            senderName: senderName || "Recruiter",
            senderId: senderId || "unknown",
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        };

        // Add message
        const docRef = await firestore.collection("support_tickets").doc(id).collection("messages").add(message);
        
        // Update ticket's updatedAt and status
        await firestore.collection("support_tickets").doc(id).update({
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "pending" // Set back to pending since recruiter sent a message
        });

        res.status(201).json({ id: docRef.id, ...message, timestamp: Date.now() });

    } catch (error) {
        console.error("Error adding message:", error);
        res.status(500).json({ error: "Failed to add message" });
    }
}

// 8. GET emergency contacts (Could query DB or return static for now)
export const getEmergencyContacts = async (req, res) => {
    try {
         const firestore = admin.firestore();
         const snapshot = await firestore.collection("emergency_contacts").get();
         
         let contacts = snapshot.docs.map(doc => ({
             id: doc.id,
             ...doc.data()
         }));

         if(contacts.length === 0) {
             // Fallback static data if DB is empty
             contacts = [
                { id: "1", name: "Rahul Sharma", role: "Primary POC", phone: "+91 9876543210", email: "rahul.tnp@nitkkr.ac.in", avatar: "rs" },
                { id: "2", name: "Sneha Verma", role: "Logistics Coord", phone: "+91 9988776655", email: "sneha.tnp@nitkkr.ac.in", avatar: "sv" },
                { id: "3", name: "Prof. AK Gupta", role: "Faculty In-Charge", phone: "+91 9123456789", email: "akgupta@nitkkr.ac.in", avatar: "ag" },
             ];
         }

         res.status(200).json(contacts);
    } catch (error) {
        console.error("Error fetching emergency contacts:", error);
        res.status(500).json({ error: "Failed to fetch emergency contacts" });
    }
}

// ── Recruiter Data Persistence (Statuses, Notes, Shortlists) ─────

// Helper: get/set a recruiter sub-document
const getRecruiterDoc = async (uid, subcollection) => {
    const firestore = admin.firestore();
    const docRef = firestore.collection("recruiter_data").doc(uid);
    const doc = await docRef.get();
    return doc.exists ? (doc.data()[subcollection] || {}) : {};
};

const setRecruiterDoc = async (uid, subcollection, data) => {
    const firestore = admin.firestore();
    const docRef = firestore.collection("recruiter_data").doc(uid);
    await docRef.set({ [subcollection]: data }, { merge: true });
};

// 9. GET pipeline statuses for a recruiter
export const getCandidateStatuses = async (req, res) => {
    try {
        const { uid } = req.params;
        const statuses = await getRecruiterDoc(uid, "candidate_statuses");
        res.status(200).json(statuses);
    } catch (error) {
        console.error("Error fetching candidate statuses:", error);
        res.status(500).json({ error: "Failed to fetch candidate statuses" });
    }
};

// 10. PUT pipeline statuses for a recruiter
export const saveCandidateStatuses = async (req, res) => {
    try {
        const { uid } = req.params;
        const statuses = req.body;
        await setRecruiterDoc(uid, "candidate_statuses", statuses);
        res.status(200).json({ message: "Statuses saved" });
    } catch (error) {
        console.error("Error saving candidate statuses:", error);
        res.status(500).json({ error: "Failed to save candidate statuses" });
    }
};

// 11. GET private notes for a recruiter
export const getCandidateNotes = async (req, res) => {
    try {
        const { uid } = req.params;
        const notes = await getRecruiterDoc(uid, "candidate_notes");
        res.status(200).json(notes);
    } catch (error) {
        console.error("Error fetching candidate notes:", error);
        res.status(500).json({ error: "Failed to fetch candidate notes" });
    }
};

// 12. PUT private notes for a recruiter
export const saveCandidateNotes = async (req, res) => {
    try {
        const { uid } = req.params;
        const notes = req.body;
        await setRecruiterDoc(uid, "candidate_notes", notes);
        res.status(200).json({ message: "Notes saved" });
    } catch (error) {
        console.error("Error saving candidate notes:", error);
        res.status(500).json({ error: "Failed to save candidate notes" });
    }
};

// 13. GET shortlisted candidate IDs for a recruiter
export const getShortlistedIds = async (req, res) => {
    try {
        const { uid } = req.params;
        const data = await getRecruiterDoc(uid, "shortlisted");
        // Stored as { ids: [...] }
        res.status(200).json(data.ids || []);
    } catch (error) {
        console.error("Error fetching shortlisted IDs:", error);
        res.status(500).json({ error: "Failed to fetch shortlisted IDs" });
    }
};

// 14. PUT shortlisted candidate IDs for a recruiter
export const saveShortlistedIds = async (req, res) => {
    try {
        const { uid } = req.params;
        const { ids } = req.body;
        if (!Array.isArray(ids)) {
            return res.status(400).json({ error: "ids must be an array" });
        }
        await setRecruiterDoc(uid, "shortlisted", { ids });
        res.status(200).json({ message: "Shortlisted IDs saved" });
    } catch (error) {
        console.error("Error saving shortlisted IDs:", error);
        res.status(500).json({ error: "Failed to save shortlisted IDs" });
    }
};

// ── Broadcasts ───────────────────────────────────────────────────

// 15. GET all broadcasts (most recent first)
export const getBroadcasts = async (req, res) => {
    try {
        const firestore = admin.firestore();
        const snapshot = await firestore
            .collection("broadcasts")
            .orderBy("createdAt", "desc")
            .get();

        const broadcasts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt ? doc.data().createdAt.toMillis() : Date.now()
        }));

        res.status(200).json(broadcasts);
    } catch (error) {
        console.error("Error fetching broadcasts:", error);
        res.status(500).json({ error: "Failed to fetch broadcasts" });
    }
};

// 16. POST create a new broadcast
export const createBroadcast = async (req, res) => {
    try {
        const { title, body, urgency, recruiterName, recruiterId } = req.body;
        if (!title) return res.status(400).json({ error: "Title is required" });

        const firestore = admin.firestore();
        const broadcast = {
            title,
            body: body || "",
            urgency: urgency || "normal",
            recruiterName: recruiterName || "Recruiter",
            recruiterId: recruiterId || "unknown",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await firestore.collection("broadcasts").add(broadcast);
        res.status(201).json({ id: docRef.id, ...broadcast, createdAt: Date.now() });
    } catch (error) {
        console.error("Error creating broadcast:", error);
        res.status(500).json({ error: "Failed to create broadcast" });
    }
};
