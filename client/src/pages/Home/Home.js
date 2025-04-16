import { Link } from 'react-router-dom';
import { useState } from 'react';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Search from '../../components/search/Search.js';
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
  return (
    <div className="home-container">
      <Header />
      
      <main className="main-content">
        <Search />
        <h2 className="categories-title">Product Categories</h2>
        <div className="categories-grid">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;