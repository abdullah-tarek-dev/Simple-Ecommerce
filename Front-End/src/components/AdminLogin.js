import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminLogin.css';

function AdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoginSuccess(false);

    if (!formData.email || !formData.password) {
      setError('Email and password are required!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLoginSuccess(true);
        localStorage.setItem('token', data.token); // ← أضف هذا السطر
        setTimeout(() => navigate('/admin-panel'), 100);
      } else {
        setError(data.error || 'Invalid login credentials!');
      }
      
      
    } catch (error) {
      setError('Failed to login');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpRedirect = () => {
    navigate('/admin-signup'); // Redirect to the sign up page
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Admin Login</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email" className="input-label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
            required
          />
          <label htmlFor="password" className="input-label">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="input-field"
            required
          />
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Login'}
          </button>
        </form>
        {error && <div className="error-message">{error}</div>}
        {loginSuccess && !error && <div className="success-message">Login Successful!</div>}
        <div className="signup-redirect">
          <p className="signup-text">Don't have an account?</p>
          <button onClick={handleSignUpRedirect} className="signup-btn">Sign Up</button>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
