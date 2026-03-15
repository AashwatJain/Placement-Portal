// middlewares/rbac.middleware.js
// ─────────────────────────────────────────────────────────────
// Role-Based Access Control middleware for admin routes.
//
// Roles (highest → lowest privilege):
//   super_admin  → Full access (settings, role mgmt, delete)
//   placement_officer → Read + Write (no settings/roles)
//   viewer       → Read-only across all modules
//
// Usage in routes:
//   router.get("/data",  requireRole("viewer"),      handler);
//   router.post("/data", requireRole("placement_officer"), handler);
//   router.delete("/x",  requireRole("super_admin"), handler);
// ─────────────────────────────────────────────────────────────

import admin from "firebase-admin";

// ── Role hierarchy (index = privilege level) ────────────────
const ROLE_HIERARCHY = ["viewer", "placement_officer", "super_admin"];

/**
 * Extracts and verifies the Firebase ID token from the Authorization header.
 * Attaches `req.user` with { uid, email, role } for downstream handlers.
 */
export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Missing or malformed Authorization header" });
        }

        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        // Fetch user profile from Realtime Database to get role
        const userSnapshot = await admin.database().ref(`users/${decodedToken.uid}`).once("value");

        if (!userSnapshot.exists()) {
            return res.status(403).json({ error: "User profile not found" });
        }

        const userData = userSnapshot.val();

        // Map legacy "admin" role to the granular admin role stored on the profile
        // Default to "viewer" if no admin sub-role is set
        let role = userData.role;
        if (role === "admin") {
            role = userData.adminRole || "placement_officer";
        }

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email || userData.email,
            role,
            name: userData.name || "Admin",
        };

        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);

        if (error.code === "auth/id-token-expired") {
            return res.status(401).json({ error: "Token expired, please re-authenticate" });
        }

        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

/**
 * Returns middleware that checks if the authenticated user has
 * at least the specified minimum role level.
 *
 * @param {string} minimumRole - One of "viewer", "placement_officer", "super_admin"
 */
export const requireRole = (minimumRole) => {
    const minLevel = ROLE_HIERARCHY.indexOf(minimumRole);

    if (minLevel === -1) {
        throw new Error(`Invalid role "${minimumRole}". Must be one of: ${ROLE_HIERARCHY.join(", ")}`);
    }

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const userLevel = ROLE_HIERARCHY.indexOf(req.user.role);

        // Allow "admin" as a catch-all for legacy data (treat as placement_officer)
        const effectiveLevel = userLevel === -1
            ? ROLE_HIERARCHY.indexOf("placement_officer")
            : userLevel;

        if (effectiveLevel < minLevel) {
            return res.status(403).json({
                error: "Insufficient permissions",
                required: minimumRole,
                current: req.user.role,
            });
        }

        next();
    };
};
