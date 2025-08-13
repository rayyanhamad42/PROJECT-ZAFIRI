import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LabTechnicianDashboard.css';
import logo from '../assets/zafiri.png';
import { FaUser, FaHistory, FaFileSignature, FaTachometerAlt } from 'react-icons/fa';

export default function LabTechnicianDashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedUserData = localStorage.getItem("user_data");

    if (storedUsername && storedUserData) {
      const user = JSON.parse(storedUserData);
      if (user.role === 'Technician') {
        setUsername(storedUsername);
      } else {
        // Redirect to login if the user is not a Technician
        navigate('/'); 
      }
    } else {
      // If no user data is found, redirect to login
      navigate("/");
    }
  }, [navigate]);

  const assignedTasks = [
    { id: 1, sample: 'Mwani Sample A', customer: 'John Doe', assignedDate: '2025-08-10', status: 'Pending' },
    { id: 2, sample: 'Mwani Sample B', customer: 'Jane Smith', assignedDate: '2025-08-11', status: 'In Progress' },
  ];

  const stats = {
    pending: 2,
    inProgress: 1,
    completed: 3,
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
    navigate('/');
  };

  const handleSubmitResult = (taskId) => {
    navigate(`/test-submission/${taskId}`);
  };

  const handleViewHistory = () => {
    navigate('/history');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <FaTachometerAlt />, action: () => navigate('/technician-dashboard') },
    { name: 'Submit Result', icon: <FaFileSignature />, action: () => handleSubmitResult(assignedTasks[0]?.id) },
    { name: 'View History', icon: <FaHistory />, action: handleViewHistory },
    { name: 'Profile', icon: <FaUser />, action: () => {} },
  ];

  return (
    <div className="technician-dashboard-wrapper">
      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <img src={logo} alt="Zafiri Logo" className="sidebar-logo" />
        </div>
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item, index) => (
              <li key={index} className="nav-item">
                <button className="nav-link" onClick={item.action}>
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="dashboard-header">
          <div className="header-info">
            <h1 className="welcome-message">Welcome, {username}!</h1>
          </div>
          <div className="header-meta">
            <span className="current-date">Today is Tuesday, Aug 12, 2025</span>
          </div>
        </header>

        <main className="dashboard-main">
          {/* Statistics Cards */}
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

          {/* Assigned Tasks Table */}
          <section className="tasks-section">
            <h2 className="section-title">Assigned Tasks</h2>
            <div className="table-container">
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Sample</th>
                    <th>Customer</th>
                    <th>Assigned Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedTasks.map((task) => (
                    <tr key={task.id}>
                      <td>{task.id}</td>
                      <td>{task.sample}</td>
                      <td>{task.customer}</td>
                      <td>{task.assignedDate}</td>
                      <td>
                        <span className={`status-badge ${task.status.toLowerCase().replace(' ', '-')}`}>
                          {task.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="action-btn"
                          onClick={() => handleSubmitResult(task.id)}
                        >
                          Submit Result
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}