// utils/auditLogger.js
// ─────────────────────────────────────────────────────────────
// Append-only audit log writer.
// Every admin write operation should call logAction() to create
// an immutable record in the Firestore `audit_log` collection.
// ─────────────────────────────────────────────────────────────

import admin from "firebase-admin";

/**
 * Writes an immutable audit log entry to Firestore.
 *
 * @param {Object} params
 * @param {string} params.actor      - Admin user UID who performed the action
 * @param {string} params.actorName  - Display name of the actor
 * @param {string} params.action     - Action type (e.g., "update_status", "approve_question")
 * @param {string} params.module     - Module name (e.g., "students", "companies", "questions")
 * @param {string} params.targetId   - ID of the affected record
 * @param {*}      [params.oldValue] - Previous value (optional, for change tracking)
 * @param {*}      [params.newValue] - New value (optional, for change tracking)
 * @param {string} [params.ip]       - IP address of the request (optional)
 *
 * @returns {string} The ID of the created audit log document
 */
export const logAction = async ({
    actor,
    actorName = "Unknown",
    action,
    module,
    targetId,
    oldValue = null,
    newValue = null,
    ip = null,
}) => {
    try {
        const firestore = admin.firestore();

        const entry = {
            actor,
            actorName,
            action,
            module,
            targetId: String(targetId),
            oldValue: oldValue !== null ? JSON.stringify(oldValue) : null,
            newValue: newValue !== null ? JSON.stringify(newValue) : null,
            ip,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await firestore.collection("audit_log").add(entry);
        return docRef.id;
    } catch (error) {
        // Audit logging failures should not break the main operation
        console.error("Audit log write failed:", error.message);
        return null;
    }
};

/**
 * Convenience helper to extract audit context from an Express request.
 * Use this at the start of controller handlers.
 *
 * @param {import("express").Request} req
 * @returns {{ actor: string, actorName: string, ip: string }}
 */
export const getAuditContext = (req) => ({
    actor: req.user?.uid || "unknown",
    actorName: req.user?.name || "Unknown",
    ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || null,
});
