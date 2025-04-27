import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ReactPlayer from 'react-player';
import PropTypes from 'prop-types';
import ErrorBoundary from '../ErrorBoundary';
import '../../styles/ProductKnowledge.css';

const CategoryKnowledge = ({ category }) => {
  const [knowledge, setKnowledge] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const validateKnowledgeItem = useCallback((item) => ({
    id: item?.id || Math.random().toString(36).slice(2, 9),
    title: item?.title || 'Untitled Resource',
    content_type: item?.content_type?.toLowerCase() || 'unknown',
    thumbnail_url: item?.thumbnail_url || '/fallback-thumbnail.jpg',
    url: item?.url || '#',
    published_date: item?.published_date || null,
    content: item?.content || ''
  }), []);

  const fetchKnowledge = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/knowledge/${category}`);
      
      const data = Array.isArray(response?.data) 
        ? response.data.map(validateKnowledgeItem)
        : [];
      
      setKnowledge(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setKnowledge([]);
    } finally {
      setLoading(false);
    }
  }, [category, validateKnowledgeItem]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadData = async () => {
      if (category && isMounted) {
        await fetchKnowledge();
      }
    };

    loadData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [fetchKnowledge, category]);

  const handleRetry = () => {
    setError(null);
    fetchKnowledge();
  };

  if (loading) {
    return (
      <div className="knowledge-loading">
        <div className="knowledge-spinner" aria-label="Loading resources"></div>
        <p>Loading {category} resources...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="knowledge-error">
        <p>Error loading resources: {error}</p>
        <button 
          onClick={handleRetry} 
          className="knowledge-retry"
          aria-label="Retry loading resources"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <section className="knowledge-section">
        <h2 className="section-title">{category} Research & Resources</h2>
        
        <div className="knowledge-grid">
          {knowledge.length > 0 ? (
            knowledge.map(item => (
              <article 
                key={item.id} 
                className="knowledge-card"
                aria-label={`Resource: ${item.title}`}
              >
                <div 
                  className="card-content" 
                  onClick={() => setSelectedItem(item)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${item.title} details`}
                >
                  {item.thumbnail_url && (
                    <div className="media-preview">
                      {item.content_type === 'video' ? (
                        <ReactPlayer
                          url={item.url}
                          light={item.thumbnail_url}
                          width="100%"
                          height="200px"
                          alt={`Video preview: ${item.title}`}
                        />
                      ) : (
                        <img 
                          src={item.thumbnail_url} 
                          alt={item.title}
                          className="preview-image"
                          loading="lazy"
                        />
                      )}
                    </div>
                  )}
                  <div className="card-body">
                    <h3 className="card-title">{item.title}</h3>
                    <div className="card-meta">
                      <span className="content-type">
                        {item.content_type.replace('_', ' ')}
                      </span>
                      <span className="date">
                        {item.published_date 
                          ? new Date(item.published_date).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="no-resources">No resources available for {category}.</p>
          )}
        </div>

        {selectedItem && (
          <div className="knowledge-modal" role="dialog" aria-modal="true">
            <div className="modal-content">
              <button 
                className="close-btn" 
                onClick={() => setSelectedItem(null)}
                aria-label="Close modal"
              >
                &times;
              </button>
              <h3 className="modal-title">{selectedItem.title}</h3>
              {selectedItem.content_type === 'video' ? (
                <ReactPlayer
                  url={selectedItem.url}
                  controls
                  width="100%"
                  height="500px"
                  aria-label={`Video player: ${selectedItem.title}`}
                />
              ) : (
                <div className="text-content">
                  <p className="content-text">{selectedItem.content}</p>
                  <a
                    href={selectedItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="full-article-link"
                    aria-label={`Open ${selectedItem.content_type}`}
                  >
                    {selectedItem.content_type === 'research_paper' 
                      ? 'Download PDF' 
                      : 'Read Full Article'}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </ErrorBoundary>
  );
};

CategoryKnowledge.propTypes = {
  category: PropTypes.string.isRequired
};

export default CategoryKnowledge;