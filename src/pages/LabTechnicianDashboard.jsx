// src/pages/LabTechnicianDashboard.js
import React, { useEffect, useState } from "react";
import { FaTachometerAlt, FaHistory, FaUser, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Hakuna haja ya useLocation tena
import Layout from "../components/Layout";

export default function LabTechnicianDashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [assignedTests, setAssignedTests] = useState([]);
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Hii ndio sehemu ya muhimu: badilisha "fetchTests" kusoma kutoka localStorage
  const fetchTests = async () => {
  setLoading(true);
  setError("");
  try {
    const token = localStorage.getItem("access_token");

    const res = await fetch("http://192.168.1.180:8000/api/technician/dashboard/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch assigned tests");

    const data = await res.json();
    console.log("Technician Dashboard API:", data);

    if (data.success && Array.isArray(data.tests)) {
      setAssignedTests(data.tests);
    } else {
      setAssignedTests([]);
    }
  } catch (err) {
    console.error("Error fetching technician tests:", err);
    setError("Failed to load assigned tests.");
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "TechnicianUser";
    setUsername(storedUsername);
    fetchTests();
  }, []); // [] ina maana hii itafanya kazi mara moja tu wakati ukurasa unafunguliwa

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
                    <th>Customer ID</th>
                    <th>Sample Code </th>
                    <th>Sample Details</th>
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
                          className={`action-btn ${test.status === "Completed" ? "completed-btn" : ""}`}
                          disabled={test.status === "Completed"}
                          onClick={() => navigate(`/submit-result/${test.id}`)}
                        >
                          <FaEdit /> {test.status === "Completed" ? "Submitted" : "Submit Result"}
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