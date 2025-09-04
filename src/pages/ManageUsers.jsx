import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import Layout from "../components/Layout";
import {
  FaUserPlus,
  FaUserEdit,
  FaTrash,
  FaArrowLeft,
  FaCheckCircle,
  FaSpinner,
  FaSave,
  FaUsers,
  FaListAlt
} from "react-icons/fa";
import "./ManageUsers.css";

const API_BASE_URL = "http://192.168.1.180:8000";

const ManageUsers = () => {
  const navigate = useNavigate();
  const userListRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "Technician",
    department: "",
    division: "",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [token] = useState(localStorage.getItem("access_token"));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUsers, setShowUsers] = useState(false); // State to toggle user list visibility

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [usersRes, deptsRes, divsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/users/`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/api/departments/`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/api/divisions/`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!usersRes.ok || !deptsRes.ok || !divsRes.ok) {
          throw new Error("Failed to fetch initial data.");
        }

        const usersData = await usersRes.json();
        const deptsData = await deptsRes.json();
        const divsData = await divsRes.json();
        
        setUsers(usersData);
        setDepartments(deptsData);
        setDivisions(divsData);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const body = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department ? parseInt(formData.department, 10) : null,
        division: formData.division ? parseInt(formData.division, 10) : null,
      };

      const response = await fetch(`${API_BASE_URL}/api/admin/add-user/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      const data = await response.json();
      setSuccess("User added successfully!");
      setUsers((prev) => [...prev, data.user]);
      setFormData({ username: "", email: "", password: "", role: "Technician", department: "", division: "" });
      setShowUsers(true);
      scrollToUserList();
    } catch (err) {
      let errorMessage = "An unknown error occurred.";
      try {
        const parsedError = JSON.parse(err.message);
        errorMessage = parsedError.message || parsedError.username?.[0] || parsedError.email?.[0] || parsedError.non_field_errors?.[0] || "Failed to add user.";
      } catch (e) { /* Fallback to generic message */ }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditClick = (user) => {
    setEditingUser(user.id);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
      department: user.department || "",
      division: user.division || "",
    });
    setShowUsers(true);
    scrollToUserList();
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const body = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        department: formData.department ? parseInt(formData.department, 10) : null,
        division: formData.division ? parseInt(formData.division, 10) : null,
      };
      if (formData.password) {
        body.password = formData.password;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/${editingUser}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      const data = await response.json();
      setSuccess("User updated successfully!");
      setUsers((prev) => prev.map((user) => (user.id === data.id ? data : user)));
      setEditingUser(null);
      setFormData({ username: "", email: "", password: "", role: "Technician", department: "", division: "" });
      scrollToUserList();
    } catch (err) {
      let errorMessage = "An unknown error occurred.";
      try {
        const parsedError = JSON.parse(err.message);
        errorMessage = parsedError.username?.[0] || parsedError.email?.[0] || parsedError.non_field_errors?.[0] || "Failed to update user.";
      } catch (e) { /* Fallback to generic message */ }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete user.");
      }

      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setSuccess("User deleted successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin-dashboard');
  };

  const toggleUserList = () => {
    setShowUsers(!showUsers);
  };

  const scrollToUserList = () => {
    userListRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getDepartmentName = (id) => {
    const dept = departments.find(d => d.id === id);
    return dept ? dept.name : 'N/A';
  };

  const getDivisionName = (id) => {
    const div = divisions.find(d => d.id === id);
    return div ? div.name : 'N/A';
  };

  return (
    <Layout menuItems={[
      { name: 'Dashboard', path: '/admin-dashboard', icon: <FaListAlt /> },
      { name: 'Add Ingredients', path: '/add-ingredients', icon: <FaUserPlus /> },
      { name: 'Manage Users', path: '/manage-users', icon: <FaUsers /> },
    ]}>
      <button className="back-btn" onClick={handleBack}>
        <FaArrowLeft /> Back to Dashboard
      </button>
      <main className="page-content">
        {error && <div className="status-message error-message"><FaCheckCircle /> {error}</div>}
        {success && <div className="status-message success-message"><FaCheckCircle /> {success}</div>}
        
        <section className="user-form-container">
          {editingUser ? (
            <form className="user-form" onSubmit={handleUpdateUser}>
              <h2><FaUserEdit /> Edit User</h2>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                required
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="New Password (optional)"
              />
              <select name="role" value={formData.role} onChange={handleInputChange} required>
                <option value="Technician">Technician</option>
                <option value="HOD">Head of Department</option>
                <option value="Registrar">Registrar</option>
                <option value="Director">Director</option>
                <option value="Admin">Admin</option>
              </select>
              <select name="department" value={formData.department} onChange={handleInputChange}>
                <option value="">Select Department (optional)</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              <select name="division" value={formData.division} onChange={handleInputChange}>
                <option value="">Select Division (optional)</option>
                {divisions.map((div) => (
                  <option key={div.id} value={div.id}>{div.name}</option>
                ))}
              </select>
              <button type="submit" className="submit-btn" disabled={loading}>
                <FaSave /> {loading ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" className="cancel-btn" onClick={() => setEditingUser(null)} disabled={loading}>
                Cancel
              </button>
            </form>
          ) : (
            <form className="user-form" onSubmit={handleAddUser}>
              <h2><FaUserPlus /> Add New User</h2>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                required
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
              />
              <select name="role" value={formData.role} onChange={handleInputChange} required>
                <option value="Technician">Technician</option>
                <option value="HOD">Head of Department</option>
                <option value="Registrar">Registrar</option>
                <option value="Director">Director</option>
                <option value="Admin">Admin</option>
              </select>
              <select name="department" value={formData.department} onChange={handleInputChange}>
                <option value="">Select Department (optional)</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              <select name="division" value={formData.division} onChange={handleInputChange}>
                <option value="">Select Division (optional)</option>
                {divisions.map((div) => (
                  <option key={div.id} value={div.id}>{div.name}</option>
                ))}
              </select>
              <button type="submit" className="submit-btn" disabled={loading}>
                <FaUserPlus /> {loading ? "Adding..." : "Add User"}
              </button>
              <button type="button" className="view-users-btn" onClick={toggleUserList}>
                <FaListAlt /> {showUsers ? "Hide User List" : "View All Users"}
              </button>
            </form>
          )}
        </section>
        
        {showUsers && (
          <section className="users-list-container" ref={userListRef}>
            <h2><FaUsers /> User List</h2>
            {loading ? (
              <div className="loading-message"><FaSpinner className="spinner" /> Loading users...</div>
            ) : users.length > 0 ? (
              <div className="table-wrapper">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Division</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{user.department_name || getDepartmentName(user.department)}</td>
                        <td>{user.division_name || getDivisionName(user.division)}</td>
                        <td style={{ padding: '30px' }}>
                          <button className="action-btn edit-btn" onClick={() => handleEditClick(user)} style={{ marginRight: '30px' }}>
                            <FaUserEdit /> Edit
                          </button>
                          <button className="action-btn delete-btn" onClick={() => handleDeleteUser(user.id)}>
                            <FaTrash /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-users-message">No users found.</p>
            )}
          </section>
        )}
      </main>
    </Layout>
  );
};

export default ManageUsers;