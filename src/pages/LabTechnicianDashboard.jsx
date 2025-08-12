import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LabTechnicianDashboard.css';
import logo from '../assets/zafiri.png'; // Reuse logo from login

export default function LabTechnicianDashboard() {
  const navigate = useNavigate();

  // Dummy data for demonstration (replace with backend data later)
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
    // Clear session or auth data (to be implemented)
    navigate('/'); // Redirect to login
  };

  const handleSubmitResult = (taskId) => {
    // Navigate to result submission page (to be created)
    navigate(`/test-submission/${taskId}`);
  };

  const handleViewHistory = () => {
    // Navigate to history page (to be created)
    navigate('/history');
  };

  return (
    <div className="technician-dashboard-wrapper">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <img src={logo} alt="Zafiri Logo" className="dashboard-logo" />
          <h1 className="dashboard-title">Lab Technician Dashboard</h1>
        </div>
        <div className="header-right">
          <span className="user-info">Welcome, Lab Technician</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Main Content */}
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
          <h2>Assigned Tasks</h2>
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
                  <td>{task.status}</td>
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
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <button className="quick-btn" onClick={handleViewHistory}>
            View Test History
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>&copy; 2025 Marine Laboratory Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}