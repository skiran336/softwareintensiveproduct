import { useAuth } from '../../contexts/AuthContext';
import Search from '../../components/search/Search.js';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import CategoryCard from '../../components/CategoryCard/CategoryCard'; 
import '../../styles/Home.css';

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
    imageUrl: '/images/wearables-category.jpg'
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
      <h2 className="categories-title">Product Categories</h2>
      <div className="categories-grid">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>

   
  );
};

export default Home;