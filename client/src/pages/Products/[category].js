import { useParams } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';
import CategoryKnowledge from '../../components/CategoryKnoweldge/CategoryKnoweldge';
import Header from '../../components/Header/Header';
import PropTypes from 'prop-types';
import '../../styles/category.css';

const CategoryPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      if (!category) {
        throw new Error('No category specified');
      }

      setLoading(true);
      setError(null);

      const normalizedCategory = category.toLowerCase().trim();

      const { data, error: queryError } = await supabase
        .from('products')
        .select('*')
        .ilike('category', `%${normalizedCategory}%`)
        .limit(5);

      if (queryError) throw queryError;

      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadData = async () => {
      if (isMounted) {
        await fetchProducts();
      }
    };

    loadData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [fetchProducts]);

  const handleRetry = () => {
    setError(null);
    fetchProducts();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" aria-label="Loading"></div>
        <p>Loading {category} products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">Error loading products: {error}</p>
        <button 
          onClick={handleRetry} 
          className="retry-button"
          aria-label="Retry loading products"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="category-page">
        <h1 className="category-page-title" aria-label={`${category} products`}>
          {category} Products
        </h1>

        <div className="products-grid">
          {products.length > 0 ? (
            products.map(product => (
              <div 
                key={product.id} 
                className="product-card"
                aria-label={`Product: ${product.name}`}
              >
                <div className="product-info">
                  <h3>{product.name || 'Unnamed Product'}</h3>
                  <p className="product-description">
                    {product.description || 'No description available'}
                  </p>

                  <div className="product-meta">
                    <span>
                      OS: {Array.isArray(product.operating_systems) 
                        ? product.operating_systems.join(', ') 
                        : product.operating_systems || 'N/A'}
                    </span>
                    <span>
                      Version: {product.latest_version || product.versions || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-products">No products found for {category}.</p>
          )}
        </div>

        <CategoryKnowledge category={category} />
      </div>
    </>
  );
};

CategoryPage.propTypes = {
  category: PropTypes.string
};

export default CategoryPage;