import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PredictionInsights = ({ userRole }) => {
  const [predictions, setPredictions] = useState({
    performanceTrend: [],
    recommendedSubjects: [],
    weakAreas: [],
    predictedScore: 0,
    studyTimeRecommendation: 0,
    performancePercentile: 0,
    nextExamPrediction: 0,
    learningPatternInsights: "",
    isLoading: true,
    error: null,
  });

 // Inside the useEffect hook in PredictionInsights.jsx
useEffect(() => {
  const fetchPredictions = async () => {
    try {
      console.log("Fetching predictions for role:", userRole); // Add this log
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://smartstudy-server.onrender.com/api/predictions/insights",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch prediction data");
      }

      const data = await response.json();
      console.log("Received prediction data:", data); // Add this log
      setPredictions({
        ...data,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching predictions:", error);
      setPredictions((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
    }
  };

  fetchPredictions();
}, [userRole]); // Add userRole as a dependency

  if (predictions.isLoading) {
    return <div className="card-body text-center">Loading predictions...</div>;
  }

  if (predictions.error) {
    return (
      <div className="card-body text-center text-danger">
        Error: {predictions.error}
      </div>
    );
  }

  // Sort performance trend data by date
  const sortedPerformanceTrend = [...predictions.performanceTrend].sort(
    (a, b) => {
      return new Date(a.date) - new Date(b.date);
    }
  );

  // Ensure we have today's date in the data
  const today = new Date().toISOString().split("T")[0];
  if (!sortedPerformanceTrend.some((item) => item.date === today)) {
    // If today's date is missing, interpolate between the last actual data point and the prediction
    if (sortedPerformanceTrend.length >= 2) {
      const lastActualIndex =
        sortedPerformanceTrend.findIndex((item) => item.actual === null) - 1;

      if (lastActualIndex >= 0) {
        const lastActual = sortedPerformanceTrend[lastActualIndex];
        const prediction =
          sortedPerformanceTrend[sortedPerformanceTrend.length - 1];

        const lastDate = new Date(lastActual.date);
        const predictionDate = new Date(prediction.date);
        const todayDate = new Date(today);

        const totalDays = (predictionDate - lastDate) / (1000 * 60 * 60 * 24);
        const daysPassed = (todayDate - lastDate) / (1000 * 60 * 60 * 24);
        const ratio = daysPassed / totalDays;

        const todayPredicted =
          lastActual.actual +
          (prediction.predicted - lastActual.actual) * ratio;

        // Insert today's data point at the appropriate position
        let insertIndex = sortedPerformanceTrend.findIndex(
          (item) => new Date(item.date) > todayDate
        );

        if (insertIndex === -1) insertIndex = sortedPerformanceTrend.length;

        sortedPerformanceTrend.splice(insertIndex, 0, {
          date: today,
          actual: null,
          predicted: Math.round(todayPredicted),
        });
      }
    }
  }

  // Format dates for better display
  const formattedLabels = sortedPerformanceTrend.map((item) => {
    const date = new Date(item.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  // Performance trend chart data
  const performanceTrendData = {
    labels: formattedLabels,
    datasets: [
      {
        label: "Actual Performance",
        data: sortedPerformanceTrend.map((item) => item.actual),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Predicted Performance",
        data: sortedPerformanceTrend.map((item) => item.predicted),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Performance Trend Analysis",
      },
      tooltip: {
        callbacks: {
          title: function (tooltipItems) {
            const item = tooltipItems[0];
            const date = new Date(sortedPerformanceTrend[item.dataIndex].date);
            return date.toLocaleDateString();
          },
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(1) + "%";
            } else {
              label += "No data";
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: "Score (%)",
        },
        ticks: {
          callback: function (value) {
            return value + "%";
          },
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
        },
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45
        }
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
  };

  // For teacher role, prepare notes activity chart if data exists
  let notesActivityData = null;
  let notesActivityOptions = null;

  if (userRole === 'teacher' && predictions.notesActivity && predictions.notesActivity.notesActivityTrend) {
    // Sort notes activity trend by date
    const sortedNotesActivityTrend = [...predictions.notesActivity.notesActivityTrend].sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    // Format dates for better display
    const notesActivityLabels = sortedNotesActivityTrend.map(item => {
      const date = new Date(item.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    // Notes activity chart data
    notesActivityData = {
      labels: notesActivityLabels,
      datasets: [
        {
          label: 'Notes Created',
          data: sortedNotesActivityTrend.map(item => item.count),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
        }
      ],
    };

    notesActivityOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Notes Creation Activity',
        },
        tooltip: {
          callbacks: {
            title: function(tooltipItems) {
              const item = tooltipItems[0];
              const date = new Date(sortedNotesActivityTrend[item.dataIndex].date);
              return date.toLocaleDateString();
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date'
          },
          // Ensure all dates are shown
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Notes'
          },
          ticks: {
            precision: 0 // Only show whole numbers
          }
        }
      }
    };
  }

  // Only show certain insights based on user role
  if (userRole === "student") {
    return (
      <div className="prediction-insights">
        <div className="row">
          <div className="col-md-12 mb-4">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Performance Prediction</h5>
              </div>
              <div className="card-body">
                <Line data={performanceTrendData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* <div className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">Next Exam Prediction</h5>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-center h-100">
                  <div className="text-center">
                    <div className="display-4 fw-bold text-success">
                      {predictions.nextExamPrediction}%
                    </div>
                    <p className="mt-2">Predicted score for your next exam</p>
                    <div className="mt-3">
                      <span className="badge bg-info p-2">
                        {predictions.performancePercentile}th Percentile
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
        </div>

        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">Areas to Improve</h5>
              </div>
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  {predictions.weakAreas.map((area, index) => (
                    <li
                      key={index}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      {area.name}
                      <span className="badge bg-danger rounded-pill">
                        {area.score}%
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3">
                  <small className="text-muted">
                    Focus on these areas to improve your overall performance
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">Recommended Subjects</h5>
              </div>
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  {predictions.recommendedSubjects.map((subject, index) => (
                    <li
                      key={index}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      {subject.name}
                      <span className="badge bg-primary rounded-pill">
                        {subject.relevance}%
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3">
                  <small className="text-muted">
                    Subjects that align with your strengths and interests
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-header bg-secondary text-white">
                <h5 className="mb-0">Learning Insights</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h6 className="fw-bold">Recommended Study Time</h6>
                  <div className="progress mb-2" style={{ height: "25px" }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{
                        width: `${
                          (predictions.studyTimeRecommendation / 8) * 100
                        }%`,
                      }}
                      aria-valuenow={predictions.studyTimeRecommendation}
                      aria-valuemin="0"
                      aria-valuemax="8"
                    >
                      {predictions.studyTimeRecommendation} hours/day
                    </div>
                  </div>
                </div>
                <div className="alert alert-info">
                  <i className="bi bi-lightbulb-fill me-2"></i>
                  {predictions.learningPatternInsights}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (userRole === "teacher") {
    // Teacher-specific view
    return (
      <div className="prediction-insights">
        <div className="row">
          <div className="col-md-12 mb-4">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Class Performance Predictions</h5>
              </div>
              <div className="card-body">
                <Line data={performanceTrendData} options={chartOptions} />
                <div className="alert alert-info mt-3">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  Based on current trends, {predictions.atRiskPercentage}% of students may need additional support.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Activity Chart for Teachers */}
        {notesActivityData && (
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="card">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">Notes Creation Activity</h5>
                </div>
                <div className="card-body" style={{ height: '400px' }}>
                  <Line data={notesActivityData} options={notesActivityOptions} />
                  <div className="mt-3">
                    <p><strong>Total Notes Created:</strong> {predictions.notesActivity.totalNotesCreated}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

       
      </div>
    );
  } // In the admin view section of PredictionInsights.jsx
  else {
    // Admin view
    return (
      <div className="prediction-insights">
        <div className="row">
          <div className="col-md-12 mb-4">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Institution-wide Performance Predictions</h5>
              </div>
              <div className="card-body">
                <Line data={performanceTrendData} options={chartOptions} />
                <div className="alert alert-info mt-3">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  Overall student performance is predicted to {predictions.overallTrend === 'increase' ? 'increase' : 'decrease'} by {predictions.overallChangePercentage}% in the next term.
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Department Distribution for Admins */}
        {predictions.departmentDistribution && Object.keys(predictions.departmentDistribution).length > 0 ? (
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">Department Distribution</h5>
                </div>
                <div className="card-body">
                  <div className="list-group">
                    {Object.entries(predictions.departmentDistribution).map(([dept, count], index) => (
                      <div key={index} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">{dept}</h6>
                          <span className="badge bg-primary rounded-pill">{count} students</span>
                        </div>
                        <div className="progress mt-2">
                          <div 
                            className="progress-bar bg-success" 
                            role="progressbar" 
                            style={{ width: `${Math.min(100, count * 2)}%` }}
                            aria-valuenow={count} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
  
            {/* Semester Distribution for Admins */}
            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">Semester Distribution</h5>
                </div>
                <div className="card-body">
                  <div className="list-group">
                    {Object.entries(predictions.semesterDistribution || {}).map(([semester, count], index) => (
                      <div key={index} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">Semester {semester}</h6>
                          <span className="badge bg-info rounded-pill">{count} students</span>
                        </div>
                        <div className="progress mt-2">
                          <div 
                            className="progress-bar bg-info" 
                            role="progressbar" 
                            style={{ width: `${Math.min(100, count * 2)}%` }}
                            aria-valuenow={count} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="card">
                <div className="card-body text-center">
                  <p>No department or semester data available.</p>
                </div>
              </div>
            </div>
          </div>
        )}
  
        {/* Stats Summary for Admins */}
        {predictions.stats ? (
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="card">
                <div className="card-header bg-secondary text-white">
                  <h5 className="mb-0">Platform Statistics</h5>
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-md-3 mb-3">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h3 className="text-primary">{predictions.stats.totalStudents || 0}</h3>
                          <p className="mb-0">Total Students</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h3 className="text-success">{predictions.stats.totalTeachers || 0}</h3>
                          <p className="mb-0">Total Teachers</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h3 className="text-info">{predictions.stats.totalNotes || 0}</h3>
                          <p className="mb-0">Total Notes</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h3 className="text-warning">{predictions.stats.totalExams || 0}</h3>
                          <p className="mb-0">Total Exams</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="card">
                <div className="card-body text-center">
                  <p>No statistics available.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
};

export default PredictionInsights;

