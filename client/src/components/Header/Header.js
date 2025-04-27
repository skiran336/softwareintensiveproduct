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
  
  // Get avatar URL from user metadata with fallbacks
  const avatarUrl = user?.user_metadata?.avatar_url || 
                   user?.app_metadata?.avatar_url || 
                   user?.identities?.[0]?.identity_data?.avatar_url;

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
        <Link to="/home" className="logo-text">
          SIPFinder
        </Link>
        <nav className="nav-links">
          <Link to="/home" className="nav-link">Home</Link>
          <Link to="/favourites" className="nav-link">Favourites</Link>
          <Link to="/compare" className="nav-link">Compare Products</Link>
          <Link to="/chat" className="nav-link">Ask our AI Assistant !</Link>
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
              Hello {user?.user_metadata?.name || user?.email || 'User'}!
            </span>
          </div>
          
          {/* Enhanced avatar display with error handling */}
          <div className="avatar-wrapper">
            {avatarUrl ? (
              <img 
                src={avatarUrl}
                alt="Profile"
                className="user-avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.classList.add('avatar-error');
                  e.target.src = '/default-avatar.png';
                }}
              />
            ) : (
              <FaUserCircle className="user-icon" size={32} />
            )}
          </div>

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