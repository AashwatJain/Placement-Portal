import express from "express";
import * as adminController from "../controllers/adminController.js";

const router = express.Router();

// 1. Student Listing (used by Admin StudentManagement + Recruiter Dashboard)
router.get("/students", adminController.getAllStudents);
router.get("/students/filter", adminController.getStudentsByFilter);
router.put("/students/:id/status", adminController.updateStudentStatus);
router.put("/students/:id/resume", adminController.updateStudentResume);

// 2. Question Bank CRUD
router.get("/questions", adminController.getQuestions);
router.post("/questions", adminController.addQuestion);
router.put("/questions/:id/approve", adminController.approveQuestion);
router.post("/questions/:id/reject", adminController.rejectQuestion);

// 3. Recruiter JAF Management
router.get("/jafs", adminController.getJafs);
router.post("/jafs", adminController.createJaf);
router.put("/jafs/:id", adminController.updateJaf);

// 4. Admin Dashboard
router.get("/stats/placement-overview", adminController.getPlacementOverview);

// 5. Admin Notifications
router.post("/notifications", adminController.createNotification);
router.get("/notifications", adminController.getNotifications);

export default router;
