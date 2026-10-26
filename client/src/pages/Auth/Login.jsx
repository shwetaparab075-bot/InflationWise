// client/src/pages/Auth/Login.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) newErrors.email = 'Enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log({ email, password, rememberMe });
    }
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="logo">InflationWise</div>
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to continue your financial journey with InflationWise.</p>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              {errors.email && <div className="error-msg">{errors.email}</div>}
            </div>
            <div className="form-group password-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <span className="toggle-visibility" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </div>
              {errors.password && <div className="error-msg">{errors.password}</div>}
            </div>
            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                Remember Me
              </label>
              <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
            </div>
            <button type="submit" className="primary-btn">LOGIN</button>
            <p className="bottom-link">
              Don't have an account? <Link to="/register">Create Account</Link>
            </p>
          </form>
        </div>
        <div className="auth-right">
          {/* Abstract finance illustration */}
          <svg viewBox="0 0 200 200" className="finance-visual">
            <polyline points="20,150 60,120 100,80 140,60 180,40" fill="none" stroke="#2478E8" strokeWidth="4" />
            <rect x="30" y="130" width="10" height="20" fill="#67B7FF" />
            <rect x="50" y="110" width="10" height="40" fill="#67B7FF" />
            <rect x="70" y="140" width="10" height="10" fill="#67B7FF" />
            <path d="M150,100 L190,100 A40,40 0 0,1 115,140 Z" fill="#0B2A5B" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Login;
