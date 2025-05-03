import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import CategoryKnowledge from '../../components/CategoryKnoweldge/CategoryKnoweldge';
import Header from '../../components/Header/Header';
import '../../styles/category.css'

const CategoryPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    console.log("Category Param:", category);
    const fetchProducts = async () => {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .limit(5);
      
          console.log("Fetched Data:", data);
          if (error) throw error;
      
          setProducts(data);
        } catch (error) {
          console.error('Error fetching products:', error.message);
        } finally {
          console.log("Finished fetching, setting loading to false");
          setLoading(false);
        }
      };
    if (category) fetchProducts();
  }, [category]);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <><Header/>
    <div className="category-page">
      
      <h1 className="category-page-title">{category} Products</h1>
      
      <div className="products-grid">
  {products.map(product => (
    <div key={product.id} className="product-card">
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>

        {/* Updated product-meta */}
        <div className="product-meta">
          <span>
            OS: {
              Array.isArray(product.operating_systems)
                ? product.operating_systems.join(', ')
                : product.operating_systems || 'N/A'
            }
          </span>
          <span>Version: {product.latest_version || product.versions || 'N/A'}</span>
        </div>

      </div>
    </div>
  ))}
</div>


      <CategoryKnowledge category={category} />
    </div>
    </>
  );
};

export default CategoryPage;