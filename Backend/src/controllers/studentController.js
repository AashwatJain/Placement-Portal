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

    // Firebase Realtime DB Update Logic
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

// 2. Handles Profile Section: Uploading Avatar and Primary Resume
const uploadDocuments = async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "UID is required!" });
    }

    // Multer intercepts the multipart/form-data and places file details in req.files
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const resumeLocalPath = req.files?.resume?.[0]?.path;

    let avatarUrl = "";
    let resumeUrl = "";

    // Push to object storage (Cloudinary) and retrieve the permanent URLs
    if (avatarLocalPath) {
      const avatarUpload = await uploadOnCloudinary(avatarLocalPath);
      if (avatarUpload) avatarUrl = avatarUpload.secure_url;
    }

    if (resumeLocalPath) {
      const resumeUpload = await uploadOnCloudinary(resumeLocalPath);
      if (resumeUpload) resumeUrl = resumeUpload.secure_url;
    }

    // Prepare the payload for the database update
    const updateData = {};
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    if (resumeUrl) updateData.resumeUrl = resumeUrl;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No valid files were received for upload." });
    }

    updateData.updatedAt = Date.now();

    // Save the resulting URLs into the specific user's database node (One-to-One relationship)
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

// 3. Handles Vault Section: Uploading Multiple Target-Specific Resumes
const uploadVaultResume = async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: "UID is required!" });

    // Extract the single file passed by Multer (req.file, not req.files)
    const resumeLocalPath = req.file?.path;
    if (!resumeLocalPath) return res.status(400).json({ error: "No file received by server." });

    // Push to Cloudinary
    const uploadResult = await uploadOnCloudinary(resumeLocalPath);
    if (!uploadResult) return res.status(500).json({ error: "Cloudinary upload failed." });

    // Construct the Vault Object
    const resumeId = Date.now().toString();
    const newResume = {
      id: resumeId,
      name: req.file.originalname,
      target: "General",
      date: new Date().toLocaleDateString(),
      url: uploadResult.secure_url,
    };

    // Write to the one-to-many structure in Firebase (users/uid/resumes/unique_id)
    await db.ref(`users/${uid}/resumes/${resumeId}`).set(newResume);

    res.status(200).json({ message: "Resume added to vault", resume: newResume });
  } catch (error) {
    console.error("Vault Upload Error:", error);
    res.status(500).json({ error: "Vault upload failed." });
  }
};

// 4. Handles deleting a resume from the vault
const deleteVaultResume = async (req, res) => {
  try {
    const { uid, id } = req.params;
    if (!uid || !id) return res.status(400).json({ error: "UID and Resume ID are required!" });

    // Delete the resume node from Firebase Realtime Database
    await db.ref(`users/${uid}/resumes/${id}`).remove();

    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Vault Delete Error:", error);
    res.status(500).json({ error: "Failed to delete resume." });
  }
};
// 5. Sets a vault resume as the primary resume (shown on profile)
const setPrimaryResume = async (req, res) => {
  try {
    const { uid, resumeId } = req.body;
    if (!uid || !resumeId) return res.status(400).json({ error: "UID and Resume ID are required!" });

    // Fetch the vault resume data
    const snapshot = await db.ref(`users/${uid}/resumes/${resumeId}`).once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Resume not found in vault." });
    }

    const resume = snapshot.val();

    // Set the primary resume fields on the user node
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