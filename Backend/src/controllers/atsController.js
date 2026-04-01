import axios from "axios";
import FormData from "form-data";

// ✅ Naya URL Logic
const mlServiceUrl = process.env.ML_SERVICE_URL 
  ? process.env.ML_SERVICE_URL.replace(/\/$/, "") 
  : "http://127.0.0.1:5006";

const calculateAtsScore = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "resumeFile is required (PDF upload).",
      });
    }

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
        timeout: 45000, // ✅ Timeout badhaya hai
      }
    );

    return res.status(200).json(mlResponse.data);
  } catch (error) {
    console.error("calculateAtsScore error:", error.message);

    if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
      return res.status(503).json({
        // ✅ Naya Error Message (Isse confirm hoga ki naya code deploy hua hai)
        error: "ATS Service is currently starting up or unreachable. Please try again in 30 seconds.",
      });
    }

    if (error.response?.data?.error) {
      return res.status(error.response.status || 500).json({
        error: error.response.data.error,
      });
    }

    return res.status(500).json({ error: error.message });
  }
};

export default { calculateAtsScore };