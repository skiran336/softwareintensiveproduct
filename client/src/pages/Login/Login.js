import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiLogIn, FiLoader, FiEye, FiEyeOff } from 'react-icons/fi';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import '../../styles/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState(null);
  const captchaRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please complete the captcha');
      return;
    }
    try {
      await signIn({ email, password, token });
      navigate('/home');
    } catch (error) {
      console.error('Login failed:', error);
      captchaRef.current.resetCaptcha();
      setToken(null);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onVerify = (token) => {
    setToken(token);
  };

  return (
    <div className="login-background">
      <div className="login-container">
        <div className="form-header">
          <h2 className="form-title">
            <span className="gradient-text">Welcome to</span>
            <span className="brand-name">SIP Finder</span>
          </h2>
        </div>

        {error && (
          <div className="error-message animate-pop-in">
            <div className="error-icon">!</div>
            {error.message}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="animate-fade-in"
            />
            <label>Email Address</label>
          </div>

          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              className="animate-fade-in"
            />
            <label>Password</label>
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className="captcha-container">
            <HCaptcha
              sitekey={process.env.REACT_APP_HCAPTCHA_SITE_KEY}
              onVerify={onVerify}
              ref={captchaRef}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !token}
            className={`login-button ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <FiLoader className="spin-animation" />
                Authenticating...
              </>
            ) : (
              <>
                <FiLogIn />
                Continue to Dashboard
              </>
            )}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/signup" className="auth-link">
            Create New Account
          </Link>
          <Link to="/forgot-password" className="auth-link">
            Reset Password
          </Link>
        </div>
      </div>
    </div>
  );
}