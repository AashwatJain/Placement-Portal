import express from "express";
import * as adminController from "../controllers/adminController.js";

const router = express.Router();

// 1. Student Listing (used by Admin StudentManagement + Recruiter Dashboard)
router.get("/students", adminController.getAllStudents);

// 2. Question Bank CRUD
router.get("/questions", adminController.getQuestions);
router.post("/questions", adminController.addQuestion);
router.put("/questions/:id/approve", adminController.approveQuestion);
router.delete("/questions/:id", adminController.deleteQuestion);

// 3. Recruiter JAF Management
router.get("/jafs", adminController.getJafs);
router.post("/jafs", adminController.createJaf);
router.put("/jafs/:id", adminController.updateJaf);

export default router;
