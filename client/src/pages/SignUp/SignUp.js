// src/pages/Signup/Signup.js
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/SignUp.css';

export default function Signup() {
  const[firstName, setFirstName] = useState('');
  const[lastName, setLastName] = useState('');
  const[phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  
  const { signUp, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    try {
      await signUp({ email, password, username });
      navigate('/login');
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
    <div className= "signup-background">
        <div className="signup-container">
        <h2>Create SIP Finder Account</h2>
        {error && <div className="error-message">{error}</div>}
        <form className="signup-form" onSubmit={handleSubmit}>
        <input
            type="text"
            placeholder="FirstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={loading}
            required
            />
        <input
            type="text"
            placeholder="LastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={loading}
            required
            />
        <input
            type="text"
            placeholder="PhoneNumber"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
            required
            />
            <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            required
            />
            <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            />
            <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            />
            <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
            />
            <button 
            type="submit" 
            disabled={loading}
            className={loading ? 'loading' : ''}
            >
            {loading ? 'Creating account...' : 'Sign Up'}
            </button>
        </form>
        <div className="login-link">
            Already have an account? <Link to="/login">Log in</Link>
        </div>
        </div>
    </div>
  );
}