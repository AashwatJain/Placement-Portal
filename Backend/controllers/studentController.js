const db = require("../config/firebaseAdmin");

exports.addStudent = async (req, res) => {
  try {
    const { uid, fullName, email } = req.body;

    await db.ref("users/" + uid).set({
      fullName,
      email,
      role: "student",
      createdAt: Date.now()
    });

    res.status(200).json({ message: "Student added successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};