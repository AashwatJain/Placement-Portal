/**
 * recommendationController.js
 *
 * Bridges the Node.js backend with the Python ML service (Flask, port 5000).
 *
 * Handlers
 * ─────────────────────────────────────────────────────────────────────────
 * getRecommendations  – POST /api/student/recommendations
 *   Reads pastPlacements from RTDB, posts to /recommend on the ML service,
 *   and returns company recommendations with confidence scores.
 *
 * getCompanyChances   – POST /api/student/company-chances
 *   Same RTDB fetch, but posts to /predict-chance with a targetCompany
 *   from req.body and returns a selectionChance percentage.
 */

import axios from "axios";
import db from "../config/firebaseAdmin.js";

// Base URL of the Python Flask ML service
const mlServiceUrl = "http://127.0.0.1:5000";

// ── Helper: fetch and reshape pastPlacements from RTDB ───────────────────────

/**
 * Reads all records from the `pastPlacements` RTDB node and converts
 * the Firebase object (keyed by push-ID) into a plain array.
 *
 * Each element retains only the fields the ML service needs:
 *   { dsaScore, devScore, cpScore, placedCompany }
 *
 * @returns {Promise<Array<{dsaScore: number, devScore: number, cpScore: number, placedCompany: string}>>}
 */
const fetchPastPlacements = async () => {
  const snapshot = await db.ref("pastPlacements").once("value");

  if (!snapshot.exists()) return [];

  const rawData = snapshot.val(); // Object { pushKey: { ...fields } }

  const pastPlacements = Object.values(rawData).map((record) => ({
    dsaScore:      Number(record.dsaScore)  || 0,
    devScore:      Number(record.devScore)  || 0,
    cpScore:       Number(record.cpScore)   || 0,
    placedCompany: String(record.placedCompany || "Unknown"),
  }));

  return pastPlacements;
};

// ── Handler 1: getRecommendations ─────────────────────────────────────────────

/**
 * POST /api/student/recommendations
 *
 * Accepts an optional `studentProfile` array in req.body.
 * Falls back to a mock profile if not provided.
 *
 * Returns:
 *   { recommendations: [{ placedCompany, confidenceScore }] }
 */
const getRecommendations = async (req, res) => {
  try {
    // Use the caller's profile if provided, else fall back to a mock profile
    const studentProfile = Array.isArray(req.body?.studentProfile)
      ? req.body.studentProfile
      : [80, 40, 60]; // mock: [dsaScore, devScore, cpScore]

    const pastPlacements = await fetchPastPlacements();

    if (pastPlacements.length === 0) {
      return res.status(404).json({
        error: "No historical placement data found in the database.",
      });
    }

    const mlResponse = await axios.post(
      `${mlServiceUrl}/recommend`,
      { studentProfile, pastPlacements },
      { headers: { "Content-Type": "application/json" }, timeout: 10000 }
    );

    return res.status(200).json(mlResponse.data);
  } catch (error) {
    console.error("getRecommendations error:", error.message);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        error: "ML service is unavailable. Make sure mlServer.py is running on port 5000.",
      });
    }

    return res.status(500).json({ error: error.message });
  }
};

// ── Handler 2: getCompanyChances ──────────────────────────────────────────────

/**
 * POST /api/student/company-chances
 *
 * Body: { studentProfile?: number[], targetCompany: string }
 *
 * Returns:
 *   { selectionChance: number }  (0–100 %)
 */
const getCompanyChances = async (req, res) => {
  try {
    const targetCompany = req.body?.targetCompany?.trim();

    if (!targetCompany) {
      return res.status(400).json({
        error: "targetCompany is required in the request body.",
      });
    }

    // Use the caller's profile if provided, else fall back to a mock profile
    const studentProfile = Array.isArray(req.body?.studentProfile)
      ? req.body.studentProfile
      : [80, 40, 60]; // mock: [dsaScore, devScore, cpScore]

    const pastPlacements = await fetchPastPlacements();

    if (pastPlacements.length === 0) {
      return res.status(404).json({
        error: "No historical placement data found in the database.",
      });
    }

    const mlResponse = await axios.post(
      `${mlServiceUrl}/predict-chance`,
      { studentProfile, pastPlacements, targetCompany },
      { headers: { "Content-Type": "application/json" }, timeout: 10000 }
    );

    return res.status(200).json(mlResponse.data);
  } catch (error) {
    console.error("getCompanyChances error:", error.message);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        error: "ML service is unavailable. Make sure mlServer.py is running on port 5000.",
      });
    }

    return res.status(500).json({ error: error.message });
  }
};

// ── Exports ───────────────────────────────────────────────────────────────────

export default { getRecommendations, getCompanyChances };
