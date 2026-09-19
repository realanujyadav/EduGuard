const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const {
  calculateRisk,
  getRecommendations,
} = require("./services/riskEngine");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(express.json());

const PORT = process.env.PORT || 5001;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DB_SSL === "true"
      ? { rejectUnauthorized: false }
      : false,
});

/* =========================================================
   ROUTES
   ========================================================= */

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "EduGuard Backend is running successfully!",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "EduGuard backend",
  });
});


// Get all students with calculated risk
app.get("/api/students", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id,
        s.name,
        s.roll_number AS "rollNumber",
        s.branch,
        s.semester,
        ar.attendance,
        ar.assessment_score AS "assessmentScore",
        ar.previous_score AS "previousScore",
        ar.missing_assignments AS "missingAssignments",
        ar.engagement
      FROM students s
      JOIN academic_records ar
        ON s.id = ar.student_id
      ORDER BY s.id;
    `);

    const analyzedStudents = result.rows.map(calculateRisk);

    res.json(analyzedStudents);
  } catch (error) {
    console.error("Error fetching students from database:", error);

    res.status(500).json({
      message: "Failed to fetch students from database",
    });
  }
});

// Get one student by ID
app.get("/api/students/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        s.id,
        s.name,
        s.roll_number AS "rollNumber",
        s.branch,
        s.semester,
        ar.attendance,
        ar.assessment_score AS "assessmentScore",
        ar.previous_score AS "previousScore",
        ar.missing_assignments AS "missingAssignments",
        ar.engagement
      FROM students s
      JOIN academic_records ar
        ON s.id = ar.student_id
      WHERE s.id = $1;
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const analyzedStudent = calculateRisk(result.rows[0]);

    res.json({
      ...analyzedStudent,
      recommendations: getRecommendations(analyzedStudent),
    });
  } catch (error) {
    console.error("Error fetching student from database:", error);

    res.status(500).json({
      message: "Failed to fetch student from database",
    });
  }
});

// Add a new student
app.post("/api/students", async (req, res) => {
  const {
    name,
    rollNumber,
    branch,
    semester,
    attendance,
    assessmentScore,
    previousScore,
    missingAssignments,
    engagement,
  } = req.body;

  if (
    !name ||
    !rollNumber ||
    !branch ||
    semester === undefined ||
    attendance === undefined ||
    assessmentScore === undefined ||
    previousScore === undefined ||
    missingAssignments === undefined ||
    !engagement
  ) {
    return res.status(400).json({
      message: "All student and academic fields are required",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const studentResult = await client.query(
      `
      INSERT INTO students (name, roll_number, branch, semester)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, roll_number, branch, semester;
      `,
      [name, rollNumber, branch, semester]
    );

    const student = studentResult.rows[0];

    await client.query(
      `
      INSERT INTO academic_records (
        student_id,
        attendance,
        assessment_score,
        previous_score,
        missing_assignments,
        engagement
      )
      VALUES ($1, $2, $3, $4, $5, $6);
      `,
      [
        student.id,
        attendance,
        assessmentScore,
        previousScore,
        missingAssignments,
        engagement,
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Student created successfully",
      student,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error creating student:", error);

    res.status(500).json({
      message: "Failed to create student",
    });
  } finally {
    client.release();
  }
});

// Update a student
app.put("/api/students/:id", async (req, res) => {
  try {
    const {
      attendance,
      assessmentScore,
      previousScore,
      missingAssignments,
      engagement,
    } = req.body;

    // Check that the student exists
    const studentCheck = await pool.query(
      "SELECT id FROM students WHERE id = $1",
      [req.params.id]
    );

    if (studentCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    // Update the student's academic record
    const result = await pool.query(
      `
      UPDATE academic_records
      SET
        attendance = $1,
        assessment_score = $2,
        previous_score = $3,
        missing_assignments = $4,
        engagement = $5,
        recorded_at = CURRENT_TIMESTAMP
      WHERE student_id = $6
      RETURNING
        attendance,
        assessment_score AS "assessmentScore",
        previous_score AS "previousScore",
        missing_assignments AS "missingAssignments",
        engagement;
      `,
      [
        attendance,
        assessmentScore,
        previousScore,
        missingAssignments,
        engagement,
        req.params.id,
      ]
    );

    // Get complete student information
    const studentResult = await pool.query(
      `
      SELECT
        s.id,
        s.name,
        s.roll_number AS "rollNumber",
        s.branch,
        s.semester,
        ar.attendance,
        ar.assessment_score AS "assessmentScore",
        ar.previous_score AS "previousScore",
        ar.missing_assignments AS "missingAssignments",
        ar.engagement
      FROM students s
      JOIN academic_records ar
        ON s.id = ar.student_id
      WHERE s.id = $1;
      `,
      [req.params.id]
    );

    const updatedStudent = calculateRisk(studentResult.rows[0]);

    console.log(
      `Student ${updatedStudent.id} risk after update:`,
      updatedStudent.riskLevel,
      "Score:",
      updatedStudent.riskScore
    );

    // Automatically create an intervention when a student
    // becomes Medium or High Risk
    if (
      updatedStudent.riskLevel === "Medium" ||
      updatedStudent.riskLevel === "High"
    ) {
      const existingIntervention = await pool.query(
        `
        SELECT id
        FROM interventions
        WHERE student_id = $1;
        `,
        [updatedStudent.id]
      );

      // Create an intervention only if one doesn't already exist
      if (existingIntervention.rows.length === 0) {
        await pool.query(
          `
          INSERT INTO interventions (student_id, status, notes)
          VALUES ($1, 'Pending', 'Automatically created due to academic risk detection');
          `,
          [updatedStudent.id]
        );

        console.log(
          `Automatic intervention created for student ${updatedStudent.id}`
        );
      }
    }

    // If the student's risk improves to Low,
    // automatically complete any active intervention
    if (updatedStudent.riskLevel === "Low") {
      await pool.query(
        `
        UPDATE interventions
        SET
          status = 'Completed',
          notes = 'Student risk level improved. Continue regular monitoring.',
          updated_at = CURRENT_TIMESTAMP
        WHERE student_id = $1
          AND status IN ('Pending', 'In Progress');
        `,
        [updatedStudent.id]
      );

      console.log(
        `Active intervention automatically completed for student ${updatedStudent.id}`
      );
    }

    res.json(updatedStudent);
  } catch (error) {
    console.error("Error updating student in database:", error);

    res.status(500).json({
      message: "Failed to update student",
    });
  }
});

// Delete a student
app.delete("/api/students/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      DELETE FROM students
      WHERE id = $1
      RETURNING id;
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json({
      message: "Student deleted successfully",
      studentId: result.rows[0].id,
    });
  } catch (error) {
    console.error("Error deleting student:", error);

    res.status(500).json({
      message: "Failed to delete student",
    });
  }
});

// Risk analysis summary
app.get("/api/risk-analysis", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id,
        s.name,
        s.roll_number AS "rollNumber",
        s.branch,
        s.semester,
        ar.attendance,
        ar.assessment_score AS "assessmentScore",
        ar.previous_score AS "previousScore",
        ar.missing_assignments AS "missingAssignments",
        ar.engagement
      FROM students s
      JOIN academic_records ar
        ON s.id = ar.student_id
      ORDER BY s.id;
    `);

    const analyzedStudents = result.rows.map(calculateRisk);

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
  } catch (error) {
    console.error("Error fetching risk analysis:", error);

    res.status(500).json({
      message: "Failed to fetch risk analysis",
    });
  }
});

// Get intervention data
app.get("/api/interventions", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id AS "studentId",
        s.name,
        s.roll_number AS "rollNumber",
        s.branch,
        s.semester,
        ar.attendance,
        ar.assessment_score AS "assessmentScore",
        ar.previous_score AS "previousScore",
        ar.missing_assignments AS "missingAssignments",
        ar.engagement,
        i.status,
        i.notes
      FROM interventions i
      JOIN students s
        ON i.student_id = s.id
      JOIN academic_records ar
        ON ar.student_id = s.id
      ORDER BY s.id;
    `);

    const interventionData = result.rows.map((student) => {
      const analyzedStudent = calculateRisk(student);

      return {
        studentId: analyzedStudent.studentId,
        name: analyzedStudent.name,
        rollNumber: analyzedStudent.rollNumber,
        branch: analyzedStudent.branch,
        semester: analyzedStudent.semester,
        riskLevel: analyzedStudent.riskLevel,
        riskScore: analyzedStudent.riskScore,
        riskFactors: analyzedStudent.riskFactors,
        recommendations: getRecommendations(analyzedStudent),
        status: analyzedStudent.status,
        notes: analyzedStudent.notes,
      };
    });

    res.json(interventionData);
  } catch (error) {
    console.error("Error fetching interventions from database:", error);

    res.status(500).json({
      message: "Failed to fetch interventions",
    });
  }
});


// Update an intervention
app.patch(
  "/api/interventions/:studentId",
  async (req, res) => {
    try {
      const { status, notes } = req.body;

      // Validate the status
      const validStatuses = [
        "Pending",
        "In Progress",
        "Completed",
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid intervention status",
        });
      }

      const result = await pool.query(
        `
        UPDATE interventions
        SET
          status = $1,
          notes = COALESCE($2, notes),
          updated_at = CURRENT_TIMESTAMP
        WHERE student_id = $3
        RETURNING *;
        `,
        [status, notes, req.params.studentId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Intervention not found",
        });
      }

      const intervention = result.rows[0];

      res.json({
        message: "Intervention updated successfully",
        intervention: {
          studentId: intervention.student_id,
          status: intervention.status,
          notes: intervention.notes,
          updatedAt: intervention.updated_at,
        },
      });
    } catch (error) {
      console.error(
        "Error updating intervention:",
        error
      );

      res.status(500).json({
        message: "Failed to update intervention",
      });
    }
  }
);

// Get intervention summary
app.get("/api/interventions/summary/counts", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'Pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'In Progress') AS "inProgress",
        COUNT(*) FILTER (WHERE status = 'Completed') AS completed
      FROM interventions;
    `);

    const summary = result.rows[0];

    res.json({
      total: Number(summary.total),
      pending: Number(summary.pending),
      inProgress: Number(summary.inProgress),
      completed: Number(summary.completed),
    });
  } catch (error) {
    console.error("Error fetching intervention summary:", error);

    res.status(500).json({
      message: "Failed to fetch intervention summary",
    });
  }
});


// Dashboard API
app.get("/api/dashboard", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id,
        s.name,
        s.roll_number AS "rollNumber",
        s.branch,
        s.semester,
        ar.attendance,
        ar.assessment_score AS "assessmentScore",
        ar.previous_score AS "previousScore",
        ar.missing_assignments AS "missingAssignments",
        ar.engagement
      FROM students s
      JOIN academic_records ar
        ON s.id = ar.student_id
      ORDER BY s.id;
    `);

    const analyzedStudents = result.rows.map(calculateRisk);

    const highRisk = analyzedStudents.filter(
      (student) => student.riskLevel === "High"
    ).length;

    const mediumRisk = analyzedStudents.filter(
      (student) => student.riskLevel === "Medium"
    ).length;

    const lowRisk = analyzedStudents.filter(
      (student) => student.riskLevel === "Low"
    ).length;

    res.json({
      totalStudents: analyzedStudents.length,
      highRisk,
      mediumRisk,
      lowRisk,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);

    res.status(500).json({
      message: "Failed to fetch dashboard data",
    });
  }
});

/* =========================================================
   START SERVER
   ========================================================= */

app.listen(PORT, () => {
  console.log(`EduGuard backend running on port ${PORT}`);
});