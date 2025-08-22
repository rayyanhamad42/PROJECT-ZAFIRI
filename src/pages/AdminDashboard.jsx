import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "./AdminDashboard.css";
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
FaPlusSquare, // Added new import for the icon
} from "react-icons/fa";
import logo from '../assets/zafiri.png';

const AdminDashboard = () => {
const navigate = useNavigate();
const [adminName] = useState(localStorage.getItem("username") || "Administrator");
const [stats, setStats] = useState({
totalUsers: 0,
totalSamples: 0,
totalTests: 0,
totalDepartments: 0,
});
const [recentActivities, setRecentActivities] = useState([]);
const [token] = useState(localStorage.getItem("access_token"));

const overviewData = [
{ id: 1, type: 'Sample', name: 'Mwani Sample X', customer: 'Abdalla ahmad', status: 'Pending', date: '2025-08-12' },
{ id: 2, type: 'Test', name: 'Mwani Test Y', technician: 'Rayyan Kassim', status: 'Awaiting Approval', date: '2025-08-11' },
{ id: 3, type: 'User', name: 'khadija maulid', role: 'Lab Technician', status: 'Active', date: '2025-08-10' },
];

useEffect(() => {
const fetchData = async () => {
try {
// Fetch stats
const statsResponse = await fetch("http://192.168.1.180:8000/api/admin-dashboard/", {
headers: {
Authorization: `Bearer ${token}`,
"Content-Type": "application/json",
},
});
const statsData = await statsResponse.json();
console.log("Stats response:", statsData); // Debug
if (statsData.success && statsData.stats) {
setStats(statsData.stats);
} else {
console.warn("Stats API returned no data or failed:", statsData);
setStats({ totalUsers: 0, totalSamples: 0, totalTests: 0, totalDepartments: 0 });
}

const activitiesResponse = await fetch("http://192.168.1.221:8000/api/recent-activities/", {
headers: {
Authorization: `Bearer ${token}`,
"Content-Type": "application/json",
},
});
const activitiesData = await activitiesResponse.json();
console.log("Activities response:", activitiesData); // Debug
if (activitiesData.success && Array.isArray(activitiesData.recent_activities)) {
setRecentActivities(activitiesData.recent_activities);
} else {
console.warn("Recent activities API returned no data or invalid format:", activitiesData);
setRecentActivities([]);
}
} catch (error) {
console.error("Error fetching admin dashboard data:", error);
setStats({ totalUsers: 0, totalSamples: 0, totalTests: 0, totalDepartments: 0 });
setRecentActivities([]);
}
};

if (token) fetchData();
}, [token]);

const handleLogout = () => {
localStorage.removeItem("access_token");
localStorage.removeItem("username");
navigate('/');
};

const handleManageUsers = () => {
navigate('/manage-users');
};
// New handler for Add Ingredients
const handleAddIngredients = () => {
navigate('/add-ingredients');
};

const handleSystemConfig = () => {
navigate('/system-config');
};

const handleApproveAction = (id) => {
navigate(`/approve-action/${id}`);
};

const handleViewDashboard = (role) => {
const routes = {
technician: '/technician-dashboard',
hod: '/hod-dashboard',
registrar: '/registrar-dashboard',
director: '/director-dashboard',
};
navigate(`${routes[role]}?adminAccess=true`);
};

const handleViewHistory = () => {
navigate('/history');
};

return (
<div className="admin-dashboard">
<aside className="sidebar">
<div className="sidebar-header">
<img src={logo} alt="Zafiri Logo" className="sidebar-logo" />
</div>
<ul className="menu">
<li className="active"><FaTachometerAlt className="menu-icon" /> Dashboard</li>
<li onClick={() => navigate('/view-data')}><FaFlask className="menu-icon" /> View All Data</li>
<li onClick={handleManageUsers}><FaUserCog className="menu-icon" /> Manage Users</li>
{/* New sidebar item for "Add Ingredients" */}
<li onClick={handleAddIngredients}>
<FaPlusSquare className="menu-icon" /> Add Ingredients
</li>
<li onClick={() => navigate('/approve-actions')}><FaCheckCircle className="menu-icon" /> Approve/Reject Actions</li>
<li onClick={handleSystemConfig}><FaCogs className="menu-icon" /> System Configuration</li>
<li onClick={() => navigate('/dashboards')}><FaTachometerAlt className="menu-icon" /> View Dashboards</li>
</ul>
</aside>

<main className="content">
<header className="header">
<div className="header-left">
<h1>Welcome, {adminName}</h1>
<p>Empowering the Blue Economy with seamless lab operations</p>
</div>
<button className="logout-btn" onClick={handleLogout}>
<FaSignOutAlt className="btn-icon" /> Logout
</button>
</header>

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

<section className="dashboards-section">
<h2><FaTachometerAlt className="section-icon" /> Access Role-Based Dashboards</h2>
<div className="dashboard-buttons">
<button
className="quick-btn"
onClick={() => handleViewDashboard('technician')}
>
<FaFlask className="btn-icon" /> Technician Dashboard
</button>
<button
className="quick-btn"
onClick={() => handleViewDashboard('hod')}
>
<FaUsers className="btn-icon" /> Head of Department Dashboard
</button>
<button
className="quick-btn"
onClick={() => handleViewDashboard('registrar')}
>
<FaUserPlus className="btn-icon" /> Registrar Dashboard
</button>
<button
className="quick-btn"
onClick={() => handleViewDashboard('director')}
>
<FaCheckCircle className="btn-icon" /> Director Dashboard
</button>
</div>
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

<section className="quick-actions">
<h2>Quick Actions</h2>
<button className="quick-btn" onClick={handleViewHistory}>
<FaHistory className="btn-icon" /> View History
</button>
<button className="quick-btn" onClick={handleManageUsers}>
<FaUserPlus className="btn-icon" /> Add New User
</button>
<button className="quick-btn" onClick={handleSystemConfig}>
<FaCogs className="btn-icon" /> System Settings
</button>
</section>
</main>
</div>
);
};

export default AdminDashboard;