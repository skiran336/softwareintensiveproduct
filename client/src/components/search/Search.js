import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { toggleFavorite } from '../../services/favorites';
import '../../styles/search.css';

const Search = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);

  // Fetch user's favorites when component mounts
  useEffect(() => {
    const fetchFavorites = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);

      if (!error) {
        setFavoriteIds(data.map(fav => fav.product_id));
      }
    };

    fetchFavorites();
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const { data, error: sbError } = await supabase
          .from('products')
          .select('Id, name, category, manufacturer')
          .or(
            `name.ilike.%${searchTerm}%,` +
            `category.ilike.%${searchTerm}%,` +
            `manufacturer.ilike.%${searchTerm}%`
          )
          .limit(5);

        if (sbError) throw sbError;
        setSuggestions(data || []);
      } catch (err) {
        console.error('Suggestion error:', err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearch = async () => {
    setHasSearched(true);
    if (typeof onSearch === 'function') onSearch();
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    try {
      setLoading(true);
      setError('');

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
      setResults(data || []);
      setSuggestions([]);

    } catch (err) {
      setError('Error fetching results. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (product) => {
    setSearchTerm(product.name);
    setSuggestions([]);
    handleSearch();
  };

  const handleFavorite = async (productId) => {
    const { error } = await toggleFavorite(productId);
    if (!error) {
      setFavoriteIds(prev => prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
      );
    }
  };

  return (
    <div className="search-container">
      <h1 className="search-heading">
      Software Intensive Product Search
     </h1>
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

        {suggestions.length > 0 && (
          <ul className="suggestions-dropdown">
            {suggestions.map(product => (
              <li 
                key={product.Id} 
                onClick={() => handleSuggestionClick(product)}
              >
                {product.name} <span className="suggestion-category">({product.category})</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="results-grid">
        {results.map((product) => (
          <div key={product.Id} className="product-card">
            <div className="card-header">
              <h3>{product.name}</h3>
              <button 
                onClick={() => handleFavorite(product.Id)}
                className={`favorite-btn ${
                  favoriteIds.includes(product.Id) ? 'favorited' : ''
                }`}
                aria-label={favoriteIds.includes(product.Id) 
                  ? "Remove from favorites" 
                  : "Add to favorites"
                }
              >
                {favoriteIds.includes(product.Id) ? '★' : '☆'}
              </button>
            </div>
            <div className="product-meta">
              <span className="category">Category: {product.category}</span>
              <span className="manufacturer">Manufacturer: {product.manufacturer}</span>
              <span className="version">Version: {product.versions}</span>
              <span className="os">OS: {product.operatingSystems}</span>
            </div>
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