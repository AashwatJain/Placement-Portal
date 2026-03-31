import db from "../config/firebaseAdmin.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
const updateStudentProfile = async (req, res) => {
  try {
    const {
      uid, fullName, phone, location, branch,
      year, cgpa, github, linkedin, codolio, about,
      leetcode, codeforces, codechef,
      gender, marks10th, marks12th, activeBacklogs, backlogHistory
    } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "UID is missing!" });
    }

    await db.ref("users/" + uid).update({
      fullName: fullName || "",
      phone: phone || "",
      location: location || "",
      branch: branch || "",
      year: year || "",
      cgpa: cgpa || "",
      github: github || "",
      linkedin: linkedin || "",
      codolio: codolio || "",
      leetcode: leetcode || "",
      codeforces: codeforces || "",
      codechef: codechef || "",
      about: about || "",
      gender: gender || "",
      marks10th: marks10th || "",
      marks12th: marks12th || "",
      activeBacklogs: activeBacklogs || "0",
      backlogHistory: backlogHistory || "0",
      updatedAt: Date.now(),
    });

    res.status(200).json({ message: "Profile updated successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const uploadDocuments = async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "UID is required!" });
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const resumeLocalPath = req.files?.resume?.[0]?.path;

    let avatarUrl = "";
    let resumeUrl = "";

    if (avatarLocalPath) {
      const avatarUpload = await uploadOnCloudinary(avatarLocalPath);
      if (avatarUpload) avatarUrl = avatarUpload.secure_url;
    }

    if (resumeLocalPath) {
      const resumeUpload = await uploadOnCloudinary(resumeLocalPath);
      if (resumeUpload) resumeUrl = resumeUpload.secure_url;
    }

    const updateData = {};
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    if (resumeUrl) updateData.resumeUrl = resumeUrl;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No valid files were received for upload." });
    }

    updateData.updatedAt = Date.now();

    await db.ref("users/" + uid).update(updateData);

    res.status(200).json({
      message: "Documents uploaded successfully",
      avatarUrl: avatarUrl || undefined,
      resumeUrl: resumeUrl || undefined
    });

  } catch (error) {
    console.error("Upload Logic Error:", error);
    res.status(500).json({ error: "Failed to process document upload" });
  }
};

const uploadVaultResume = async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: "UID is required!" });

    const resumeLocalPath = req.file?.path;
    if (!resumeLocalPath) return res.status(400).json({ error: "No file received by server." });

    const uploadResult = await uploadOnCloudinary(resumeLocalPath);
    if (!uploadResult) return res.status(500).json({ error: "Cloudinary upload failed." });

    const resumeId = Date.now().toString();
    const newResume = {
      id: resumeId,
      name: req.file.originalname,
      target: "General",
      date: new Date().toLocaleDateString(),
      url: uploadResult.secure_url,
    };

    await db.ref(`users/${uid}/resumes/${resumeId}`).set(newResume);

    res.status(200).json({ message: "Resume added to vault", resume: newResume });
  } catch (error) {
    console.error("Vault Upload Error:", error);
    res.status(500).json({ error: "Vault upload failed." });
  }
};

const deleteVaultResume = async (req, res) => {
  try {
    const { uid, id } = req.params;
    if (!uid || !id) return res.status(400).json({ error: "UID and Resume ID are required!" });

    await db.ref(`users/${uid}/resumes/${id}`).remove();

    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Vault Delete Error:", error);
    res.status(500).json({ error: "Failed to delete resume." });
  }
};
const setPrimaryResume = async (req, res) => {
  try {
    const { uid, resumeId } = req.body;
    if (!uid || !resumeId) return res.status(400).json({ error: "UID and Resume ID are required!" });

    const snapshot = await db.ref(`users/${uid}/resumes/${resumeId}`).once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Resume not found in vault." });
    }

    const resume = snapshot.val();

    await db.ref(`users/${uid}`).update({
      primaryResumeUrl: resume.url,
      primaryResumeName: resume.name,
      primaryResumeId: resumeId,
      updatedAt: Date.now(),
    });

    res.status(200).json({ message: "Primary resume set successfully", primaryResumeUrl: resume.url, primaryResumeName: resume.name });
  } catch (error) {
    console.error("Set Primary Resume Error:", error);
    res.status(500).json({ error: "Failed to set primary resume." });
  }
};

export default { updateStudentProfile, uploadDocuments, uploadVaultResume, deleteVaultResume, setPrimaryResume };