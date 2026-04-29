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
    console.error("calculateAtsScore error message:", error.message);

    if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
      return res.status(503).json({
        // ✅ Naya Error Message (Isse confirm hoga ki naya code deploy hua hai)
        error: "ATS Service is currently starting up or unreachable. Please try again in 30 seconds.",
      });
    }

    // ✅ NAYA LOGIC: Handle actual HTTP errors from the ML Service
    if (error.response) {
      // 1. Log the full data so you can see WHY the ML service is rejecting it
      console.error("ML Service Error Data:", error.response.data);
      console.error("ML Service Status Code:", error.response.status);

      // 2. Extract whatever text or message the ML service sent
      const mlErrorMessage = error.response.data?.error 
        || error.response.data?.message 
        || (typeof error.response.data === 'string' ? error.response.data : "ML Service rejected the request.");

      // 3. Forward the exact status code (429) back to the React frontend
      return res.status(error.response.status).json({
        error: mlErrorMessage,
      });
    }

    return res.status(500).json({ error: error.message });
  }
};

export default { calculateAtsScore };