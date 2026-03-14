import axios from "axios";
import { API_BASE_URL } from "../config/api";

// ── Active Drives ─────────────────────────────────────────────

export async function fetchActiveDrives() {
    const response = await axios.get(`${API_BASE_URL}/api/recruiter/drives/active`);
    return response.data;
}

export async function extendDriveTime(id, extensionMinutes) {
    const response = await axios.post(`${API_BASE_URL}/api/recruiter/drives/${id}/extend`, { extensionMinutes });
    return response.data;
}

export async function endDrive(id) {
    const response = await axios.post(`${API_BASE_URL}/api/recruiter/drives/${id}/end`);
    return response.data;
}

// ── TnP Connect ───────────────────────────────────────────────

export async function fetchTickets() {
    const response = await axios.get(`${API_BASE_URL}/api/recruiter/tickets`);
    return response.data;
}

export async function createTicket(data) {
    const response = await axios.post(`${API_BASE_URL}/api/recruiter/tickets`, data);
    return response.data;
}

export async function fetchTicketMessages(id) {
    const response = await axios.get(`${API_BASE_URL}/api/recruiter/tickets/${id}/messages`);
    return response.data;
}

export async function addTicketMessage(id, data) {
    const response = await axios.post(`${API_BASE_URL}/api/recruiter/tickets/${id}/messages`, data);
    return response.data;
}

export async function fetchEmergencyContacts() {
    const response = await axios.get(`${API_BASE_URL}/api/recruiter/emergency-contacts`);
    return response.data;
}

// ── Recruiter Data Persistence ────────────────────────────────

export async function fetchCandidateStatuses(uid) {
    const response = await axios.get(`${API_BASE_URL}/api/recruiter/candidate-statuses/${uid}`);
    return response.data;
}

export async function saveCandidateStatuses(uid, data) {
    const response = await axios.put(`${API_BASE_URL}/api/recruiter/candidate-statuses/${uid}`, data);
    return response.data;
}

export async function fetchCandidateNotes(uid) {
    const response = await axios.get(`${API_BASE_URL}/api/recruiter/candidate-notes/${uid}`);
    return response.data;
}

export async function saveCandidateNotes(uid, data) {
    const response = await axios.put(`${API_BASE_URL}/api/recruiter/candidate-notes/${uid}`, data);
    return response.data;
}

export async function fetchShortlistedIds(uid) {
    const response = await axios.get(`${API_BASE_URL}/api/recruiter/shortlisted/${uid}`);
    return response.data;
}

export async function saveShortlistedIds(uid, ids) {
    const response = await axios.put(`${API_BASE_URL}/api/recruiter/shortlisted/${uid}`, { ids });
    return response.data;
}

// ── Broadcasts ────────────────────────────────────────────────

export async function fetchBroadcasts() {
    const response = await axios.get(`${API_BASE_URL}/api/recruiter/broadcasts`);
    return response.data;
}

export async function createBroadcast(data) {
    const response = await axios.post(`${API_BASE_URL}/api/recruiter/broadcasts`, data);
    return response.data;
}

