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
  const [isAnimating, setIsAnimating] = useState(false); // New state for animation
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsAnimating(true); // Start the animation when the button is clicked

    try {
      const response = await fetch('http://192.168.1.221:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        localStorage.setItem('username', data.user.username);

        console.log('Login successful!', data.user);

        // Wait for a brief moment (e.g., 2 seconds) before navigating to let the animation play
        setTimeout(() => {
          setIsAnimating(false); // Stop animation before navigating
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
        }, 2000); // Wait for 2 seconds (or the duration of your animation)
      } else {
        setError(data.message || 'Login failed. Please try again.');
        setIsAnimating(false); // Stop animation on error
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection.');
      setIsAnimating(false); // Stop animation on network error
    } finally {
      // The `finally` block might be a good place to stop the animation
      // if you don't want to wait for the `setTimeout`.
      // For this implementation, we will stop it inside the `setTimeout`.
      // setLoading(false); // We'll move this into the `setTimeout` as well for smoother transition
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
          <img
            src={logo}
            alt="Zafiri Logo"
            className={`logo ${isAnimating ? 'animate-rotation' : ''}`} // Conditionally apply the class
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