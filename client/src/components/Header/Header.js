import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { FiUser, FiLogOut } from 'react-icons/fi';
import '../../styles/Header.css';

const Header = () => {
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-content">
      <Link to="/" className="logo">
        <img 
            src="/images/siplogo.png" // Update with your actual image path
            alt="SIP Finder Logo"
            className="logo-image"
        />
        </Link>
        <nav className="nav-links">
          <Link to="/products" className="nav-link">Products</Link>
          <Link to="/favourites" className="nav-link">Favourites</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </nav>
      </div>

      <div className="user-info-container">
        <div 
          className="user-icon-container" 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="user-details">
            <span className="user-name">
              Welcome {user?.user_metadata?.name || 'User'}!
            </span>
          </div>
          <FaUserCircle className="user-icon" size={32} />
          
          {isDropdownOpen && (
            <div className="profile-dropdown">
              <Link to="/profile" className="dropdown-item">
                <FiUser className="dropdown-icon" /> Profile
              </Link>
              <button onClick={signOut} className="dropdown-item">
                <FiLogOut className="dropdown-icon" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;