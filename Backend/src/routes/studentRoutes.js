import express from "express";
import studentController from "../controllers/studentController.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// 1. Route for updating text data (Name, CGPA, Branch, etc.)
router.put("/update-profile", studentController.updateStudentProfile);

// 2. Route for Profile Section: Uploading Avatar and Primary Resume
// Uses upload.fields() to handle multiple distinct files in the same form
router.post(
    "/upload-docs",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "resume", maxCount: 1 }
    ]),
    studentController.uploadDocuments
);

// 3. Route for Vault Section: Uploading a single target-specific resume
// Uses upload.single() because it only expects one file named 'vaultResume'
router.post(
    "/upload-vault",
    upload.single("vaultResume"),
    studentController.uploadVaultResume
);

// 4. Route for Vault Section: Deleting a single target-specific resume
router.delete("/delete-vault-resume/:uid/:id", studentController.deleteVaultResume);

// 4b. Route for setting a vault resume as primary
router.put("/set-primary-resume", studentController.setPrimaryResume);

import codingStatsController from "../controllers/codingStatsController.js";
// 5. Route for fetching coding platform stats
router.get("/coding-stats/:uid", codingStatsController.getCodingStats);

import * as dataController from "../controllers/dataController.js";
// 6. Routes for fetching centralized data (Companies, Opportunities, Applications)
router.get("/companies", dataController.getCompanies);
router.get("/opportunities", dataController.getOpportunities);
router.get("/applications/:uid", dataController.getUserApplications);
router.post("/applications/:uid/register", dataController.registerUserApplication);

// 7. Routes for Interview Experiences
router.get("/experiences", dataController.getExperiences);
router.post("/experiences", dataController.addExperience);
router.post("/experiences/:id/toggle-like", dataController.toggleExperienceLike);

// 8. Routes for Notifications
router.get("/notifications", dataController.getNotifications);
router.post("/notifications", dataController.addNotification);
router.put("/notifications/mark-read", dataController.markAllNotificationsRead);
router.delete("/notifications/:id", dataController.deleteNotification);

// 9. Routes for Practice Page (Student-facing)
router.get("/questions", dataController.getApprovedQuestions);
router.get("/solved-questions/:uid", dataController.getSolvedQuestions);
router.post("/solved-questions/:uid", dataController.toggleSolvedQuestion);

export default router;