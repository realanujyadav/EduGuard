import { useState, useEffect } from "react";
import "./App.css";


function getRiskLevel(student) {
  return student.riskLevel || "Low";
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

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [interventions, setInterventions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");

  const [editingStudent, setEditingStudent] = useState(null);

  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchInterventions();
  }, []);

  const fetchInterventions = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5001/api/interventions"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch interventions");
      }

      const data = await response.json();

      console.log("Fetched interventions:", data);
      setInterventions(data);
    } catch (error) {
      console.error("Error fetching interventions:", error);
    }
  };

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

  const updateInterventionStatus = async (studentId, newStatus) => {
  try {
    const response = await fetch(
      `http://127.0.0.1:5001/api/interventions/${studentId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update intervention");
    }

    const data = await response.json();

    console.log("Intervention updated:", data);

    setInterventions((currentInterventions) =>
      currentInterventions.map((intervention) =>
        intervention.studentId === studentId
          ? { ...intervention, status: newStatus }
          : intervention
      )
    );
  } catch (error) {
    console.error("Error updating intervention:", error);
    alert("Unable to update intervention. Please try again.");
  }
};

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

    {/* Summary Cards */}
    <div className="intervention-summary">
      <div className="summary-card pending">
        <h3>Pending</h3>
        <p>
          {
            interventions.filter(
              (intervention) => intervention.status === "Pending"
            ).length
          }
        </p>
      </div>

      <div className="summary-card progress">
        <h3>In Progress</h3>
        <p>
          {
            interventions.filter(
              (intervention) => intervention.status === "In Progress"
            ).length
          }
        </p>
      </div>

      <div className="summary-card completed">
        <h3>Completed</h3>
        <p>
          {
            interventions.filter(
              (intervention) => intervention.status === "Completed"
            ).length
          }
        </p>
      </div>
    </div>

    {/* Intervention Cards */}
    <div className="intervention-list">
      {interventions.map((intervention) => {
        return (
          <div
            className="intervention-card"
            key={intervention.studentId}
          >
            <div className="intervention-header">
              <div>
                <h2>{intervention.name}</h2>
                <p>
                  {intervention.rollNumber} • {intervention.branch}
                </p>
              </div>

              <span
                className={`risk-badge ${intervention.riskLevel.toLowerCase()}`}
              >
                {intervention.riskLevel} Risk
              </span>
            </div>

            <div className="intervention-content">
              <div>
                <h4>Recommended Actions</h4>

                <ul>
                  {intervention.recommendations.map(
                    (recommendation, index) => (
                      <li key={index}>{recommendation}</li>
                    )
                  )}
                </ul>
              </div>

              <div className="intervention-status">
                <p>
                  Status: <strong>{intervention.status}</strong>
                </p>

                {intervention.status === "Pending" && (
                  <button
                    onClick={() =>
                      updateInterventionStatus(intervention.studentId, "In Progress")
                    }
                  >
                    Start Intervention
                  </button>
                )}

                {intervention.status === "In Progress" && (
                  <button
                    onClick={() =>
                      updateInterventionStatus(intervention.studentId, "Completed")
                    }
                  >
                    Mark Completed
                  </button>
                )}

                {intervention.status === "Completed" && (
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
          onClick={async () => {
            try {
              const response = await fetch(
                `http://127.0.0.1:5001/api/students/${editingStudent.id}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(editingStudent),
                }
              );

              if (!response.ok) {
                throw new Error("Failed to update student");
              }

              const updatedStudent = await response.json();

              console.log("Student updated:", updatedStudent);

              setStudents((currentStudents) =>
                currentStudents.map((student) =>
                  student.id === updatedStudent.id
                    ? updatedStudent
                    : student
                )
              );

              // Refresh interventions because the student's updated
              // risk level may have created a new intervention
              await fetchInterventions();

              if (
                selectedStudent &&
                selectedStudent.id === updatedStudent.id
              ) {
                setSelectedStudent(updatedStudent);
              }

              setEditingStudent(null);
            } catch (error) {
              console.error("Error updating student:", error);
              alert("Unable to save student changes. Please try again.");
            }
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