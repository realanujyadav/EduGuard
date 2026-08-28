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

/* =========================================================
   STUDENT DATA
   ========================================================= */

let students = [
  {
    id: 1,
    name: "Anuj Yadav",
    rollNumber: "25223016",
    branch: "MCA",
    semester: 3,
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
    semester: 3,
    attendance: 68,
    assessmentScore: 62,
    previousScore: 70,
    missingAssignments: 1,
    engagement: "Medium",
  },
  {
    id: 3,
    name: "Ashish Kumar",
    rollNumber: "25223023",
    branch: "MCA",
    semester: 3,
    attendance: 91,
    assessmentScore: 88,
    previousScore: 85,
    missingAssignments: 0,
    engagement: "High",
  },
  {
    id: 4,
    name: "Ratnesh Kumar",
    rollNumber: "25223077",
    branch: "MCA",
    semester: 3,
    attendance: 58,
    assessmentScore: 54,
    previousScore: 72,
    missingAssignments: 2,
    engagement: "Low",
  },
  {
    id: 5,
    name: "Sayan Saha",
    rollNumber: "25223086",
    branch: "MCA",
    semester: 3,
    attendance: 76,
    assessmentScore: 71,
    previousScore: 74,
    missingAssignments: 1,
    engagement: "Medium",
  },
  {
    id: 6,
    name: "Shreya Sahu",
    rollNumber: "26223087",
    branch: "MCA",
    semester: 1,
    attendance: 45,
    assessmentScore: 42,
    previousScore: 68,
    missingAssignments: 4,
    engagement: "Low",
  },
  {
    id: 7,
    name: "Nitish Kumar",
    rollNumber: "25223066",
    branch: "MCA",
    semester: 3,
    attendance: 85,
    assessmentScore: 79,
    previousScore: 76,
    missingAssignments: 0,
    engagement: "High",
  },
  {
    id: 8,
    name: "Harpreet Singh",
    rollNumber: "25223041",
    branch: "MCA",
    semester: 3,
    attendance: 72,
    assessmentScore: 58,
    previousScore: 69,
    missingAssignments: 2,
    engagement: "Medium",
  },
  {
    id: 9,
    name: "Aryan Chitley",
    rollNumber: "25223021",
    branch: "MCA",
    semester: 3,
    attendance: 64,
    assessmentScore: 55,
    previousScore: 73,
    missingAssignments: 2,
    engagement: "Low",
  },
  {
    id: 10,
    name: "Harshvardhan Shrivastava",
    rollNumber: "25223043",
    branch: "MCA",
    semester: 3,
    attendance: 88,
    assessmentScore: 82,
    previousScore: 80,
    missingAssignments: 0,
    engagement: "High",
  },
  {
    id: 11,
    name: "Divyaraj Patidar",
    rollNumber: "25223035",
    branch: "MCA",
    semester: 3,
    attendance: 59,
    assessmentScore: 49,
    previousScore: 66,
    missingAssignments: 3,
    engagement: "Low",
  },
  {
    id: 12,
    name: "Garima Kumari",
    rollNumber: "25223037",
    branch: "MCA",
    semester: 3,
    attendance: 81,
    assessmentScore: 67,
    previousScore: 71,
    missingAssignments: 1,
    engagement: "Medium",
  },
];


/* =========================================================
   RISK ANALYSIS ENGINE
   ========================================================= */

function calculateRisk(student) {
  let riskScore = 0;
  const riskFactors = [];

  // Attendance
  if (student.attendance < 60) {
    riskScore += 30;
    riskFactors.push(`Low Attendance (${student.attendance}%)`);
  } else if (student.attendance < 75) {
    riskScore += 15;
    riskFactors.push(`Moderate Attendance (${student.attendance}%)`);
  }

  // Assessment performance
  if (student.assessmentScore < 50) {
    riskScore += 30;
    riskFactors.push(`Low Assessment (${student.assessmentScore}%)`);
  } else if (student.assessmentScore < 65) {
    riskScore += 15;
    riskFactors.push(`Moderate Assessment (${student.assessmentScore}%)`);
  }

  // Missing assignments
  if (student.missingAssignments >= 3) {
    riskScore += 20;
    riskFactors.push(
      `${student.missingAssignments} Missing Assignments`
    );
  } else if (student.missingAssignments >= 1) {
    riskScore += 10;
    riskFactors.push(
      `${student.missingAssignments} Missing Assignment(s)`
    );
  }

  // Engagement
  if (student.engagement === "Low") {
    riskScore += 15;
    riskFactors.push("Low Engagement");
  } else if (student.engagement === "Medium") {
    riskScore += 5;
    riskFactors.push("Moderate Engagement");
  }

  // Performance decline
  const performanceDrop =
    student.previousScore - student.assessmentScore;

  if (performanceDrop >= 15) {
    riskScore += 15;
    riskFactors.push("Significant Decline in Performance");
  } else if (performanceDrop >= 8) {
    riskScore += 8;
    riskFactors.push("Declining Academic Performance");
  }

  // Final risk level
  let riskLevel;

  if (riskScore >= 50) {
    riskLevel = "High";
  } else if (riskScore >= 25) {
    riskLevel = "Medium";
  } else {
    riskLevel = "Low";
  }

  return {
    ...student,
    riskScore,
    riskLevel,
    riskFactors,
  };
}

/* =========================================================
   INTERVENTION RECOMMENDATION ENGINE
   ========================================================= */

function getRecommendations(student) {
  const recommendations = [];

  if (student.attendance < 75) {
    recommendations.push(
      "Attendance counselling and student follow-up"
    );
  }

  if (student.assessmentScore < 65) {
    recommendations.push(
      "Academic mentoring and performance support"
    );
  }

  if (student.previousScore - student.assessmentScore >= 8) {
    recommendations.push(
      "Review recent decline in academic performance"
    );
  }

  if (student.missingAssignments > 0) {
    recommendations.push(
      `Follow up on ${student.missingAssignments} missing assignment(s)`
    );
  }

  if (student.engagement === "Low") {
    recommendations.push(
      "Faculty counselling to improve classroom engagement"
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Continue regular academic monitoring"
    );
  }

  return recommendations;
}


/* =========================================================
   INTERVENTION MANAGEMENT
   ========================================================= */

let interventions = [];

// Create interventions for students who are currently at risk
function syncInterventions() {
  const analyzedStudents = students.map(calculateRisk);

  analyzedStudents
    .filter((student) => student.riskLevel !== "Low")
    .forEach((student) => {
      const existingIntervention = interventions.find(
        (intervention) => intervention.studentId === student.id
      );

      if (!existingIntervention) {
        interventions.push({
          id: interventions.length + 1,
          studentId: student.id,
          name: student.name,
          rollNumber: student.rollNumber,
          branch: student.branch,
          riskLevel: student.riskLevel,
          riskScore: student.riskScore,
          recommendations: getRecommendations(student),
          status: "Pending",
          notes: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Update current academic information without
        // changing the intervention status or notes
        existingIntervention.name = student.name;
        existingIntervention.rollNumber = student.rollNumber;
        existingIntervention.branch = student.branch;
        existingIntervention.riskLevel = student.riskLevel;
        existingIntervention.riskScore = student.riskScore;
        existingIntervention.recommendations =
          getRecommendations(student);
      }
    });
}

/* =========================================================
   INTERVENTION STATUS STORAGE
   ========================================================= */

let interventionStatuses = {};

/* =========================================================
   ROUTES
   ========================================================= */

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "EduGuard Backend is running successfully!",
  });
});

// Get all students with calculated risk
app.get("/api/students", (req, res) => {
  const analyzedStudents = students.map(calculateRisk);
  res.json(analyzedStudents);
});

// Get one student by ID
app.get("/api/students/:id", (req, res) => {
  const student = students.find(
    (s) => s.id === Number(req.params.id)
  );

  if (!student) {
    return res.status(404).json({
      message: "Student not found",
    });
  }

  const analyzedStudent = calculateRisk(student);

  res.json({
    ...analyzedStudent,
    recommendations: getRecommendations(analyzedStudent),
  });
});

// Add a new student
app.post("/api/students", (req, res) => {
  const newStudent = {
    id: students.length
      ? Math.max(...students.map((s) => s.id)) + 1
      : 1,
    ...req.body,
  };

  students.push(newStudent);

  res.status(201).json(calculateRisk(newStudent));
});

// Update a student
app.put("/api/students/:id", (req, res) => {
  const studentIndex = students.findIndex(
    (s) => s.id === Number(req.params.id)
  );

  if (studentIndex === -1) {
    return res.status(404).json({
      message: "Student not found",
    });
  }

  students[studentIndex] = {
    ...students[studentIndex],
    ...req.body,
  };

  res.json(calculateRisk(students[studentIndex]));
});

// Delete a student
app.delete("/api/students/:id", (req, res) => {
  const studentIndex = students.findIndex(
    (s) => s.id === Number(req.params.id)
  );

  if (studentIndex === -1) {
    return res.status(404).json({
      message: "Student not found",
    });
  }

  students.splice(studentIndex, 1);

  res.json({
    message: "Student deleted successfully",
  });
});

// Risk analysis summary
app.get("/api/risk-analysis", (req, res) => {
  const analyzedStudents = students.map(calculateRisk);

  const highRisk = analyzedStudents.filter(
    (student) => student.riskLevel === "High"
  );

  const mediumRisk = analyzedStudents.filter(
    (student) => student.riskLevel === "Medium"
  );

  const lowRisk = analyzedStudents.filter(
    (student) => student.riskLevel === "Low"
  );

  res.json({
    totalStudents: analyzedStudents.length,
    highRisk: highRisk.length,
    mediumRisk: mediumRisk.length,
    lowRisk: lowRisk.length,
    students: analyzedStudents,
  });
});

// Get intervention data
app.get("/api/interventions", (req, res) => {
  const analyzedStudents = students
    .map(calculateRisk)
    .filter((student) => student.riskLevel !== "Low");

  const interventions = analyzedStudents.map((student) => ({
    studentId: student.id,
    name: student.name,
    rollNumber: student.rollNumber,
    branch: student.branch,
    riskLevel: student.riskLevel,
    riskScore: student.riskScore,
    recommendations: getRecommendations(student),
    status: interventionStatuses[student.id] || "Pending",
  }));

  res.json(interventions);
});

// Update intervention status
app.put("/api/interventions/:studentId", (req, res) => {
  const studentId = Number(req.params.studentId);
  const { status } = req.body;

  const validStatuses = ["Pending", "In Progress", "Completed"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid intervention status",
    });
  }

  interventionStatuses[studentId] = status;

  res.json({
    studentId,
    status,
    message: "Intervention status updated successfully",
  });
});

// Update an intervention
app.patch("/api/interventions/:studentId", (req, res) => {
  const studentId = Number(req.params.studentId);

  const intervention = interventions.find(
    (item) => item.studentId === studentId
  );

  if (!intervention) {
    return res.status(404).json({
      message: "Intervention not found",
    });
  }

  const { status, notes } = req.body;

  const allowedStatuses = [
    "Pending",
    "In Progress",
    "Completed",
  ];

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({
      message:
        "Invalid status. Use Pending, In Progress, or Completed.",
    });
  }

  if (status) {
    intervention.status = status;
  }

  if (notes !== undefined) {
    intervention.notes = notes;
  }

  intervention.updatedAt = new Date().toISOString();

  res.json({
    message: "Intervention updated successfully",
    intervention,
  });
});

// Get intervention summary
app.get("/api/interventions/summary/counts", (req, res) => {
  syncInterventions();

  const pending = interventions.filter(
    (item) => item.status === "Pending"
  ).length;

  const inProgress = interventions.filter(
    (item) => item.status === "In Progress"
  ).length;

  const completed = interventions.filter(
    (item) => item.status === "Completed"
  ).length;

  res.json({
    total: interventions.length,
    pending,
    inProgress,
    completed,
  });
});

// Update intervention data
app.put("/api/interventions/:studentId/status", (req, res) => {
  const studentId = Number(req.params.studentId);
  const { status } = req.body;

  const validStatuses = ["Pending", "In Progress", "Completed"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid intervention status",
    });
  }

  const student = students.find((s) => s.id === studentId);

  if (!student) {
    return res.status(404).json({
      message: "Student not found",
    });
  }

  interventionStatuses[studentId] = status;

  res.json({
    message: "Intervention status updated successfully",
    studentId,
    status,
  });
});

// Dashboard API
app.get("/api/dashboard", (req, res) => {
  const analyzedStudents = students.map(calculateRisk);

  const highRiskStudents = analyzedStudents.filter(
    (student) => student.riskLevel === "High"
  );

  const mediumRiskStudents = analyzedStudents.filter(
    (student) => student.riskLevel === "Medium"
  );

  const lowRiskStudents = analyzedStudents.filter(
    (student) => student.riskLevel === "Low"
  );

  res.json({
    totalStudents: analyzedStudents.length,
    highRisk: highRiskStudents.length,
    mediumRisk: mediumRiskStudents.length,
    lowRisk: lowRiskStudents.length,
  });
});

/* =========================================================
   START SERVER
   ========================================================= */

app.listen(PORT, () => {
  console.log(`EduGuard backend running on port ${PORT}`);
});