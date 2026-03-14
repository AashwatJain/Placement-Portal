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

// ── Centralized Data (Replaced Direct-Firebase calls) ───────

export async function fetchCompanies() {
  const response = await axios.get(`${API_BASE_URL}/api/student/companies`);
  return response.data;
}

export async function fetchOpportunities() {
  const response = await axios.get(`${API_BASE_URL}/api/student/opportunities`);
  return response.data;
}

export async function fetchUserApplications(uid) {
  const response = await axios.get(`${API_BASE_URL}/api/student/applications/${uid}`);
  return response.data;
}

export async function registerForOpportunity(uid, oppId, appData) {
  const response = await axios.post(`${API_BASE_URL}/api/student/applications/${uid}/register`, {
    oppId,
    appData
  });
  return response.data;
}

// ── Interview Experiences ───────────────────────────────────

export async function fetchExperiences() {
  const response = await axios.get(`${API_BASE_URL}/api/student/experiences`);
  return response.data;
}

export async function submitExperience(data, token) {
  const response = await axios.post(`${API_BASE_URL}/api/student/experiences`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function toggleExperienceLike(experienceId, userId, token) {
  const response = await axios.post(
    `${API_BASE_URL}/api/student/experiences/${experienceId}/toggle-like`,
    { userId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

// ── Resume Vault ── Primary Resume ──────────────────────────

export async function setPrimaryResume(uid, resumeId, token) {
  const response = await axios.put(
    `${API_BASE_URL}/api/student/set-primary-resume`,
    { uid, resumeId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

// ── Notifications ───────────────────────────────────────────

export async function fetchNotifications(uid) {
  const params = uid ? `?uid=${uid}` : '';
  const response = await axios.get(`${API_BASE_URL}/api/student/notifications${params}`);
  return response.data;
}

export async function markNotificationsRead() {
  const response = await axios.put(`${API_BASE_URL}/api/student/notifications/mark-read`);
  return response.data;
}

export async function deleteNotificationApi(id) {
  const response = await axios.delete(`${API_BASE_URL}/api/student/notifications/${id}`);
  return response.data;
}

// ── Practice Page ───────────────────────────────────────────

export async function fetchApprovedQuestions() {
  const response = await axios.get(`${API_BASE_URL}/api/student/questions`);
  return response.data;
}

export async function fetchSolvedQuestions(uid) {
  const response = await axios.get(`${API_BASE_URL}/api/student/solved-questions/${uid}`);
  return response.data;
}

export async function toggleSolvedQuestion(uid, questionId, solved, token) {
  const response = await axios.post(
    `${API_BASE_URL}/api/student/solved-questions/${uid}`,
    { questionId, solved },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

// ── LeetCode Auto-Sync ──────────────────────────────────────

export async function syncLeetCode(uid, token) {
  const response = await axios.post(
    `${API_BASE_URL}/api/student/sync-leetcode/${uid}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

