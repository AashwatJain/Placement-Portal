import express from "express";
import * as adminController from "../controllers/adminController.js";

const router = express.Router();

router.get("/students", adminController.getAllStudents);
router.get("/students/filter", adminController.getStudentsByFilter);
router.put("/students/:id/status", adminController.updateStudentStatus);
router.put("/students/:id/resume", adminController.updateStudentResume);
router.put("/students/:id/applications/:oppId/timeline", adminController.updateStudentApplication);

router.get("/questions", adminController.getQuestions);
router.post("/questions", adminController.addQuestion);
router.put("/questions/:id/approve", adminController.approveQuestion);
router.post("/questions/:id/reject", adminController.rejectQuestion);

router.get("/jafs", adminController.getJafs);
router.post("/jafs", adminController.createJaf);
router.put("/jafs/:id", adminController.updateJaf);
router.delete("/jafs/:id", adminController.deleteJaf);

router.get("/stats/placement-overview", adminController.getPlacementOverview);

router.post("/notifications", adminController.createNotification);
router.get("/notifications", adminController.getNotifications);

export default router;
