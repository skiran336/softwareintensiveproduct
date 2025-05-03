import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../services/supabaseClient';
import '../../styles/Compare.css';

const Compare = () => {
  const [selectedProducts, setSelectedProducts] = useState([null, null]);
  const [searchTerms, setSearchTerms] = useState(['', '']);
  const [suggestions, setSuggestions] = useState([[], []]);
  const [error, setError] = useState('');
  const skipFetchRef = useRef([false, false]);

  const fetchSuggestions = useCallback(async (index) => {
    if (skipFetchRef.current[index]) return;

    const term = searchTerms[index];
    if (term.trim().length < 2) {
      const newSuggestions = [...suggestions];
      newSuggestions[index] = [];
      setSuggestions(newSuggestions);
      return;
    }

    try {
      const { data, error: sbError } = await supabase
        .from('products')
        .select('id, name, category')
        .or(
          `name.ilike.%${term}%,` +
          `category.ilike.%${term}%,` +
          `manufacturer.ilike.%${term}%`
        )
        .limit(5);

      if (sbError) throw sbError;

      const newSuggestions = [...suggestions];
      newSuggestions[index] = data || [];
      setSuggestions(newSuggestions);
    } catch (err) {
      console.error('Suggestion fetch error:', err);
    }
  }, [searchTerms, suggestions]);

  useEffect(() => {
    const debounceTimers = searchTerms.map((_, index) =>
      setTimeout(() => fetchSuggestions(index), 300)
    );

    return () => debounceTimers.forEach(timer => clearTimeout(timer));
  }, [searchTerms, fetchSuggestions]);

  const handleSelectProduct = (index, product) => {
    const newSelection = [...selectedProducts];
    newSelection[index] = product;
    setSelectedProducts(newSelection);

    const newTerms = [...searchTerms];
    newTerms[index] = product.name;
    setSearchTerms(newTerms);

    const newSuggestions = [...suggestions];
    newSuggestions[index] = [];
    setSuggestions(newSuggestions);

    skipFetchRef.current[index] = true;

    setTimeout(() => {
      skipFetchRef.current[index] = false;
    }, 500);
  };

  const handleReset = () => {
    setSelectedProducts([null, null]);
    setSearchTerms(['', '']);
    setSuggestions([[], []]);
    skipFetchRef.current = [false, false];
    setError('');
  };

  const renderComparison = () => {
    if (!selectedProducts[0] || !selectedProducts[1]) return null;

    const labels = ['Name', 'Category', 'Manufacturer', 'Versions', 'Operating Systems'];
    const keys = ['name', 'category', 'manufacturer', 'versions', 'operatingSystems'];

    return (
      <div className="comparison-wrapper">
        <div className="comparison-header">
          <div className="feature-column">Feature</div>
          <div className="product-column">{selectedProducts[0]?.name}</div>
          <div className="product-column">{selectedProducts[1]?.name}</div>
        </div>
        {keys.map((key, idx) => (
          <div className="comparison-row" key={idx}>
            <div className="feature-column">{labels[idx]}</div>
            <div className={`product-column ${selectedProducts[0][key] !== selectedProducts[1][key] ? 'diff' : ''}`}>
              {selectedProducts[0][key]}
            </div>
            <div className={`product-column ${selectedProducts[0][key] !== selectedProducts[1][key] ? 'diff' : ''}`}>
              {selectedProducts[1][key]}
            </div>
          </div>
        ))}
        <button className="reset-btn" onClick={handleReset}>🔄 Reset Comparison</button>
      </div>
    );
  };

  return (
    <div className="main-content">
      <h2>Compare Software-Intensive Products (SIPs)</h2>
      {error && <div className="error">{error}</div>}
      <div className="selection-section">
        {[0, 1].map((index) => (
          <div key={index} className="sip-selector">
            <h3>Select Product {index + 1}</h3>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search SIP..."
                value={searchTerms[index]}
                onChange={(e) => {
                  const newTerms = [...searchTerms];
                  newTerms[index] = e.target.value;
                  setSearchTerms(newTerms);
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const newSuggestions = [...suggestions];
                    newSuggestions[index] = [];
                    setSuggestions(newSuggestions);
                    skipFetchRef.current[index] = true;
                    setTimeout(() => { skipFetchRef.current[index] = false; }, 500);
                  }
                }}
              />
              {suggestions[index].length > 0 && !selectedProducts[index] && (
                <ul className="suggestions-dropdown">
                  {suggestions[index].map(product => (
                    <li key={product.Id} onClick={() => handleSelectProduct(index, product)}>
                      {product.name} <span className="suggestion-category">({product.category})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
      {renderComparison()}
    </div>
  );
};

export default Compare;