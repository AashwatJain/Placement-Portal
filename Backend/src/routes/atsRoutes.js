
import express from "express";
import multer from "multer";
import atsController from "../controllers/atsController.js";

const router = express.Router();

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
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
