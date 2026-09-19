function calculateRisk(student) {
  let riskScore = 0;
  const riskFactors = [];

  // Attendance
  if (student.attendance < 60) {
    riskScore += 30;
    riskFactors.push("Very low attendance");
  } else if (student.attendance < 75) {
    riskScore += 15;
    riskFactors.push("Low attendance");
  }

  // Assessment score
  if (student.assessmentScore < 50) {
    riskScore += 30;
    riskFactors.push("Very low assessment score");
  } else if (student.assessmentScore < 65) {
    riskScore += 15;
    riskFactors.push("Low assessment score");
  }

  // Missing assignments
  if (student.missingAssignments >= 3) {
    riskScore += 20;
    riskFactors.push("Multiple missing assignments");
  } else if (student.missingAssignments >= 1) {
    riskScore += 10;
    riskFactors.push("Missing assignments");
  }

  // Engagement
  if (student.engagement === "Low") {
    riskScore += 15;
    riskFactors.push("Low engagement");
  } else if (student.engagement === "Medium") {
    riskScore += 5;
    riskFactors.push("Moderate engagement");
  }

  // Previous score comparison
  const scoreDifference =
    student.previousScore - student.assessmentScore;

  if (scoreDifference >= 10) {
    riskScore += 20;
    riskFactors.push("Significant decline in assessment performance");
  } else if (scoreDifference >= 5) {
    riskScore += 10;
    riskFactors.push("Declining assessment performance");
  }

  let riskLevel = "Low";

  if (riskScore >= 50) {
    riskLevel = "High";
  } else if (riskScore >= 25) {
    riskLevel = "Medium";
  }

  return {
    ...student,
    riskScore,
    riskLevel,
    riskFactors,
  };
}

function getRecommendations(student) {
  const recommendations = [];

  if (student.attendance < 75) {
    recommendations.push("Improve class attendance");
  }

  if (student.assessmentScore < 65) {
    recommendations.push("Provide additional academic support");
  }

  if (student.missingAssignments > 0) {
    recommendations.push("Complete pending assignments");
  }

  if (student.engagement === "Low") {
    recommendations.push("Schedule faculty counseling");
  }

  if (
    student.previousScore - student.assessmentScore >= 5
  ) {
    recommendations.push("Monitor declining academic performance");
  }

  if (recommendations.length === 0) {
    recommendations.push("Continue regular academic monitoring");
  }

  return recommendations;
}

module.exports = {
  calculateRisk,
  getRecommendations,
};