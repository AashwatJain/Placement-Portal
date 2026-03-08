// src/services/firebaseDb.js
// ─────────────────────────────────────────────────────────────
// Centralized Firebase Realtime Database operations.
// Every direct ref/set/get/onValue call that was in page
// components now lives here.
// ─────────────────────────────────────────────────────────────

import { fetchUserApplications, registerForOpportunity as apiRegisterForOpportunity } from "./studentApi";

// ── Read user's registered applications (one‑shot) ──────────

export async function getUserApplications(uid) {
  return fetchUserApplications(uid);
}

// ── Live listener on user's applications ────────────────────
// Now replaced with a one-time API fetch to match backend.
// Returns a dummy unsubscribe function to avoid breaking `useEffect` cleanup.

export function onUserApplications(uid, callback) {
  fetchUserApplications(uid)
    .then((data) => callback(data))
    .catch((err) => {
      console.error("Fetch user applications error:", err);
      callback([]);
    });

  return () => { }; // dummy unsubscribe
}

// ── Register for an opportunity ─────────────────────────────

export async function registerForOpportunity(uid, oppId, appData) {
  return apiRegisterForOpportunity(uid, oppId, appData);
}
