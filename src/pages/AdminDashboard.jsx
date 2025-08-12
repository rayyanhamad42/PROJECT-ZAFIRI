import React from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  // Mock data for pending tasks and statistics
  const pendingTasks = [
    { id: 1, sampleId: 'SMPL001', customer: 'John Doe', sampleType: 'Mwani', dateReceived: '2025-08-10' },
    { id: 2, sampleId: 'SMPL002', customer: 'Jane Smith', sampleType: 'Coral', dateReceived: '2025-08-11' },
  ];

  const resultsToApprove = [
    { id: 1, sampleId: 'SMPL003', technician: 'Alice Brown', status: 'Pending Approval', dateSubmitted: '2025-08-09' },
  ];

  const statistics = {
    totalSamples: 45,
    pendingTasks: 2,
    resultsApproved: 30,
    resultsPending: 1,
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Head of Department Dashboard</h1>
        <div className="user-profile">
          <span>Welcome, Dr. Ocean</span>
          <button className="logout-btn">Logout</button>
        </div>
      </header>

      <section className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Samples</h3>
          <p>{statistics.totalSamples}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Tasks</h3>
          <p>{statistics.pendingTasks}</p>
        </div>
        <div className="stat-card">
          <h3>Results Approved</h3>
          <p>{statistics.resultsApproved}</p>
        </div>
        <div className="stat-card">
          <h3>Results Pending</h3>
          <p>{statistics.resultsPending}</p>
        </div>
      </section>

      <section className="dashboard-tasks">
        <h2>Pending Tasks</h2>
        <table className="task-table">
          <thead>
            <tr>
              <th>Sample ID</th>
              <th>Customer</th>
              <th>Sample Type</th>
              <th>Date Received</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingTasks.map(task => (
              <tr key={task.id}>
                <td>{task.sampleId}</td>
                <td>{task.customer}</td>
                <td>{task.sampleType}</td>
                <td>{task.dateReceived}</td>
                <td>
                  <button className="action-btn assign-btn">Assign to Head of Division</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="dashboard-results">
        <h2>Results for Approval</h2>
        <table className="task-table">
          <thead>
            <tr>
              <th>Sample ID</th>
              <th>Technician</th>
              <th>Status</th>
              <th>Date Submitted</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {resultsToApprove.map(result => (
              <tr key={result.id}>
                <td>{result.sampleId}</td>
                <td>{result.technician}</td>
                <td>{result.status}</td>
                <td>{result.dateSubmitted}</td>
                <td>
                  <button className="action-btn approve-btn">Approve</button>
                  <button className="action-btn reject-btn">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminDashboard;