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
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
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
            model_version,
            year_released,
            embedded_os,
            software_platform,
            connectivity,
            key_hardware_components,
            ai_ml_features,
            ota_update_support,
            open_source_used,
            power_source,
            retail_price_usd,
            dependencies,
            safety_compliance_certifications,
            official_product_url,
            app_ecosystem,
            third_party_review_link,
            market_region
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
        .match({ user_id: user.id, product_id: productId });

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
                <p className="meta-field">Category: {product.category}</p>
                <p className="meta-field">Manufacturer: {product.manufacturer}</p>
                <p className="meta-field">Model/Version: {product.model_version}</p>
                <p className="meta-field">Year Released: {product.year_released}</p>
                <p className="meta-field">OS: {product.embedded_os}</p>
                <p className="meta-field">Retail Price: ${product.retail_price_usd}</p>
                <a
                  href={product.official_product_url}
                  target="_blank"
                  rel="noreferrer"
                  className="meta-field"
                >
                  View Product ↗
                </a>
                <button
                  onClick={() => handleRemove(product.id)}
                  className="remove-btn"
                >
                  Remove from Favorites
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