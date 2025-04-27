import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import CategoryKnowledge from '../../components/CategoryKnoweldge/CategoryKnoweldge';
import Header from '../../components/Header/Header';
import '../../styles/category.css';

const CategoryPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("Fetching products for category:", category);

        // Normalize category (optional based on your DB structure)
        const normalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .ilike('category', `%${normalizedCategory}%`)
          .limit(5);

        if (error) throw error;

        console.log("Fetched Products:", data);
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error.message);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      setLoading(true);   
      fetchProducts();
    }
  }, [category]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="category-page">
        <h1 className="category-page-title">{category} Products</h1>

        <div className="products-grid">
          {products.length > 0 ? (
            products.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description}</p>

                  <div className="product-meta">
                    <span>
                      OS: {
                        Array.isArray(product.operating_systems)
                          ? product.operating_systems.join(', ')
                          : product.operating_systems || 'N/A'
                      }
                    </span>
                    <span>
                      Version: {product.latest_version || product.versions || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No products found for {category}.</p>
          )}
        </div>

        <CategoryKnowledge category={category} />
      </div>
    </>
  );
};

export default CategoryPage;
