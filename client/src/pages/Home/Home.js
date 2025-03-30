import { useAuth } from '../../contexts/AuthContext';
import Search from '../../components/search/Search.js';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa'; 
import '../../styles/Home.css';



const Home = () => {
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="home-container">
      {/* User Icon Container */}
      <div className="user-icon-container">
        <div className="user-icon" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <FaUserCircle size={32} />
          {/* Dropdown Menu */}
          <div className="profile-dropdown">
            <Link to="/profile" className="dropdown-item">
              View Profile
            </Link>
            <button onClick={signOut} className="dropdown-item">
              Logout
            </button>
          </div>
        </div>
        <div className="user-email">
          <p>{user?.email}</p>
        </div>
      </div>

      <Search />
    </div>
  );
};

export default Home;