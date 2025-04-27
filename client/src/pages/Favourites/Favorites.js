// src/pages/Favorites.js
import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import '../../styles/Favorites.css';

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

      if (error) {
        console.error('Fetch error:', error);
        return;
      }
      
      setFavorites(data.map(item => item.product));
      setLoading(false);
    };

    fetchFavorites();
  }, [navigate]);

  const handleRemove = async (productId) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .match({
          user_id: user.id,
          product_id: productId
        });

      if (error) throw error;
      
      setFavorites(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  if (loading) return <div>Loading favorites...</div>;

  return (
    <>
      <Header />
      <div className="favorites-container">
        <h1 className='favorite-heading'>Your Favorites</h1>
        {favorites.length === 0 ? (
          <p>No favorites yet. Start adding from search results!</p>
        ) : (
          <div className="favorites-grid">
            {favorites.map(product => (
              <div key={product.id} className="favorite-item">
                <h3>{product.name}</h3>
                <p>Category: {product.category}</p>
                <p>Manufacturer: {product.manufacturer}</p>
                <button 
                  onClick={() => handleRemove(product.id)}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Favorites;