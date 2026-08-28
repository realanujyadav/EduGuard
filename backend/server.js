const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "EduGuard Backend is running successfully!",
  });
});

// Temporary student data API
app.get("/api/students", (req, res) => {
  res.json([
    {
      id: 1,
      name: "Anuj Yadav",
      rollNumber: "25223016",
      branch: "MCA",
      attendance: 52,
      assessmentScore: 48,
      previousScore: 65,
      missingAssignments: 3,
      engagement: "Low",
    },
    {
      id: 2,
      name: "Aryan Pathak",
      rollNumber: "25223022",
      branch: "MCA",
      attendance: 68,
      assessmentScore: 62,
      previousScore: 70,
      missingAssignments: 1,
      engagement: "Medium",
    },
  ]);
});

app.listen(PORT, () => {
  console.log(`EduGuard backend running on port ${PORT}`);
});