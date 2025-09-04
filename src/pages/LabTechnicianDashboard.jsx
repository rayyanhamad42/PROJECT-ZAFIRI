import React, { useEffect, useState } from "react";
import { FaTachometerAlt, FaFileSignature, FaHistory, FaUser, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function LabTechnicianDashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [assignedTests, setAssignedTests] = useState([]);
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mock fetch function
  const fetchTests = async () => {
    setLoading(true);
    setError("");
    try {
      const data = {
        success: true,
        tests: [
          { id: 1, ingredient: { name: "Test A" }, status: "Pending", sample: { control_number: "C001", customer: { name: "John" }, date_received: "2025-09-01" }, assigned_by_hod: { name: "HOD1" } },
          { id: 2, ingredient: { name: "Test B" }, status: "In Progress", sample: { control_number: "C002", customer: { name: "Jane" }, date_received: "2025-09-02" }, assigned_by_hod: { name: "HOD2" } },
        ]
      };
      setAssignedTests(data.tests);
      // Store in localStorage for TestSubmission page
      localStorage.setItem("assignedTests", JSON.stringify(data.tests));
    } catch (err) {
      setError("Failed to load assigned tests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "TechnicianUser";
    setUsername(storedUsername);
    fetchTests();
  }, []);

  useEffect(() => {
    setStats({
      pending: assignedTests.filter(t => t.status === "Pending").length,
      inProgress: assignedTests.filter(t => t.status === "In Progress").length,
      completed: assignedTests.filter(t => t.status === "Completed").length,
    });
  }, [assignedTests]);

  const menuItems = [
    { name: "Dashboard", path: "/technician-dashboard", icon: <FaTachometerAlt /> },
    { name: "View History", path: "/history", icon: <FaHistory /> },
    { name: "Profile", path: "/profile", icon: <FaUser /> },
  ];

  return (
    <Layout menuItems={menuItems}>
      <div className="dashboard-content">

        <section className="stats-section">
          <div className="stat-card">
            <h3>Pending Tasks</h3>
            <p className="stat-number">{stats.pending}</p>
          </div>
          <div className="stat-card">
            <h3>In Progress</h3>
            <p className="stat-number">{stats.inProgress}</p>
          </div>
          <div className="stat-card">
            <h3>Completed Tests</h3>
            <p className="stat-number">{stats.completed}</p>
          </div>
        </section>

        <section className="tasks-section">
          <h2 className="section-title">Assigned Tests</h2>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <div className="table-container">
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Sample</th>
                    <th>Customer</th>
                    <th>Test Type</th>
                    <th>Assigned Date</th>
                    <th>Assigned By</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedTests.map(test => (
                    <tr key={test.id}>
                      <td>{test.id}</td>
                      <td>{test.sample?.control_number || "N/A"}</td>
                      <td>{test.sample?.customer?.name || "N/A"}</td>
                      <td>{test.ingredient?.name || "N/A"}</td>
                      <td>{test.sample?.date_received || "N/A"}</td>
                      <td>{test.assigned_by_hod?.name || "N/A"}</td>
                      <td>{test.status}</td>
                      <td>
                        <button
                          className="action-btn"
                          disabled={test.status === "Completed"}
                          onClick={() => navigate(`/submit-result/${test.id}`)}
                        >
                          <FaEdit /> Submit Result
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
