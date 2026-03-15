/**
 * atsRoutes.js
 *
 * Routes for ATS (Applicant Tracking System) resume scoring.
 *
 * POST /api/ats/calculate
 *   Accepts: multipart form with resumeFile (PDF) + jobDescription (text)
 *   Returns: { atsScore: 78.5 }
 */

import express from "express";
import multer from "multer";
import atsController from "../controllers/atsController.js";

const router = express.Router();

// Memory storage — file stays in req.file.buffer (no disk write)
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

router.post(
  "/calculate",
  memoryUpload.single("resumeFile"),
  atsController.calculateAtsScore
);

export default router;
