import { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import '../../styles/search.css';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setHasSearched(true);
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log(searchTerm);
      // Supabase query with OR for multiple column searches
      const { data, error: sbError } = await supabase
        .from('products')
        .select(`
          Id,
          name,
          category,
          manufacturer,
          versions,
          operatingSystems
        `)
        .or(
          `name.ilike.%${searchTerm}%,` +
          `category.ilike.%${searchTerm}%,` +
          `manufacturer.ilike.%${searchTerm}%,` +
          `operatingSystems.ilike.%${searchTerm}%`
        );

      if (sbError) throw sbError;
      console.log(data);
      setResults(data || []);
      
    } catch (err) {
      setError('Error fetching results. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <div className="search-input-group">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products (e.g., 'Tesla' or 'QNX')"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="results-grid">
        {results.map((product) => (
          <div key={product.Id} className="product-card">
            <h3>{product.name}</h3>
            <div className="product-meta">
              <span className="category">Category: {product.name}</span>
              <span className="manufacturer">Manufacturer: {product.manufacturer}</span>
              <span className="version">Version: {product.versions}</span>
              <span className="os">OS: {product.operatingSystems}</span>
            </div>
            
            {product.dependencies?.length > 0 && (
              <div className="dependencies-list">
                <strong>Dependencies:</strong>
                <div className="chips">
                  {product.dependencies.map((dep, index) => (
                    <span key={index} className="chip">{dep}</span>
                  ))}
                </div>
              </div>
            )}

            {product.components?.length > 0 && (
              <div className="components-list">
                <strong>Components:</strong>
                <ul>
                  {product.components.map((component, index) => (
                    <li key={index} className="break-words">{component}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {hasSearched && results.length === 0 && !loading && !error && (
        <p className="no-results">No products found. Try a different search term.</p>
      )}
    </div>
  );
};

export default Search;