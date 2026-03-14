import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import studentRoutes from "./routes/studentRoutes.js"; // .js extension required in ESM
import adminRoutes from "./routes/adminRoutes.js";
import recruiterRoutes from "./routes/recruiterRoutes.js";

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors()); // Frontend (3000) aur Backend (5001) ko connect karne ke liye
app.use(express.json()); // JSON data handle karne ke liye
app.use(bodyParser.urlencoded({ extended: true }));

// Route Mounting
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/recruiter", recruiterRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("NIT KKR Placement Portal Backend is Running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});