import { useState } from 'react';
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
      
      const response = await fetch(
        `http://localhost:4000/api/products/search?q=${encodeURIComponent(searchTerm)}`  
      );

      if (!response.ok) throw new Error('Failed to fetch results');
      
      const data = await response.json();
      setResults(data.products || []);
      
    } catch (err) {
      setError('Error fetching results. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <h1>Software Intensive Product Search</h1>
      
      <div className="search-input-group">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products (e.g., 'Tesla' or 'Thermostat')"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="results-grid">
        {results.map((product) => (
          <div key={product._id} className="product-card">
            <h3>{product.name}</h3>
            <div className="product-meta">
              <span className="category">{product.category}</span>
              <span className="manufacturer">{product.manufacturer}</span>
            </div>
            {product.components?.length > 0 && (
              <div className="components-list">
                <strong>Components:</strong>
                {product.components.map((component) => (
                  <span key={component._id}>{component.name}</span>
                ))}
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