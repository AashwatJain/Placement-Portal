// src/services/adminApi.js
// ─────────────────────────────────────────────────────────────
// API calls for Admin and Recruiter pages.
// ─────────────────────────────────────────────────────────────

import axios from "axios";
import { API_BASE_URL } from "../config/api";

// ── Students (used by Admin + Recruiter) ────────────────────

export async function fetchAllStudents() {
    const response = await axios.get(`${API_BASE_URL}/api/admin/students`);
    return response.data;
}

export async function fetchFilteredStudents(filters = {}) {
    const params = new URLSearchParams();
    if (filters.branch) params.append('branch', filters.branch);
    if (filters.minCgpa) params.append('minCgpa', filters.minCgpa);
    const response = await axios.get(`${API_BASE_URL}/api/admin/students/filter?${params.toString()}`);
    return response.data;
}

export async function updateStudentStatus(id, data) {
    const response = await axios.put(`${API_BASE_URL}/api/admin/students/${id}/status`, data);
    return response.data;
}

export async function updateStudentResume(id, data) {
    const response = await axios.put(`${API_BASE_URL}/api/admin/students/${id}/resume`, data);
    return response.data;
}

// ── Questions (Admin Question Bank) ─────────────────────────

export async function fetchQuestions() {
    const response = await axios.get(`${API_BASE_URL}/api/admin/questions`);
    return response.data;
}

export async function addQuestion(data) {
    const response = await axios.post(`${API_BASE_URL}/api/admin/questions`, data);
    return response.data;
}

export async function approveQuestion(id, data = {}) {
    const response = await axios.put(`${API_BASE_URL}/api/admin/questions/${id}/approve`, data);
    return response.data;
}

export async function rejectQuestion(id, reason) {
    const response = await axios.post(`${API_BASE_URL}/api/admin/questions/${id}/reject`, { reason });
    return response.data;
}

// ── Recruiter JAFs ──────────────────────────────────────────

export async function fetchJafs(companyName) {
    const url = companyName ? `${API_BASE_URL}/api/admin/jafs?companyName=${encodeURIComponent(companyName)}` : `${API_BASE_URL}/api/admin/jafs`;
    const response = await axios.get(url);
    return response.data;
}

export async function createJaf(data) {
    const response = await axios.post(`${API_BASE_URL}/api/admin/jafs`, data);
    return response.data;
}

export async function updateJaf(id, data) {
    const response = await axios.put(`${API_BASE_URL}/api/admin/jafs/${id}`, data);
    return response.data;
}

// ── Admin Dashboard API ─────────
export async function fetchPlacementOverview() {
    const response = await axios.get(`${API_BASE_URL}/api/admin/stats/placement-overview`);
    return response.data;
}

// ── Admin Notifications ─────────
export async function createNotification(data) {
    const response = await axios.post(`${API_BASE_URL}/api/admin/notifications`, data);
    return response.data;
}

export async function fetchNotifications() {
    const response = await axios.get(`${API_BASE_URL}/api/admin/notifications`);
    return response.data;
}
