// src/config/api.js
// ─────────────────────────────────────────────────────────────
// Centralized API base URL — change this one place when deploying.
// ─────────────────────────────────────────────────────────────

export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
