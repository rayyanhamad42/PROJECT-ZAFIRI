import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../assets/zafiri.png';
import abstractBackground from '../assets/backgroundimg6.png';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsAnimating(true);

    // ---------- REAL BACKEND LOGIN ----------
    try {
      const response = await fetch('http://192.168.1.180:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store both keys so all pages work
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('user_data', JSON.stringify(data.user));
        localStorage.setItem('username', data.user.username);

        console.log('Login successful!', data.user);

        setTimeout(() => {
          setIsAnimating(false);
          const role = data.user.role;
          switch (role) {
            case 'Technician':
              navigate('/technician-dashboard');
              break;
            case 'Admin':
              navigate('/admin-dashboard');
              break;
            case 'HOD':
              navigate('/hod-dashboard');
              break;
            case 'Registrar':
              navigate('/registrar-dashboard');
              break;
            case 'Director':
            case 'Director General': // support both forms
              navigate('/director-dashboard');
              break;
            default:
              setError('User role not supported.');
          }
        }, 100);
        return; // ✅ stop here if real login succeeds
      } else {
        setError(data.message || 'Login failed. Please try again.');
        setIsAnimating(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection.');
      setIsAnimating(false);
    }

    // ---------- TEST / SIMULATED LOGIN ----------
    const testUsers = [
      { username: 'labtech', password: 'password123', role: 'Technician' },
      { username: 'admin', password: 'password123', role: 'Admin' },
      { username: 'registrar', password: 'password123', role: 'Registrar' },
      { username: 'HOD', password: 'password123', role: 'HOD' },
      { username: 'director', password: 'password123', role: 'Director' },
    ];

    const simulatedLogin = () =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          const userFound = testUsers.find(
            (u) => u.username === username && u.password === password
          );
          if (userFound) {
            resolve({
              success: true,
              tokens: { access: 'mock-access-token', refresh: 'mock-refresh-token' },
              user: userFound,
            });
          } else {
            reject({ success: false, message: 'Invalid username or password.' });
          }
        }, 1000);
      });

    try {
      const data = await simulatedLogin();

      if (data.success) {
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('user_data', JSON.stringify(data.user));
        localStorage.setItem('username', data.user.username);

        console.log('Simulated login successful!', data.user);

        setTimeout(() => {
          setIsAnimating(false);
          switch (data.user.role) {
            case 'Technician':
              navigate('/technician-dashboard');
              break;
            case 'Admin':
              navigate('/admin-dashboard');
              break;
            case 'HOD':
              navigate('/hod-dashboard');
              break;
            case 'Registrar':
              navigate('/registrar-dashboard');
              break;
            case 'Director':
              navigate('/director-dashboard');
              break;
            default:
              setError('User role not supported.');
          }
        }, 100);
      }
    } catch (err) {
      console.error('Simulated login error:', err);
      setError(err.message || 'An unexpected error occurred.');
      setIsAnimating(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-container">
        <img
          src={abstractBackground}
          alt="Abstract Blue Background"
          className="background-image"
        />
      </div>

      <div className="login-wrapper">
        <div className="login-header">
          <img
            src={logo}
            alt="Zafiri Logo"
            className={`logo ${isAnimating ? 'animate-rotation' : ''}`}
          />
          <h2 className="login-title">Login Now</h2>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
              {error}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="username">Username</label>
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="username"
                placeholder="Enter your Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon password-input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Enter your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <span
                className="password-toggle-icon"
                onClick={togglePasswordVisibility}
                style={{ cursor: 'pointer' }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </>
  );
}