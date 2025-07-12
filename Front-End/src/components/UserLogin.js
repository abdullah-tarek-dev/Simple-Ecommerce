import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UserLogin.css';
import { AuthContext } from './AuthContext';  //  استدعاء السياق

function UserLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);  //  استخدم دالة login من السياق

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
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      // console.log('Response from server:', data);

      if (response.ok) {
        setLoginSuccess(true);
        login(data.user, data.token);
        // console.log('User logged in:', data.user);
        navigate('/home');
      } else {
        setError(data.error || 'Invalid login credentials!');
      }
    } catch (error) {
      setError('Failed to login');
      // console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpRedirect = () => {
    navigate('/user-signup');
  };

  return (
    <div className="signin-container">
      <div className="form-box">
        <h2>User Login</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          <label htmlFor="password">Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Login'}
          </button>
        </form>

        {error && <div className="error-text">{error}</div>}
        {loginSuccess && !error && <div className="success-message">Login Successful!</div>}

        <div className="signup-link">
          <p>Don't have an account? <button onClick={handleSignUpRedirect} className="signup-btn">Sign Up</button></p>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
