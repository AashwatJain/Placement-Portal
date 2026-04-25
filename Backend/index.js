import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import studentRoutes from "./src/routes/studentRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import recruiterRoutes from "./src/routes/recruiterRoutes.js";
import atsRoutes from "./src/routes/atsRoutes.js";

import "./src/config/firebaseAdmin.js";

const app = express();
const PORT = process.env.PORT || 5001;

app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.FRONTEND_URL || "*"
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", dashboardRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/ats", atsRoutes);

app.get("/", (req, res) => {
  res.send("NIT KKR Placement Portal Backend is Running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});