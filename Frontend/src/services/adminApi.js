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

// ── Questions (Admin Question Bank) ─────────────────────────

export async function fetchQuestions() {
    const response = await axios.get(`${API_BASE_URL}/api/admin/questions`);
    return response.data;
}

export async function addQuestion(data) {
    const response = await axios.post(`${API_BASE_URL}/api/admin/questions`, data);
    return response.data;
}

export async function approveQuestion(id) {
    const response = await axios.put(`${API_BASE_URL}/api/admin/questions/${id}/approve`);
    return response.data;
}

export async function deleteQuestion(id) {
    const response = await axios.delete(`${API_BASE_URL}/api/admin/questions/${id}`);
    return response.data;
}
