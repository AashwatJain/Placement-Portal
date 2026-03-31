import axios from "axios";
import { API_BASE_URL } from "../config/api";

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

export async function sendCandidateNotifications(candidates, customSubject, customBody) {
    const response = await axios.post(`${API_BASE_URL}/api/recruiter/notify-candidates`, { candidates, customSubject, customBody });
    return response.data;
}
