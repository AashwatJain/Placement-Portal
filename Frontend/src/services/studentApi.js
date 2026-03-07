// src/services/studentApi.js
// ─────────────────────────────────────────────────────────────
// Centralized API service for all backend (Express) calls.
// Every axios call that used to be in page components now
// lives here with a single API_BASE_URL import.
// ─────────────────────────────────────────────────────────────

import axios from "axios";
import { API_BASE_URL } from "../config/api";

// ── Profile ─────────────────────────────────────────────────

export async function updateProfile(payload, token) {
  return axios.put(`${API_BASE_URL}/api/student/update-profile`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function uploadDocuments(formData, token) {
  return axios.post(`${API_BASE_URL}/api/student/upload-docs`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
}

// ── Resume Vault ────────────────────────────────────────────

export async function uploadVaultResume(formData, token) {
  return axios.post(`${API_BASE_URL}/api/student/upload-vault`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function deleteVaultResume(uid, resumeId, token) {
  return axios.delete(
    `${API_BASE_URL}/api/student/delete-vault-resume/${uid}/${resumeId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

// ── Coding Stats ────────────────────────────────────────────

export async function fetchCodingStats(uid) {
  const response = await axios.get(
    `${API_BASE_URL}/api/student/coding-stats/${uid}`
  );
  return response.data;
}
