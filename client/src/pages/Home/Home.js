import { useAuth } from '../../contexts/AuthContext';
import Search from '../../components/search/Search.js';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import CategoryCard from '../../components/CategoryCard/CategoryCard'; 
import '../../styles/Home.css';
import { FiUser, FiLogOut } from 'react-icons/fi';

const categories = [
  {
    id: 1,
    name: 'Cars',
    description: 'Advanced automotive software systems',
    imageUrl: '/images/cars-category.jpg'
  },
  {
    id: 2,
    name: 'Wearables',
    description: 'Smart devices and health tech',
    imageUrl: 'public/images/wearables-category.jpg'
  },
  {
    id: 3,
    name: 'Apparel',
    description: 'Smart clothing and accessories',
    imageUrl: '/images/apparel-category.jpg'
  },
  {
    id: 4,
    name: 'Home & Office',
    description: 'Smart home and office solutions',
    imageUrl: '/images/home-office-category.jpg'
  }
];

const Home = () => {
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="home-container">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">SIP FINDER</Link>
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
                {user?.user_metadata?.name || 'User'}
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

      <main className="main-content">
        <Search />
        <h2 className="categories-title">Product Categories</h2>
        <div className="categories-grid">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </main>

      <footer className="footer">
        <div className="footer-links">
          <Link to="/" className="footer-link">Home</Link>
          <Link to="/about" className="footer-link">About</Link>
          <Link to="/contact" className="footer-link">Contact</Link>
        </div>
        <p className="copyright">&copy; 2025 SIPFinder. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
