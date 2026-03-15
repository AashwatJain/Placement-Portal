import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import studentRoutes from "./routes/studentRoutes.js"; // .js extension required in ESM
import adminRoutes from "./routes/adminRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import recruiterRoutes from "./routes/recruiterRoutes.js";
import atsRoutes from "./routes/atsRoutes.js";

// Ensure Firebase Admin SDK is initialized before any route handler runs
import "./config/firebaseAdmin.js";

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route Mounting
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", dashboardRoutes); // Dashboard & analytics (same /api/admin prefix)
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/ats", atsRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("NIT KKR Placement Portal Backend is Running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});