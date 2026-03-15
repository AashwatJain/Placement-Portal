/**
 * atsController.js
 *
 * Proxies ATS resume scoring requests from the React frontend
 * to the Python ML server (Flask, port 5005).
 *
 * Handler
 * ──────────────────────────────────────────────────────────────
 * calculateAtsScore – POST /api/ats/calculate
 *   Accepts a PDF file (resumeFile) and text (jobDescription)
 *   via multipart form-data, forwards to Python /ats-score,
 *   and returns { atsScore: number } back to the client.
 */

import axios from "axios";
import FormData from "form-data";

const mlServiceUrl = "http://127.0.0.1:5005";

/**
 * POST /api/ats/calculate
 *
 * req.file         – PDF uploaded via multer (memory storage)
 * req.body.jobDescription – plain text job description
 *
 * Returns: { atsScore: 78.5 }
 */
const calculateAtsScore = async (req, res) => {
  try {
    // ── Validate inputs ──────────────────────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({
        error: "resumeFile is required (PDF upload).",
      });
    }

    // ── Forward to Python ML server as multipart/form-data ───────────────────
    const form = new FormData();
    form.append("resumeFile", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const mlResponse = await axios.post(
      `${mlServiceUrl}/ats-score`,
      form,
      {
        headers: { ...form.getHeaders() },
        timeout: 15000,
      }
    );

    return res.status(200).json(mlResponse.data);
  } catch (error) {
    console.error("calculateAtsScore error:", error.message);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        error: "ML service is unavailable. Make sure mlServer.py is running on port 5005.",
      });
    }

    // Forward error from ML server if available
    if (error.response?.data?.error) {
      return res.status(error.response.status || 500).json({
        error: error.response.data.error,
      });
    }

    return res.status(500).json({ error: error.message });
  }
};

export default { calculateAtsScore };
