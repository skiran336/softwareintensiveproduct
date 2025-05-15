import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../services/supabaseClient';
import '../../styles/Compare.css';

const Compare = () => {
  const [selectedProducts, setSelectedProducts] = useState([null, null]);
  const [searchTerms, setSearchTerms] = useState(['', '']);
  const [suggestions, setSuggestions] = useState([[], []]);
  const [error, setError] = useState('');
  const skipFetchRef = useRef([false, false]);
  const comparisonRef = useRef(null); // For PDF export

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
        .select('id, name, category, manufacturer')
        .or(`name.ilike.%${term}%,category.ilike.%${term}%,manufacturer.ilike.%${term}%`)
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

  const fetchProductDetails = async (id) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  };

  const handleSelectProduct = async (index, product) => {
    try {
      const fullProduct = await fetchProductDetails(product.id);
      const newSelection = [...selectedProducts];
      newSelection[index] = fullProduct;
      setSelectedProducts(newSelection);

      const newTerms = [...searchTerms];
      newTerms[index] = fullProduct.name;
      setSearchTerms(newTerms);

      const newSuggestions = [...suggestions];
      newSuggestions[index] = [];
      setSuggestions(newSuggestions);

      skipFetchRef.current[index] = true;
      setTimeout(() => { skipFetchRef.current[index] = false; }, 500);
    } catch (error) {
      console.error('Error selecting product:', error);
    }
  };

  const handleReset = () => {
    setSelectedProducts([null, null]);
    setSearchTerms(['', '']);
    setSuggestions([[], []]);
    skipFetchRef.current = [false, false];
    setError('');
  };

  const handleExportPDF = async () => {
    if (!comparisonRef.current) return;
    const html2pdf = await import('html2pdf.js');
    const opt = {
      margin: 0.5,
      filename: `SIP_Comparison_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf.default().set(opt).from(comparisonRef.current).save();
  };

  const columnLabels = {
    name: 'Name',
    category: 'Category',
    manufacturer: 'Manufacturer',
    model_version: 'Model/Version',
    year_released: 'Year Released',
    embedded_os: 'Embedded OS',
    software_platform: 'Software Platform',
    connectivity: 'Connectivity',
    key_hardware_components: 'Hardware Components',
    ai_ml_features: 'AI/ML Features',
    ota_update_support: 'OTA Support',
    open_source_used: 'Open Source Used',
    power_source: 'Power Source',
    retail_price_usd: 'Price (USD)',
    dependencies: 'Dependencies',
    safety_compliance_certifications: 'Certifications',
    official_product_url: 'Product URL',
    app_ecosystem: 'App Ecosystem',
    third_party_review_link: 'Review Link',
    market_region: 'Region',
  };

  const renderComparison = () => {
    if (!selectedProducts[0] || !selectedProducts[1]) return null;

    return (
      <div ref={comparisonRef} className="comparison-wrapper">
        <div className="comparison-header">
          <div className="feature-column">Feature</div>
          <div className="product-column">{selectedProducts[0]?.name}</div>
          <div className="product-column">{selectedProducts[1]?.name}</div>
        </div>
        {Object.keys(columnLabels).map((key, idx) => (
          <div className="comparison-row" key={idx}>
            <div className="feature-column">{columnLabels[key]}</div>
            <div className={`product-column ${selectedProducts[0][key] !== selectedProducts[1][key] ? 'diff' : ''}`}>
              {selectedProducts[0][key] || 'N/A'}
            </div>
            <div className={`product-column ${selectedProducts[0][key] !== selectedProducts[1][key] ? 'diff' : ''}`}>
              {selectedProducts[1][key] || 'N/A'}
            </div>
          </div>
        ))}
        <div className="button-group">
          <button className="reset-btn" onClick={handleReset}>🔄 Reset Comparison</button>
          <button className="export-btn" onClick={handleExportPDF}>📄 Export to PDF</button>
        </div>
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
              />
              {suggestions[index].length > 0 && !selectedProducts[index] && (
                <ul className="suggestions-dropdown">
                  {suggestions[index].map(product => (
                    <li key={product.id} onClick={() => handleSelectProduct(index, product)}>
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
