// src/pages/Signup/Signup.js
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/SignUp.css';

const professions = [
    'Student',
    'Software Engineer',
    'Software Manager',
    'Product Owner',
    'Product Designer',
    'Other'
  ];

export default function Signup() {
  const[firstName, setFirstName] = useState('');
  const[lastName, setLastName] = useState('');
  const[phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const [selectedProfession, setSelectedProfession] = useState('');
  const [customProfession, setCustomProfession] = useState('');
  
  const { signUp, loading, error } = useAuth();

  const handleProfessionChange = (e) => {
    setSelectedProfession(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    try {
        const fullName = `${firstName} ${lastName}`.trim();
        const finalProfession = selectedProfession === 'Other' 
        ? customProfession 
        : selectedProfession;

      if (!finalProfession) {
        throw new Error('Please select a profession');
      }
        await signUp({
            email,
            password,
            name: fullName,
            phone_number: phoneNumber,
            profession: finalProfession
          });
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
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={loading}
            required
            />
        <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={loading}
            required
            />
        <input
            type="text"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
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
            <div className="profession-section">
                <label>Please select your profession:</label>
                <div className="radio-group">
                    {professions.map((profession) => (
                    <label key={profession} className="radio-option">
                        <input
                        type="radio"
                        name="profession"
                        value={profession}
                        checked={selectedProfession === profession}
                        onChange={handleProfessionChange}
                        required
                        />
                        <span className="radio-custom"></span>
                        <span>{profession}</span>
                    </label>
                    ))}
                </div>
                
                {selectedProfession === 'Other' && (
                    <div className="custom-profession">
                    <input
                        type="text"
                        value={customProfession}
                        onChange={(e) => setCustomProfession(e.target.value)}
                        placeholder="Please specify your profession"
                        required={selectedProfession === 'Other'}
                    />
            </div>
  )}
</div>
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