import admin from "firebase-admin";
import { sendEmail } from "../utils/sendEmail.js";

// ── Recruiter Controller ─────────────────────────────────────────

// ── Recruiter Data Persistence (Statuses & Notes) ────────────────

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

// GET pipeline statuses for a recruiter
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

// PUT pipeline statuses for a recruiter
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

// GET private notes for a recruiter
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

// PUT private notes for a recruiter
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

// ── Notify Selected Candidates ────────────────────────────────

const STATUS_MESSAGES = {
    screening: "You are currently in the Screening phase.",
    tech1: "You have advanced to Tech Round 1! We will contact you soon with schedule details.",
    tech2: "You have advanced to Tech Round 2! Great job.",
    hr: "You have reached the HR Round! The final step of the process.",
    selected: "Congratulations! You have been Selected for the role.",
    rejected: "Unfortunately, we have decided not to move forward with your application at this time.",
    "": "Your application status has been updated by the Recruiter."
};

// Map recruiter pipeline status → student-facing application status
const STATUS_TO_APP_STATUS = {
    screening: "Applied",
    tech1: "Shortlisted",
    tech2: "Shortlisted",
    hr: "Shortlisted",
    selected: "Offered",
    rejected: "Rejected",
};

export const notifyCandidates = async (req, res) => {
    try {
        const { candidates } = req.body; // Array of { uid, email, name, status }

        if (!Array.isArray(candidates) || candidates.length === 0) {
            return res.status(400).json({ error: "No candidates provided" });
        }

        const firestore = admin.firestore();
        const db = admin.database();
        let notificationsCreated = 0;
        let emailsTriggered = 0;
        let applicationsUpdated = 0;

        for (const candidate of candidates) {
            const { uid, email, name, status } = candidate;
            const message = STATUS_MESSAGES[status || ""] || STATUS_MESSAGES[""];
            const subject = `Application Status Update: ${status ? status.toUpperCase() : 'Updated'}`;

            // 1. Create In-App Notification targeting this specific UID
            if (uid) {
                await firestore.collection("notifications").add({
                    text: `Hello ${name || 'Candidate'}, ${message}`,
                    type: "shortlist",
                    target: uid,
                    read: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                notificationsCreated++;
            }

            // 2. Send Automated Email
            if (email) {
                await sendEmail({
                    to: email,
                    subject: subject,
                    text: `Hello ${name || 'Candidate'},\n\n${message}\n\nBest regards,\nThe Recruitment Team`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                            <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
                                <h2 style="color: white; margin: 0;">Status Update</h2>
                            </div>
                            <div style="padding: 30px;">
                                <p style="font-size: 16px; color: #333;">Hello <strong>${name || 'Candidate'}</strong>,</p>
                                <p style="font-size: 16px; color: #555; line-height: 1.5;">${message}</p>
                                <br/>
                                <p style="font-size: 14px; color: #777;">Best regards,<br/>The Recruitment Team</p>
                            </div>
                        </div>
                    `
                });
                emailsTriggered++;
            }

            // 3. Sync the pipeline status to the student's actual application records in RTDB
            const appStatus = STATUS_TO_APP_STATUS[status || ""];
            if (uid && appStatus) {
                try {
                    const appsSnap = await db.ref(`users/${uid}/applications`).once("value");
                    if (appsSnap.exists()) {
                        const apps = appsSnap.val();
                        const updates = {};
                        for (const oppId of Object.keys(apps)) {
                            updates[`users/${uid}/applications/${oppId}/status`] = appStatus;
                        }
                        await db.ref().update(updates);
                        applicationsUpdated += Object.keys(apps).length;
                    }
                } catch (err) {
                    console.error(`Failed to update applications for ${uid}:`, err);
                }
            }
        }

        res.status(200).json({ 
            message: "Notifications processed successfully",
            notificationsCreated,
            emailsTriggered,
            applicationsUpdated
        });
    } catch (error) {
        console.error("Error notifying candidates:", error);
        res.status(500).json({ error: "Failed to dispatch notifications" });
    }
};
