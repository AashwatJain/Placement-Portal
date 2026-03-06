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

export default router;