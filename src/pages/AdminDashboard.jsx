import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import {
  FaUsers,
  FaUserCog,
  FaCheckCircle,
  FaCogs,
  FaTachometerAlt,
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
  const [token] = useState(localStorage.getItem("access_token"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats (API integration later)
        const statsResponse = await fetch("http://192.168.1.100:8000/api/admin-dashboard/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }

        // Fetch recent activities
        const activitiesResponse = await fetch("http://192.168.1.100:8000/api/recent-activities/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const activitiesData = await activitiesResponse.json();
        if (activitiesData.success) {
          setRecentActivities(activitiesData.recent_activities);
        }
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      }
    };

    if (token) fetchData();
  }, [token]);

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">Zafiri logo </div>
        <ul className="menu">
          <li className="active"><FaTachometerAlt /> Dashboard</li>
          <li><FaUsers /> View All Data</li>
          <li><FaUserCog /> Manage Users</li>
          <li><FaCheckCircle /> Approve/Reject Actions</li>
          <li><FaCogs /> System Configuration</li>
          <li><FaTachometerAlt /> View Dashboards</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="content">
        {/* Header */}
        <header className="header">
          <h1>Welcome, {adminName}</h1>
          <p>Empowering the Blue Economy with seamless lab operations</p>
        </header>

        {/* Stats Section */}
        <section className="stats">
          <div className="stat-card ocean-gradient">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>
          <div className="stat-card ocean-gradient">
            <h3>Total Samples</h3>
            <p>{stats.totalSamples}</p>
          </div>
          <div className="stat-card ocean-gradient">
            <h3>Total Tests</h3>
            <p>{stats.totalTests}</p>
          </div>
          <div className="stat-card ocean-gradient">
            <h3>Total Departments</h3>
            <p>{stats.totalDepartments}</p>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="recent-activity">
          <h2>Recent Activities</h2>
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
      </main>
    </div>
  );
};

export default AdminDashboard;
