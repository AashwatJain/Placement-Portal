import express from "express";
import studentController from "../controllers/studentController.js";
import codingStatsController from "../controllers/codingStatsController.js";
import * as dataController from "../controllers/dataController.js";
import recommendationController from "../controllers/recommendationController.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.put("/update-profile", studentController.updateStudentProfile);

router.post(
  "/upload-docs",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  studentController.uploadDocuments,
);

router.post(
  "/upload-vault",
  upload.single("vaultResume"),
  studentController.uploadVaultResume,
);

router.delete(
  "/delete-vault-resume/:uid/:id",
  studentController.deleteVaultResume,
);

router.put("/set-primary-resume", studentController.setPrimaryResume);

router.get("/coding-stats/:uid", codingStatsController.getCodingStats);

router.get("/companies", dataController.getCompanies);
router.get("/opportunities", dataController.getOpportunities);
router.get("/applications/:uid", dataController.getUserApplications);
router.post(
  "/applications/:uid/register",
  dataController.registerUserApplication,
);

router.get("/experiences", dataController.getExperiences);
router.post("/experiences", dataController.addExperience);
router.post(
  "/experiences/:id/toggle-like",
  dataController.toggleExperienceLike,
);

router.get("/notifications", dataController.getNotifications);
router.post("/notifications", dataController.addNotification);
router.put("/notifications/mark-read", dataController.markAllNotificationsRead);
router.delete("/notifications/:id", dataController.deleteNotification);

router.get("/questions", dataController.getApprovedQuestions);
router.get("/solved-questions/:uid", dataController.getSolvedQuestions);
router.post("/solved-questions/:uid", dataController.toggleSolvedQuestion);

router.post("/sync-leetcode/:uid", dataController.syncLeetCodeSolved);

router.post("/recommendations", recommendationController.getRecommendations);
router.post("/company-chances", recommendationController.getCompanyChances);

export default router;

