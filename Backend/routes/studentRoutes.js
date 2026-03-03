import express from "express";
const router = express.Router();

// Sample Route
router.get("/test", (req, res) => {
    res.json({ message: "Student routes are working!" });
});

export default router;