import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { toggleFavorite, fetchUserFavorites } from '../../services/favorites';
import '../../styles/search.css';

const Search = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);

  // Fetch favorites and setup auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          await updateFavorites();
        }
      }
    );

    updateFavorites();

    return () => subscription?.unsubscribe();
  }, []);

  const updateFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setFavoriteIds([]);
        return;
      }
      
      const favorites = await fetchUserFavorites(user.id);
      setFavoriteIds(favorites);
    } catch (error) {
      console.error('Failed to update favorites:', error);
    }
  };

  // Debounced search suggestions
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, category, manufacturer')
          .or(
            `name.ilike.%${searchTerm}%`,
            `category.ilike.%${searchTerm}%`,
            `manufacturer.ilike.%${searchTerm}%`
          )
          .limit(5);

        if (error) throw error;
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

      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          category,
          manufacturer,
          versions,
          operating_systems
        `)
        .or(
          `name.ilike.%${searchTerm}%`,
          `category.ilike.%${searchTerm}%`,
          `manufacturer.ilike.%${searchTerm}%`,
          `operating_systems.ilike.%${searchTerm}%`
        );

      if (error) throw error;
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
    try {
      const { error } = await toggleFavorite(productId);
      if (error) throw error;

      // Optimistic UI update
      setFavoriteIds(prev => {
        const newFavorites = prev.includes(productId)
          ? prev.filter(id => id !== productId)
          : [...prev, productId];
        return newFavorites;
      });

      // Sync with database
      await updateFavorites();

    } catch (error) {
      console.error('Favorite error:', error);
      setError(error.message || 'Failed to update favorite');
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
                key={product.id}
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
          <div key={product.id} className="product-card">
            <div className="card-header">
              <h3>{product.name}</h3>
              <button 
                onClick={() => handleFavorite(product.id)}
                className={`favorite-btn ${
                  favoriteIds.includes(product.id) ? 'favorited' : ''
                }`}
                aria-label={favoriteIds.includes(product.id) 
                  ? "Remove from favorites" 
                  : "Add to favorites"
                }
              >
                {favoriteIds.includes(product.id) ? '★' : '☆'}
              </button>
            </div>
            <div className="product-meta">
              <span className="category">Category: {product.category}</span>
              <span className="manufacturer">Manufacturer: {product.manufacturer}</span>
              <span className="version">
                Versions: {
                  (Array.isArray(product.versions) && product.versions.length > 0)
                    ? product.versions.join(', ')
                    : 'N/A'
                }
              </span>
              <span className="os">
                OS: {
                  (Array.isArray(product.operating_systems) && product.operating_systems.length > 0)
                    ? product.operating_systems.join(', ')
                    : 'N/A'
                }
              </span>
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