import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPlayer from 'react-player';
import '../../styles/ProductKnoweldge.css';

const CategoryKnowledge = ({ category }) => {
  const [knowledge, setKnowledge] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        const response = await axios.get(`/api/knowledge/${category}`);
        setKnowledge(response.data);
      } catch (error) {
        console.error('Knowledge fetch error:', error);
      }
    };
    
    if (category) fetchKnowledge();
  }, [category]);

  return (
    <section className="knowledge-section">
      <h2 className="section-title">{category} Research & Resources</h2>
      
      <div className="knowledge-grid">
        {knowledge.length > 0 ? (
          knowledge.map(item => (
            <article key={item.id} className="knowledge-card">
              <div className="card-content" onClick={() => setSelectedItem(item)}>
                {item.thumbnail_url && (
                  <div className="media-preview">
                    {item.content_type === 'video' ? (
                      <ReactPlayer
                        url={item.url}
                        light={item.thumbnail_url}
                        width="100%"
                        height="200px"
                      />
                    ) : (
                      <img 
                        src={item.thumbnail_url} 
                        alt={item.title}
                        className="preview-image"
                      />
                    )}
                  </div>
                )}
                <div className="card-body">
                  <h3 className="card-title">{item.title}</h3>
                  <div className="card-meta">
                    <span className="content-type">{item.content_type.replace('_', ' ')}</span>
                    <span className="date">
                      {item.published_date ? new Date(item.published_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <p>No research or resources available for {category}.</p>
        )}
      </div>

      {selectedItem && (
        <div className="knowledge-modal">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setSelectedItem(null)}>
              &times;
            </button>
            <h3 className="modal-title">{selectedItem.title}</h3>
            {selectedItem.content_type === 'video' ? (
              <ReactPlayer
                url={selectedItem.url}
                controls
                width="100%"
                height="500px"
              />
            ) : (
              <div className="text-content">
                <p className="content-text">{selectedItem.content}</p>
                <a
                  href={selectedItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="full-article-link"
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
  );
};

export default CategoryKnowledge;
