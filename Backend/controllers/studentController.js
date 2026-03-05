import db from "../config/firebaseAdmin.js";

const updateStudentProfile = async (req, res) => {
  try {
    const { 
      uid, fullName, phone, location, branch, 
      year, cgpa, github, linkedin, codolio, about 
    } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "UID is missing!" });
    }

    // Firebase Realtime DB Update Logic
    await db.ref("users/" + uid).update({
      fullName:  fullName  || "",
      phone:     phone     || "",
      location:  location  || "",
      branch:    branch    || "",
      year:      year      || "",
      cgpa:      cgpa      || "",
      github:    github    || "",
      linkedin:  linkedin  || "",
      codolio:   codolio   || "",
      about:     about     || "",
      updatedAt: Date.now(),
    });

    res.status(200).json({ message: "Profile updated successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default { updateStudentProfile };