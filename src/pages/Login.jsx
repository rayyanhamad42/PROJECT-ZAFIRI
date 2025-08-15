import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../assets/zafiri.png';
import oceanVideo from '../assets/marine video2.mp4';
import { FaUser, FaLock } from 'react-icons/fa'; 

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://192.168.1.180:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        localStorage.setItem('username', data.user.username);

        console.log('Login successful!', data.user);

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
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <video autoPlay loop muted className="video-background">
        <source src={oceanVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="login-wrapper">
        <div className="login-header">
          <img src={logo} alt="Zafiri Logo" className="logo" />
          <h2 className="login-title">Login Now</h2>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
              {error}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="username">Username </label>
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
            <label htmlFor="password">Password </label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type="password"
                id="password"
                placeholder="Enter your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
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