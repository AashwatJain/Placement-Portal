// src/services/firebaseDb.js
// ─────────────────────────────────────────────────────────────
// Centralized Firebase Realtime Database operations.
// Every direct ref/set/get/onValue call that was in page
// components now lives here.
// ─────────────────────────────────────────────────────────────

import { ref, set, get, onValue } from "firebase/database";
import { db } from "../config/firebase";

// ── Read user's registered applications (one‑shot) ──────────

export async function getUserApplications(uid) {
  const snap = await get(ref(db, `users/${uid}/applications`));
  if (!snap.exists()) return {};
  return snap.val();
}

// ── Live listener on user's applications ────────────────────
// Returns the unsubscribe function (call it in cleanup).

export function onUserApplications(uid, callback) {
  return onValue(ref(db, `users/${uid}/applications`), (snap) => {
    if (snap.exists()) {
      const data = snap.val();
      callback(
        Object.entries(data).map(([id, v]) => ({ id, ...v }))
      );
    } else {
      callback([]);
    }
  });
}

// ── Register for an opportunity ─────────────────────────────

export async function registerForOpportunity(uid, oppId, appData) {
  await set(ref(db, `users/${uid}/applications/${oppId}`), appData);
}
