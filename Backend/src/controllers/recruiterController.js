import admin from "firebase-admin";
import { sendEmail } from "../utils/sendEmail.js";

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

const STATUS_MESSAGES = {
    screening: "You are currently in the Screening phase.",
    tech1: "You have advanced to Tech Round 1! We will contact you soon with schedule details.",
    tech2: "You have advanced to Tech Round 2! Great job.",
    hr: "You have reached the HR Round! The final step of the process.",
    selected: "Congratulations! You have been Selected for the role.",
    rejected: "Unfortunately, we have decided not to move forward with your application at this time.",
    "": "Your application status has been updated by the Recruiter."
};

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
        const { candidates, customSubject, customBody } = req.body;

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

            const useCustom = customSubject && customBody;
            const message = useCustom ? customBody : (STATUS_MESSAGES[status || ""] || STATUS_MESSAGES[""]);
            const subject = useCustom ? customSubject : `Application Status Update: ${status ? status.toUpperCase() : 'Updated'}`;

            const personalizedBody = useCustom
                ? message.replace(/Dear Candidate/gi, `Dear ${name || 'Candidate'}`)
                : `Hello ${name || 'Candidate'}, ${message}`;

            if (uid) {
                await firestore.collection("notifications").add({
                    text: personalizedBody.substring(0, 300),
                    type: "shortlist",
                    target: uid,
                    read: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                notificationsCreated++;
            }

            if (email) {
                const htmlBody = personalizedBody.split('\n').map(line => line.trim() === '' ? '<br/>' : `<p style="font-size: 15px; color: #555; line-height: 1.6; margin: 4px 0;">${line}</p>`).join('');

                await sendEmail({
                    to: email,
                    subject: subject,
                    text: personalizedBody,
                    html: `
                        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                            <div style="background: linear-gradient(135deg, #d97706, #E89B60); padding: 24px; text-align: center;">
                                <h2 style="color: white; margin: 0; font-size: 20px;">${subject}</h2>
                            </div>
                            <div style="padding: 30px;">
                                ${htmlBody}
                            </div>
                            <div style="padding: 16px 30px; background: #faf5f0; border-top: 1px solid #e2e8f0; text-align: center;">
                                <p style="font-size: 12px; color: #999; margin: 0;">Placement Portal — NIT Kurukshetra</p>
                            </div>
                        </div>
                    `
                });
                emailsTriggered++;
            }

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
