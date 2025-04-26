// src/pages/Favorites.js
import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import '../../styles/Favorites.css'

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          product:products (
            id,
            name,
            category,
            manufacturer,
            versions,
            operating_systems
          )
        `)
        .eq('user_id', user.id);

      if (!error) setFavorites(data.map(item => item.product));
      setLoading(false);
    };

    fetchFavorites();
  }, [navigate]);

  const handleRemove = async (productId) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (!error) {
      setFavorites(prev => prev.filter(p => p.Id !== productId));
    }
  };

  if (loading) return <div>Loading favorites...</div>;

  return (
    <><Header />
    <div className="favorites-container">
      
      <h2>Your Favorites</h2>
      {favorites.length === 0 ? (
        <p>No favorites yet. Start adding from search results!</p>
      ) : (
        <div className="favorites-grid">
          {favorites.map(product => (
            <div key={product.Id} className="favorite-item">
              <h3>{product.name}</h3>
              <p>Category: {product.category}</p>
              <p>Manufacturer: {product.manufacturer}</p>
              <button 
                onClick={() => handleRemove(product.Id)}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div></>
  );
};

export default Favorites;