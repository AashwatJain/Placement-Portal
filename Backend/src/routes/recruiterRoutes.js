import express from "express";
import * as recruiterController from "../controllers/recruiterController.js";

const router = express.Router();

// Recruiter Data Persistence (per-recruiter, keyed by UID)
router.get("/candidate-statuses/:uid", recruiterController.getCandidateStatuses);
router.put("/candidate-statuses/:uid", recruiterController.saveCandidateStatuses);
router.get("/candidate-notes/:uid", recruiterController.getCandidateNotes);
router.put("/candidate-notes/:uid", recruiterController.saveCandidateNotes);

// Notify Candidates
router.post("/notify-candidates", recruiterController.notifyCandidates);

export default router;
