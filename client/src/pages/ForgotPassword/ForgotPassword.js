import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import '../../styles/ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { resetPassword, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(email);
      setMessage('Check your inbox for further instructions');
    } catch (error) {
      console.error('Password reset failed:', error);
    }
  };

  return (
    <div className= "forgot-password-background">
        <div className="forgot-password-container">
        <h2>Password Reset</h2>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error.message}</div>}
        <form className="forgot-password-form" onSubmit={handleSubmit}>
            <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            />
            <button 
            type="submit" 
            disabled={loading}
            className={loading ? 'loading' : ''}
            >
            {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
        </form>
        <div className="login-link">
            Remember your password? <Link to="/login">Log in</Link>
        </div>
        </div>
    </div>
  );
}