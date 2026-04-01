import axios from "axios";
import db from "../config/firebaseAdmin.js";

// ✅ Naya URL Logic
const mlServiceUrl = process.env.ML_SERVICE_URL 
  ? process.env.ML_SERVICE_URL.replace(/\/$/, "") 
  : "http://127.0.0.1:5006";

const fetchPastPlacements = async () => {
  const snapshot = await db.ref("pastPlacements").once("value");
  if (!snapshot.exists()) return [];

  const rawData = snapshot.val();
  return Object.values(rawData).map((record) => ({
    dsaScore: Number(record.dsaScore) || 0,
    devScore: Number(record.devScore) || 0,
    cpScore: Number(record.cpScore) || 0,
    placedCompany: String(record.placedCompany || "Unknown"),
  }));
};

const getRecommendations = async (req, res) => {
  try {
    const studentProfile = Array.isArray(req.body?.studentProfile)
      ? req.body.studentProfile
      : [80, 40, 60]; 

    const pastPlacements = await fetchPastPlacements();

    if (pastPlacements.length === 0) {
      return res.status(404).json({ error: "No historical placement data found." });
    }

    const mlResponse = await axios.post(
      `${mlServiceUrl}/recommend`,
      { studentProfile, pastPlacements },
      { 
        headers: { "Content-Type": "application/json" }, 
        timeout: 30000 // ✅ Timeout badhaya hai
      }
    );

    return res.status(200).json(mlResponse.data);
  } catch (error) {
    console.error("getRecommendations error:", error.message);
    
    if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
      return res.status(503).json({
        // ✅ Naya Error Message
        error: "ML Service is currently waking up or unavailable. Please retry in 30 seconds.",
      });
    }

    return res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.error || error.message 
    });
  }
};

const getCompanyChances = async (req, res) => {
  try {
    const targetCompany = req.body?.targetCompany?.trim();
    if (!targetCompany) {
      return res.status(400).json({ error: "targetCompany is required." });
    }

    const studentProfile = Array.isArray(req.body?.studentProfile)
      ? req.body.studentProfile
      : [80, 40, 60];

    const pastPlacements = await fetchPastPlacements();

    if (pastPlacements.length === 0) {
      return res.status(404).json({ error: "No historical data found." });
    }

    const mlResponse = await axios.post(
      `${mlServiceUrl}/predict-chance`,
      { studentProfile, pastPlacements, targetCompany },
      { 
        headers: { "Content-Type": "application/json" }, 
        timeout: 30000 // ✅ Timeout badhaya hai
      }
    );

    return res.status(200).json(mlResponse.data);
  } catch (error) {
    console.error("getCompanyChances error:", error.message);

    if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
      return res.status(503).json({
        // ✅ Naya Error Message
        error: "ML Service is starting up. Please try again shortly.",
      });
    }

    return res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.error || error.message 
    });
  }
};

export default { getRecommendations, getCompanyChances };