import { Link } from 'react-router-dom';
import '../../styles/CategoryCard.css';

const CategoryCard = ({ category }) => {
  return (
    <Link 
      to={`/search?category=${category.name}`} 
      className="category-card"
    >
      <div 
        className="category-image"
        style={{ backgroundImage: `url(${category.imageUrl})` }}
      >
        <div className="category-overlay">
          <h3 className="category-title">{category.name}</h3>
          <p className="category-description">{category.description}</p>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;