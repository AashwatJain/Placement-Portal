// config/firebaseAdmin.js
// ─────────────────────────────────────────────────────────────
// Backend ke liye Firebase ADMIN SDK use hota hai (client SDK nahi)
// Admin SDK ko service account key chahiye hoti hai.
//
// SETUP STEPS:
// 1. Firebase Console → Project Settings → Service Accounts
// 2. "Generate New Private Key" click karo
// 3. Downloaded JSON file ko backend/config/serviceAccountKey.json rakho
// 4. serviceAccountKey.json ko .gitignore mein zaroor add karo!
// ─────────────────────────────────────────────────────────────

import admin from "firebase-admin";
import { createRequire } from "module";
import 'dotenv/config';

// JSON import karne ka ESM-compatible tarika
const require = createRequire(import.meta.url);
const serviceAccount = require("./serviceAccountKey.json");

// Agar pehle se initialize ho chuka ho toh dobara mat karo
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://placement-portal-c0bdf-default-rtdb.firebaseio.com",
  });
}

const db = admin.database(); // Realtime Database instance

export default db;