const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const studentRoutes = require("./routes/studentRoutes"); // Ensure path is correct

const app = express();
const PORT = 5000;

const studentRoutes = require("./routes/studentRoutes");

// Agar aap yahan '/api/student' use kar rahe hain:
app.use("/api/student", studentRoutes);

// Middleware
app.use(cors()); // Frontend (3000) aur Backend (5000) ko connect karne ke liye
app.use(express.json()); // JSON data handle karne ke liye
app.use(bodyParser.urlencoded({ extended: true }));

// Route Mounting
// Yahan hum define kar rahe hain ki '/api/student' se shuru hone wale 
// saare requests studentRoutes file mein jayenge.
app.use("/api/student", studentRoutes);

// Test Route (Check karne ke liye ki server chal raha hai)
app.get("/", (req, res) => {
  res.send("NIT KKR Placement Portal Backend is Running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});