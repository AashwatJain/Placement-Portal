
import { fetchUserApplications, registerForOpportunity as apiRegisterForOpportunity } from "./studentApi";

export async function getUserApplications(uid) {
  return fetchUserApplications(uid);
}

export function onUserApplications(uid, callback) {
  fetchUserApplications(uid)
    .then((data) => callback(data))
    .catch((err) => {
      console.error("Fetch user applications error:", err);
      callback([]);
    });

  return () => { };
}

export async function registerForOpportunity(uid, oppId, appData) {
  return apiRegisterForOpportunity(uid, oppId, appData);
}
