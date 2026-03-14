import express from "express";
import * as recruiterController from "../controllers/recruiterController.js";

const router = express.Router();

// 1. Active Drives
router.get("/drives/active", recruiterController.getActiveDrives);
router.post("/drives/:id/extend", recruiterController.extendDriveTime);
router.post("/drives/:id/end", recruiterController.endDrive);

// 2. TnP Connect (Support Tickets)
router.get("/tickets", recruiterController.getTickets);
router.post("/tickets", recruiterController.createTicket);
router.get("/tickets/:id/messages", recruiterController.getTicketMessages);
router.post("/tickets/:id/messages", recruiterController.addTicketMessage);

// 3. Emergency Contacts
router.get("/emergency-contacts", recruiterController.getEmergencyContacts);

// 4. Recruiter Data Persistence (per-recruiter, keyed by UID)
router.get("/candidate-statuses/:uid", recruiterController.getCandidateStatuses);
router.put("/candidate-statuses/:uid", recruiterController.saveCandidateStatuses);
router.get("/candidate-notes/:uid", recruiterController.getCandidateNotes);
router.put("/candidate-notes/:uid", recruiterController.saveCandidateNotes);
router.get("/shortlisted/:uid", recruiterController.getShortlistedIds);
router.put("/shortlisted/:uid", recruiterController.saveShortlistedIds);

// 5. Broadcasts
router.get("/broadcasts", recruiterController.getBroadcasts);
router.post("/broadcasts", recruiterController.createBroadcast);

export default router;

