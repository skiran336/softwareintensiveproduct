import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { FiUser, FiLogOut } from 'react-icons/fi';
import '../../styles/Header.css';

const Header = () => {
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userIconRef = useRef(null);

  const handleClickOutside = (event) => {
    if (
      dropdownRef.current && 
      !dropdownRef.current.contains(event.target) &&
      userIconRef.current &&
      !userIconRef.current.contains(event.target)
    ) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <img 
            src="/images/siplogo.png"
            alt="SIP Finder Logo"
            className="logo-image"
          />
        </Link>
        <nav className="nav-links">
          <Link to="/home" className="nav-link">Home</Link>
          <Link to="/favourites" className="nav-link">Favourites</Link>
          <Link to="/compare" className="nav-link">Compare Products</Link>
        </nav>
      </div>

      <div className="user-info-container">
        <div 
          ref={userIconRef}
          className="user-icon-container" 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="user-details">
            <span className="user-name">
              Hello {user?.user_metadata?.name || 'User'}!
            </span>
          </div>
          <FaUserCircle className="user-icon" size={32} />
          
          {isDropdownOpen && (
            <div ref={dropdownRef} className="profile-dropdown">
              <Link 
                to="/profile" 
                className="dropdown-item"
                onClick={() => setIsDropdownOpen(false)}
              >
                <FiUser className="dropdown-icon" /> Profile
              </Link>
              <button 
                onClick={() => {
                  signOut();
                  setIsDropdownOpen(false);
                }} 
                className="dropdown-item"
              >
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