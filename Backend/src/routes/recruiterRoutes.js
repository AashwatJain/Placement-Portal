import express from "express";
import * as recruiterController from "../controllers/recruiterController.js";

const router = express.Router();

router.get("/candidate-statuses/:uid", recruiterController.getCandidateStatuses);
router.get("/candidate-notes/:uid", recruiterController.getCandidateNotes);

export default router;
