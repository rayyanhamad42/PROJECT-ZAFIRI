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
    const [stats, setStats] = useState({ departmentSamples: 0, pendingTests: 0, teamMembers: 0 });
    const [pendingSamples, setPendingSamples] = useState([]);
    const [token] = useState(localStorage.getItem("access_token"));
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setError('');
                if (!token) throw new Error('No authentication token found. Please log in.');
                
                // CORRECTED API URL
                const response = await fetch("http://192.168.1.180:8000/api/dashboard/hod/", {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HOD Dashboard API error: ${response.status} ${errorText}`);
                }

                const data = await response.json();
                console.log("HOD Dashboard response:", data);
                
                if (data.success) {
                    // Update stats (You might need to adjust this depending on the actual backend response structure)
                    // Assuming your backend sends 'department_samples' count, 'pending_tests' count, and 'team_members' count.
                    // If not, you will need to add these counts to your backend API view.
                    setStats({
                        departmentSamples: data.department_samples.length,
                        pendingTests: data.department_samples.filter(s => s.status === 'Awaiting HOD Review').length, // This is an assumption
                        teamMembers: data.team_members_count || 0 // Assuming the backend sends this count
                    });

                    // Populate pending samples table
                    if (data.department_samples && Array.isArray(data.department_samples)) {
                        setPendingSamples(data.department_samples);
                    } else {
                        setPendingSamples([]);
                    }
                    
                    // Note: Your backend's hod_dashboard endpoint doesn't return 'recent_activities',
                    // so the corresponding section will always be empty.
                } else {
                    setError(data.message || 'Failed to load dashboard data.');
                }

            } catch (err) {
                console.error("Error fetching HOD data:", err);
                setError(err.message || 'Failed to load dashboard data. Please try again.');
                setStats({ departmentSamples: 0, pendingTests: 0, teamMembers: 0 });
                setPendingSamples([]);
            }
        };

        if (token) {
            fetchData();
        } else {
            setError('No authentication token found. Please log in.');
            navigate('/');
        }
    }, [token, navigate]);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        navigate('/');
    };

    const handleViewReports = () => navigate('/department-reports');
    const handleManageTeam = () => navigate('/manage-team');
    const handleApproveAction = (id) => navigate(`/approve-action/${id}`);
    
    // Helper function to get nested data
    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((o, key) => (o && o[key] !== undefined) ? o[key] : '', obj);
    };

    return (
        <div className="hod-dashboard">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src={logo} alt="Zafiri Logo" className="sidebar-logo" />
                </div>
                <ul className="menu">
                    <li className="active"><FaTachometerAlt /> Dashboard</li>
                    <li onClick={() => navigate('/department-data')}><FaFlask /> Department Data</li>
                    <li onClick={handleManageTeam}><FaUsers /> Manage Team</li>
                    <li onClick={() => navigate('/approve-actions')}><FaCheckCircle /> Approve Actions</li>
                    <li onClick={handleViewReports}><FaFileAlt /> View Reports</li>
                </ul>
            </aside>
            <div className="main-content">
                {error && <p className="error-message">{error}</p>}
                <header className="header">
                    <div className="header-left">
                        <h1>Welcome, {hodName}</h1>
                        <p>Overseeing Marine Lab operations</p>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <FaSignOutAlt /> Logout
                    </button>
                </header>
                <main className="dashboard-content">
                    <section className="stats">
                        <div className="stat-card"><FaFlask /> <h3>Department Samples</h3> <p>{stats.departmentSamples}</p></div>
                        <div className="stat-card"><FaCheckCircle /> <h3>Pending Tests</h3> <p>{stats.pendingTests}</p></div>
                        <div className="stat-card"><FaUsers /> <h3>Team Members</h3> <p>{stats.teamMembers}</p></div>
                    </section>
                    <section className="overview-section">
                        <h2><FaTachometerAlt /> Department Overview</h2>
                        <div className="table-wrapper">
                            <table className="overview-table">
                                <thead>
                                    <tr>
                                        <th>ID</th><th>Cust.</th><th>Phone</th><th>Email</th><th>Addr.</th>
                                        <th>Sample</th><th>Test</th><th>Ctrl No.</th><th>Status</th><th>Date</th><th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingSamples.length ? pendingSamples.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.id}</td>
                                            <td>{getNestedValue(item, 'customer.name')}</td>
                                            <td>{getNestedValue(item, 'customer.phone_number')}</td>
                                            <td>{getNestedValue(item, 'customer.email')}</td>
                                            <td>{getNestedValue(item, 'customer.address')}</td>
                                            <td>{item.sample_details}</td>
                                            <td>{item.test_type}</td> {/* This field might not exist in your backend response */}
                                            <td>{item.control_number}</td>
                                            <td>{item.status}</td>
                                            <td>{item.date_received}</td>
                                            <td>
                                                {item.status === 'Awaiting HOD Review' ? (
                                                    <button className="action-btn" onClick={() => handleApproveAction(item.id)}>
                                                        <FaCheckCircle /> Approve
                                                    </button>
                                                ) : <button className="action-btn"><FaEye /> View</button>}
                                            </td>
                                        </tr>
                                    )) : <tr><td colSpan="11">No pending samples</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </section>
                    <section className="recent-activity">
                        <h2><FaFileAlt /> Recent Activities</h2>
                        <p>No recent activities</p>
                    </section>
                    <section className="quick-actions">
                        <h2>Quick Actions</h2>
                        <div className="actions-grid">
                            <button className="quick-btn" onClick={handleViewReports}><FaFileAlt /> View Reports</button>
                            <button className="quick-btn" onClick={handleManageTeam}><FaUserPlus /> Manage Team</button>
                            <button className="quick-btn" onClick={() => navigate('/department-data')}><FaFlask /> Dept Data</button>
                        </div>
                    </section>
                </main>
                <footer className="footer">
                    <p>&copy; 2025 Marine Laboratory Management System</p>
                </footer>
            </div>
        </div>
    );
};

export default HeadOfDepartmentDashboard;