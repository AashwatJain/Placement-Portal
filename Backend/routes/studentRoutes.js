const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// Yeh path bilkul exact hona chahiye jo Axios use kar raha hai
router.put("/update-profile", studentController.updateStudentProfile);

module.exports = router;