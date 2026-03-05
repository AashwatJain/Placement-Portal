import express from "express";
import studentController from "../controllers/studentController.js";

const router = express.Router();

// Yeh path bilkul exact hona chahiye jo Axios use kar raha hai
router.put("/update-profile", studentController.updateStudentProfile);

export default router;