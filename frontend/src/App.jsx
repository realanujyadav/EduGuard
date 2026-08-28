import { useState, useEffect } from "react";
import "./App.css";


function getRiskLevel(student) {
  let riskScore = 0;

  // Attendance risk
  if (student.attendance < 60) {
    riskScore += 40;
  } else if (student.attendance < 75) {
    riskScore += 20;
  }

  // Academic performance risk
  if (student.assessmentScore < 50) {
    riskScore += 30;
  } else if (student.assessmentScore < 65) {
    riskScore += 15;
  }

  // Performance decline risk
  if (student.assessmentScore < student.previousScore - 10) {
    riskScore += 15;
  }

  // Missing assignments risk
  riskScore += student.missingAssignments * 5;

  // Engagement risk
  if (student.engagement === "Low") {
    riskScore += 15;
  } else if (student.engagement === "Medium") {
    riskScore += 5;
  }

  if (riskScore >= 50) return "High";
  if (riskScore >= 25) return "Medium";
  return "Low";
}

function getInterventionSuggestions(student) {
  const suggestions = [];

  if (student.attendance < 60) {
    suggestions.push("Attendance counselling and student follow-up");
  }

  if (student.assessmentScore < 50) {
    suggestions.push("Academic mentoring and performance support");
  }

  if (student.assessmentScore < student.previousScore - 10) {
    suggestions.push("Review recent decline in academic performance");
  }

  if (student.missingAssignments > 0) {
    suggestions.push(
      `Follow up on ${student.missingAssignments} missing assignment(s)`
    );
  }

  if (student.engagement === "Low") {
    suggestions.push("Faculty counselling to improve classroom engagement");
  }

  return suggestions;
}

function updateInterventionStatus(studentId, status, setInterventions) {
  setInterventions((previous) => ({
    ...previous,
    [studentId]: status,
  }));
}

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [interventions, setInterventions] = useState(() => {
  const savedInterventions = localStorage.getItem("eduguardInterventions");

    return savedInterventions
      ? JSON.parse(savedInterventions)
      : {};
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");

  const [editingStudent, setEditingStudent] = useState(null);

  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5001/api/students")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched students:", data);
        setStudents(data);
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "eduguardInterventions",
      JSON.stringify(interventions)
    );
  }, [interventions]);

  // Add calculated risk level to every student
  const studentsWithRisk = students.map((student) => ({
    ...student,
    riskLevel: getRiskLevel(student),
  }));

  const filteredStudents = studentsWithRisk.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.includes(searchTerm);

    const matchesRisk =
      riskFilter === "All" || student.riskLevel === riskFilter;

    return matchesSearch && matchesRisk;
  });

  // Dashboard calculations
  const totalStudents = studentsWithRisk.length;

  const highRisk = studentsWithRisk.filter(
    (student) => student.riskLevel === "High"
  ).length;

  const mediumRisk = studentsWithRisk.filter(
    (student) => student.riskLevel === "Medium"
  ).length;

  const lowRisk = studentsWithRisk.filter(
    (student) => student.riskLevel === "Low"
  ).length;

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>EduGuard</h2>
        <p className="tagline">Academic Risk Monitoring</p>

        <nav>
          <button onClick={() => setActivePage("Dashboard")}>
            Dashboard
          </button>

          <button onClick={() => setActivePage("Students")}>
            Students
          </button>

          <button onClick={() => setActivePage("Risk Analysis")}>
            Risk Analysis
          </button>

          <button onClick={() => setActivePage("Interventions")}>
            Interventions
          </button>
        </nav>
      </aside>

      <main className="main-content">
        {/* DASHBOARD PAGE */}
        {activePage === "Dashboard" && (
          <>
            <h1>Dashboard</h1>
            <p>
              Welcome to the EduGuard Early Academic Risk Detection System.
            </p>

            <div className="dashboard-cards">
              <div className="card">
                <h3>Total Students</h3>
                <p>{totalStudents}</p>
              </div>

              <div className="card">
                <h3>High Risk</h3>
                <p>{highRisk}</p>
              </div>

              <div className="card">
                <h3>Medium Risk</h3>
                <p>{mediumRisk}</p>
              </div>

              <div className="card">
                <h3>Low Risk</h3>
                <p>{lowRisk}</p>
              </div>
            </div>
          </>
        )}

        {/* STUDENTS PAGE */}
        {activePage === "Students" && (
          <>
            <h1>Students</h1>
            <p>View student academic information and risk levels.</p>

            <div className="student-controls">
              <input
                type="text"
                placeholder="Search by name or roll number..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="student-search"
              />

              <select
                value={riskFilter}
                onChange={(event) => setRiskFilter(event.target.value)}
                className="risk-filter"
              >
                <option value="All">All Risk Levels</option>
                <option value="High">High Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="Low">Low Risk</option>
              </select>
            </div>
            <div className="student-table-container">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Roll Number</th>
                    <th>Branch</th>
                    <th>Attendance</th>
                    <th>Assessment</th>
                    <th>Risk Level</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      onClick={() => {
                        setSelectedStudent(student);
                        setActivePage("Student Details");
                      }}
                      className="clickable-row"
                    >
                      <td>{student.name}</td>
                      <td>{student.rollNumber}</td>
                      <td>{student.branch}</td>
                      <td>{student.attendance}%</td>
                      <td>{student.assessmentScore}%</td>
                      <td>
                        <span
                          className={`risk-badge ${student.riskLevel.toLowerCase()}`}
                        >
                          {student.riskLevel}
                        </span>
                      </td>
                      <td>
                        <button
                          className="edit-student-btn"
                          onClick={() => setEditingStudent(student)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
                  {/* STUDENT DETAILS PAGE */}
          {activePage === "Student Details" && selectedStudent && (
            <>
              <button
                className="back-button"
                onClick={() => setActivePage("Students")}
              >
                ← Back to Students
              </button>

              <h1>{selectedStudent.name}</h1>
              <p className="student-subtitle">
                {selectedStudent.rollNumber} • {selectedStudent.branch}
              </p>

              <div className="details-grid">
                <div className="detail-card">
                  <span>Attendance</span>
                  <strong>{selectedStudent.attendance}%</strong>
                </div>

                <div className="detail-card">
                  <span>Current Assessment</span>
                  <strong>{selectedStudent.assessmentScore}%</strong>
                </div>

                <div className="detail-card">
                  <span>Previous Assessment</span>
                  <strong>{selectedStudent.previousScore}%</strong>
                </div>

                <div className="detail-card">
                  <span>Missing Assignments</span>
                  <strong>{selectedStudent.missingAssignments}</strong>
                </div>

                <div className="detail-card">
                  <span>Engagement</span>
                  <strong>{selectedStudent.engagement}</strong>
                </div>

                <div className="detail-card">
                  <span>Risk Level</span>
                  <strong
                    className={`risk-text ${selectedStudent.riskLevel.toLowerCase()}`}
                  >
                    {selectedStudent.riskLevel}
                  </strong>
                </div>
              </div>

              <div className="risk-reasons">
                <h2>Why is this student at this risk level?</h2>

                {selectedStudent.attendance < 60 && (
                  <p>⚠️ Attendance is below 60%, indicating a significant attendance concern.</p>
                )}

                {selectedStudent.attendance >= 60 &&
                  selectedStudent.attendance < 75 && (
                    <p>⚠️ Attendance is below the recommended level.</p>
                  )}

                {selectedStudent.assessmentScore < 50 && (
                  <p>⚠️ Assessment performance is below 50%.</p>
                )}

                {selectedStudent.assessmentScore >= 50 &&
                  selectedStudent.assessmentScore < 65 && (
                    <p>⚠️ Assessment performance requires improvement.</p>
                  )}

                {selectedStudent.assessmentScore <
                  selectedStudent.previousScore - 10 && (
                  <p>⚠️ There has been a significant decline in academic performance.</p>
                )}

                {selectedStudent.missingAssignments > 0 && (
                  <p>
                    ⚠️ {selectedStudent.missingAssignments} assignment(s) are currently
                    missing.
                  </p>
                )}

                {selectedStudent.engagement === "Low" && (
                  <p>⚠️ Low classroom engagement has been identified.</p>
                )}

                {selectedStudent.engagement === "Medium" && (
                  <p>⚠️ Moderate engagement requires monitoring.</p>
                )}

                {selectedStudent.riskLevel === "Low" && (
                  <p className="positive-message">
                    ✓ Academic indicators currently appear stable. Continue regular
                    monitoring.
                  </p>
                )}
              </div>
            </>
          )}
        {/* RISK ANALYSIS PAGE */}
{activePage === "Risk Analysis" && (
  <>
    <h1>Risk Analysis</h1>
    <p>Academic risk overview based on current student performance data.</p>

    <div className="risk-summary">
      <div className="risk-summary-card high-summary">
        <h3>High Risk</h3>
        <p>{highRisk} Students</p>
        <span>Require immediate attention</span>
      </div>

      <div className="risk-summary-card medium-summary">
        <h3>Medium Risk</h3>
        <p>{mediumRisk} Students</p>
        <span>Require regular monitoring</span>
      </div>

      <div className="risk-summary-card low-summary">
        <h3>Low Risk</h3>
        <p>{lowRisk} Students</p>
        <span>Currently performing steadily</span>
      </div>
    </div>

    {/* HIGH RISK STUDENTS */}
    <section className="risk-section">
      <h2>🔴 Students Requiring Immediate Attention</h2>

      {studentsWithRisk
        .filter((student) => student.riskLevel === "High")
        .map((student) => (
          <div className="risk-student-card" key={student.id}>
            <div>
              <h3>{student.name}</h3>
              <p>
                {student.rollNumber} • {student.branch}
              </p>
            </div>

            <div className="risk-indicators">
              {student.attendance < 60 && (
                <span>Low Attendance ({student.attendance}%)</span>
              )}

              {student.assessmentScore < 50 && (
                <span>Low Assessment ({student.assessmentScore}%)</span>
              )}

              {student.missingAssignments > 0 && (
                <span>
                  {student.missingAssignments} Missing Assignment(s)
                </span>
              )}

              {student.engagement === "Low" && (
                <span>Low Engagement</span>
              )}
            </div>

            <button
              className="view-student-button"
              onClick={() => {
                setSelectedStudent(student);
                setActivePage("Student Details");
              }}
            >
              View Student →
            </button>
          </div>
        ))}
    </section>

    {/* MEDIUM RISK STUDENTS */}
    <section className="risk-section">
      <h2>🟠 Students Requiring Monitoring</h2>

      {studentsWithRisk
        .filter((student) => student.riskLevel === "Medium")
        .map((student) => (
          <div className="risk-student-card medium-risk-card" key={student.id}>
            <div>
              <h3>{student.name}</h3>
              <p>
                {student.rollNumber} • {student.branch}
              </p>
            </div>

            <div className="risk-indicators">
              {student.attendance < 75 && (
                <span>Attendance: {student.attendance}%</span>
              )}

              {student.assessmentScore < 65 && (
                <span>Assessment: {student.assessmentScore}%</span>
              )}

              {student.engagement === "Medium" && (
                <span>Moderate Engagement</span>
              )}
            </div>

            <button
              className="view-student-button"
              onClick={() => {
                setSelectedStudent(student);
                setActivePage("Student Details");
              }}
            >
              View Student →
            </button>
          </div>
        ))}
    </section>

    {/* LOW RISK STUDENTS */}
    <section className="risk-section">
      <h2>🟢 Students Currently Stable</h2>

      {studentsWithRisk
        .filter((student) => student.riskLevel === "Low")
        .map((student) => (
          <div className="risk-student-card low-risk-card" key={student.id}>
            <div>
              <h3>{student.name}</h3>
              <p>
                {student.rollNumber} • {student.branch}
              </p>
            </div>

            <div className="risk-indicators">
              <span>Academic indicators are currently stable</span>
            </div>

            <button
              className="view-student-button"
              onClick={() => {
                setSelectedStudent(student);
                setActivePage("Student Details");
              }}
            >
              View Student →
            </button>
          </div>
        ))}
    </section>
  </>
)}

        {activePage === "Interventions" && (
  <div className="page">
    <h1>Interventions</h1>
    <p className="page-description">
      Track and manage support actions for students requiring academic attention.
    </p>

    <div className="intervention-summary">
      <div className="summary-card pending">
        <h3>Pending</h3>
        <p>
          {
            students.filter(
              (student) =>
                getRiskLevel(student) !== "Low" &&
                !interventions[student.id]
            ).length
          }
        </p>
      </div>

      <div className="summary-card progress">
        <h3>In Progress</h3>
        <p>
          {
            Object.values(interventions).filter(
              (status) => status === "In Progress"
            ).length
          }
        </p>
      </div>

      <div className="summary-card completed">
        <h3>Completed</h3>
        <p>
          {
            Object.values(interventions).filter(
              (status) => status === "Completed"
            ).length
          }
        </p>
      </div>
    </div>

    <div className="intervention-list">
      {students
        .filter((student) => getRiskLevel(student) !== "Low")
        .map((student) => {
          const status = interventions[student.id] || "Pending";
          const suggestions = getInterventionSuggestions(student);

          return (
            <div className="intervention-card" key={student.id}>
              <div className="intervention-header">
                <div>
                  <h2>{student.name}</h2>
                  <p>
                    {student.rollNumber} • {student.branch}
                  </p>
                </div>

                <span
                  className={`risk-badge ${getRiskLevel(student).toLowerCase()}`}
                >
                  {getRiskLevel(student)} Risk
                </span>
              </div>

              <div className="intervention-content">
                <div>
                  <h4>Recommended Actions</h4>

                  <ul>
                    {suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>

                <div className="intervention-status">
                  <p>
                    Status: <strong>{status}</strong>
                  </p>

                  {status === "Pending" && (
                    <button
                      onClick={() =>
                        updateInterventionStatus(
                          student.id,
                          "In Progress",
                          setInterventions
                        )
                      }
                    >
                      Start Intervention
                    </button>
                  )}

                  {status === "In Progress" && (
                    <button
                      onClick={() =>
                        updateInterventionStatus(
                          student.id,
                          "Completed",
                          setInterventions
                        )
                      }
                    >
                      Mark Completed
                    </button>
                  )}

                  {status === "Completed" && (
                    <button disabled>Completed ✓</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
    </div>
  </div>
)}

{editingStudent && (
  <div className="edit-modal-overlay">
    <div className="edit-modal">
      <h2>Edit Student Data</h2>

      <p className="edit-student-info">
        {editingStudent.name} • {editingStudent.rollNumber}
      </p>

      <div className="form-group">
        <label>Attendance (%)</label>
        <input
          type="number"
          min="0"
          max="100"
          value={editingStudent.attendance}
          onChange={(e) =>
            setEditingStudent({
              ...editingStudent,
              attendance: Number(e.target.value),
            })
          }
        />
      </div>

      <div className="form-group">
        <label>Current Assessment Score (%)</label>
        <input
          type="number"
          min="0"
          max="100"
          value={editingStudent.assessmentScore}
          onChange={(e) =>
            setEditingStudent({
              ...editingStudent,
              assessmentScore: Number(e.target.value),
            })
          }
        />
      </div>

      <div className="form-group">
        <label>Previous Assessment Score (%)</label>
        <input
          type="number"
          min="0"
          max="100"
          value={editingStudent.previousScore}
          onChange={(e) =>
            setEditingStudent({
              ...editingStudent,
              previousScore: Number(e.target.value),
            })
          }
        />
      </div>

      <div className="form-group">
        <label>Missing Assignments</label>
        <input
          type="number"
          min="0"
          value={editingStudent.missingAssignments}
          onChange={(e) =>
            setEditingStudent({
              ...editingStudent,
              missingAssignments: Number(e.target.value),
            })
          }
        />
      </div>

      <div className="edit-modal-actions">
        <button
          className="cancel-btn"
          onClick={() => setEditingStudent(null)}
        >
          Cancel
        </button>

        <button
          className="save-btn"
          onClick={() => {
            const updatedStudents = students.map((student) =>
              student.id === editingStudent.id
                ? editingStudent
                : student
            );

            setStudentData(updatedStudents);

            if (
              selectedStudent &&
              selectedStudent.id === editingStudent.id
            ) {
              setSelectedStudent(editingStudent);
            }

            setEditingStudent(null);
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}
      </main>
    </div>
  );
}

export default App;