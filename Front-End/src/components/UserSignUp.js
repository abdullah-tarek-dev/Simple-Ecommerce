import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UserSignUp.css';

function UserSignUp() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.name) {
      setError("All fields are required!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage("Registration successful! Please log in.");
        setTimeout(() => {
          navigate("/signin");
        }, 3000);
      } else {
        setError(data.error || "Something went wrong, please try again.");
      }
    } catch (err) {
      setError("Something went wrong.");
    }
  };

  return (
    <div className="signup-container">
      <div className="form">
        <h2>Create an Account</h2>
        <form onSubmit={handleSubmit} className="signup">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" name="name" placeholder="Enter your name" onChange={handleChange} value={formData.name} />

          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" placeholder="Enter your email" onChange={handleChange} value={formData.email} />

          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" placeholder="Enter your password" onChange={handleChange} value={formData.password} />

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm your password" onChange={handleChange} value={formData.confirmPassword} />

          <button type="submit" className="signup-btn">Sign Up</button>
        </form>

        {error && <p className="error-text">{error}</p>}
        {successMessage && <p className="success-text">{successMessage}</p>}

        <div className="signin-link">
          <p>Already have an account? <a href="/signin">Sign In</a></p>
        </div>
      </div>
    </div>
  );
}

export default UserSignUp;
