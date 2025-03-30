import { useState } from 'react';
import api from '../../services/api';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await api.getProducts({ q: query });
      setResults(response.data.products);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return (
    <div className="search-container">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
      />
      <button onClick={handleSearch}>Search</button>
      
      {results.map(product => (
        <div key={product._id} className="product-card">
          <h3>{product.name}</h3>
          <p>{product.manufacturer}</p>
        </div>
      ))}
    </div>
  );
}