import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaFlask,
  FaUsers,
  FaCheckCircle,
  FaEye,
  FaSignOutAlt,
  FaFileAlt,
  FaUserPlus,
} from "react-icons/fa";
import './HeadOfDepartmentDashboard.css';
import logo from '../assets/zafiri.png';

const HeadOfDepartmentDashboard = () => {
  const navigate = useNavigate();
  const [hodName] = useState(localStorage.getItem("username") || "Head of Department");
  const [stats, setStats] = useState({
    departmentSamples: 0,
    pendingTests: 0,
    teamMembers: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [token] = useState(localStorage.getItem("access_token"));
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }

        console.log('Fetching HOD stats...');
        const statsResponse = await fetch("http://192.168.1.180:8000/api/hod-dashboard/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!statsResponse.ok) {
          throw new Error(`HOD Stats API error: ${statsResponse.status} ${statsResponse.statusText}`);
        }
        const statsData = await statsResponse.json();
        console.log("HOD Stats response:", statsData);
        if (statsData.success && statsData.stats && typeof statsData.stats === 'object') {
          setStats(statsData.stats);
        } else {
          console.warn("HOD Stats API returned no data or invalid format:", statsData);
          setStats({
            departmentSamples: 0,
            pendingTests: 0,
            teamMembers: 0,
          });
        }

        console.log('Fetching department activities...');
        const activitiesResponse = await fetch("http://192.168.1.180:8000/api/department-activities/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!activitiesResponse.ok) {
          throw new Error(`Activities API error: ${activitiesResponse.status} ${activitiesResponse.statusText}`);
        }
        const activitiesData = await activitiesResponse.json();
        console.log("Activities response:", activitiesData);
        if (activitiesData.success && Array.isArray(activitiesData.recent_activities)) {
          setRecentActivities(activitiesData.recent_activities);
        } else {
          console.warn("Recent activities API returned no data or invalid format:", activitiesData);
          setRecentActivities([]);
        }
      } catch (error) {
        console.error("Error fetching HOD dashboard data:", error);
        setError(error.message || 'Failed to load dashboard data. Please try again.');
        setStats({
          departmentSamples: 0,
          pendingTests: 0,
          teamMembers: 0,
        });
        setRecentActivities([]);
      }
    };

    if (token) {
      fetchData();
    } else {
      setError('No authentication token found. Please log in.');
      navigate('/');
    }
  }, [token, navigate]);

  const overviewData = [
    { id: 1, type: 'Sample', name: 'Coral Sample A', technician: 'John Doe', status: 'Pending', date: '2025-08-12' },
    { id: 2, type: 'Test', name: 'Water Quality Test', technician: 'Jane Smith', status: 'Awaiting Approval', date: '2025-08-11' },
    { id: 3, type: 'Sample', name: 'Algae Sample B', technician: 'Alice Brown', status: 'Completed', date: '2025-08-10' },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate('/');
  };

  const handleViewReports = () => {
    navigate('/department-reports');
  };

  const handleManageTeam = () => {
    navigate('/manage-team');
  };

  const handleApproveAction = (id) => {
    navigate(`/approve-action/${id}`);
  };

  return (
    <div className="hod-dashboard">
      {error && <p className="error-message">{error}</p>}
      <aside className="sidebar">
        <div className="logo">
          <img src={logo} alt="Zafiri Logo" className="dashboard-logo" />
          <span>Marine Lab</span>
        </div>
        <ul className="menu">
          <li className="active"><FaTachometerAlt className="menu-icon" /> Dashboard</li>
          <li onClick={() => navigate('/department-data')}><FaFlask className="menu-icon" /> Department Data</li>
          <li onClick={handleManageTeam}><FaUsers className="menu-icon" /> Manage Team</li>
          <li onClick={() => navigate('/approve-actions')}><FaCheckCircle className="menu-icon" /> Approve Actions</li>
          <li onClick={handleViewReports}><FaFileAlt className="menu-icon" /> View Reports</li>
        </ul>
      </aside>

      <main className="content">
        <header className="header">
          <div className="header-left">
            <h1>Welcome, {hodName}</h1>
            <p>Overseeing Marine Lab operations for the Blue Economy</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="btn-icon" /> Logout
          </button>
        </header>

        <section className="stats">
          <div className="stat-card ocean-gradient">
            <FaFlask className="stat-icon" />
            <h3>Department Samples</h3>
            <p>{stats.departmentSamples}</p>
          </div>
          <div className="stat-card ocean-gradient">
            <FaCheckCircle className="stat-icon" />
            <h3>Pending Tests</h3>
            <p>{stats.pendingTests}</p>
          </div>
          <div className="stat-card ocean-gradient">
            <FaUsers className="stat-icon" />
            <h3>Team Members</h3>
            <p>{stats.teamMembers}</p>
          </div>
        </section>

        <section className="overview-section">
          <h2><FaTachometerAlt className="section-icon" /> Department Overview</h2>
          <table className="overview-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Name</th>
                <th>Technician</th>
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
                  <td>{item.technician}</td>
                  <td>{item.status}</td>
                  <td>{item.date}</td>
                  <td>
                    {item.status === 'Awaiting Approval' ? (
                      <button
                        className="action-btn approve-btn"
                        onClick={() => handleApproveAction(item.id)}
                      >
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
          <h2><FaFileAlt className="section-icon" /> Recent Department Activities</h2>
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

        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <button className="quick-btn" onClick={handleViewReports}>
            <FaFileAlt className="btn-icon" /> View Reports
          </button>
          <button className="quick-btn" onClick={handleManageTeam}>
            <FaUserPlus className="btn-icon" /> Manage Team
          </button>
          <button className="quick-btn" onClick={() => navigate('/department-data')}>
            <FaFlask className="btn-icon" /> View Department Data
          </button>
        </section>
      </main>

      <footer>
        <p>&copy; 2025 Marine Laboratory Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HeadOfDepartmentDashboard;