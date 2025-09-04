import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaUser, FaCog } from "react-icons/fa"; 
import './Layout.css';
import logo from '../assets/zafiri.png';

const Layout = ({ children, menuItems = [] }) => {
  const navigate = useNavigate();
  const [username] = useState(localStorage.getItem("username") || "User");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate('/');
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src={logo} alt="Zafiri Logo" className="sidebar-logo" />
        </div>
        <ul className="menu">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={window.location.pathname === item.path ? 'active' : ''}
              onClick={() => navigate(item.path)}
            >
              {item.icon} {item.name}
            </li>
          ))}
        </ul>
      </aside>

      <div className="content">
        <header className="header">
          <div className="header-left">
            <h1>Welcome, {username}</h1>
            <p>Overseeing Marine Lab operations</p>
          </div>

          <div className="user-profile" onClick={toggleDropdown}>
            {/* The professional user icon */}
            <FaUserCircle className="user-icon" />
            {isDropdownOpen && (
              <div className="user-dropdown">
                <div className="dropdown-item">
                  <FaUser className="dropdown-icon" /> Profile
                </div>
               
                <div className="dropdown-item logout-item" onClick={handleLogout}>
                  <FaSignOutAlt className="dropdown-icon" /> Logout
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="dashboard-content">{children}</main>

        <footer className="footer">
          <p>&copy; 2025 Marine Laboratory Management System</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;