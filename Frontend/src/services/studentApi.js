
import axios from "axios";
import { API_BASE_URL } from "../config/api";

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

export async function setPrimaryResume(uid, resumeId, token) {
  const response = await axios.put(
    `${API_BASE_URL}/api/student/set-primary-resume`,
    { uid, resumeId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

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

