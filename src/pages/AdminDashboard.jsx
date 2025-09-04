// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import {
  FaTachometerAlt,
  FaUsers,
  FaUserCog,
  FaCheckCircle,
  FaCogs,
  FaFlask,
  FaEye,
  FaUserPlus,
  FaSignOutAlt,
  FaBuilding,
  FaHistory,
  FaPlusSquare,
} from "react-icons/fa";

const AdminDashboard = () => {
  const [adminName] = useState(localStorage.getItem("username") || "Administrator");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSamples: 0,
    totalTests: 0,
    totalDepartments: 0,
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "Technician",
    department: "",
    division: "",
  });

  const overviewData = [
    { id: 1, type: 'Sample', name: 'Mwani Sample X', customer: 'Abdalla Ahmad', status: 'Pending', date: '2025-08-12' },
    { id: 2, type: 'Test', name: 'Mwani Test Y', technician: 'Rayyan Kassim', status: 'Awaiting Approval', date: '2025-08-11' },
    { id: 3, type: 'User', name: 'Khadija Maulid', role: 'Lab Technician', status: 'Active', date: '2025-08-10' },
  ];

  // Sidebar menu items
  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/admin-dashboard" },
    { name: "Manage Users", icon: <FaUserCog />, path: "/manage-users" },
    { name: "Add Ingredients", icon: <FaPlusSquare />, path: "/add-ingredients" },
    { name: "System Config", icon: <FaCogs />, path: "/system-config" },
  ];

  useEffect(() => {
    // Mock fetching stats & recent activities
    setStats({ totalUsers: 15, totalSamples: 50, totalTests: 120, totalDepartments: 5 });
    setRecentActivities(["Sample Mwani Sample X submitted", "New user Khadija Maulid added"]);
  }, []);

  const renderContent = () => (
    <div className="dashboard-content">
     

      <section className="stats">
        <div className="stat-card ocean-gradient">
          <FaUsers className="stat-icon" />
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="stat-card ocean-gradient">
          <FaFlask className="stat-icon" />
          <h3>Total Samples</h3>
          <p>{stats.totalSamples}</p>
        </div>
        <div className="stat-card ocean-gradient">
          <FaCheckCircle className="stat-icon" />
          <h3>Total Tests</h3>
          <p>{stats.totalTests}</p>
        </div>
        <div className="stat-card ocean-gradient">
          <FaBuilding className="stat-icon" />
          <h3>Total Departments</h3>
          <p>{stats.totalDepartments}</p>
        </div>
      </section>

      <section className="overview-section">
        <h2><FaTachometerAlt className="section-icon" /> Data Overview</h2>
        <table className="overview-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Name</th>
              <th>Details</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {overviewData.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.type}</td>
                <td>{item.name}</td>
                <td>{item.customer || item.technician || item.role}</td>
                <td>{item.status}</td>
                <td>{item.date}</td>
                <td>
                  {item.status === 'Awaiting Approval' ? (
                    <button className="action-btn approve-btn">
                      <FaCheckCircle className="btn-icon" /> Approve/Reject
                    </button>
                  ) : (
                    <button className="action-btn">
                      <FaEye className="btn-icon" /> View
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="recent-activity">
        <h2><FaHistory className="section-icon" /> Recent Activities</h2>
        {recentActivities.length > 0 ? (
          <ul>
            {recentActivities.map((activity, index) => (
              <li key={index}>{activity}</li>
            ))}
          </ul>
        ) : (
          <p>No recent activities found.</p>
        )}
      </section>
    </div>
  );

  return (
    <Layout menuItems={menuItems}>
      {renderContent()}
    </Layout>
  );
};

export default AdminDashboard;
