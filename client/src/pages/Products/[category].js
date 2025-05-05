import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import '../../styles/category.css';

const CategoryPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryVideos, setCategoryVideos] = useState([]);
  const [researchPapers, setResearchPapers] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('research');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('category', category)
          .limit(10);
        setProducts(productsData || []);

        const { data: videosData } = await supabase
          .from('category_videos')
          .select('*')
          .eq('category', category);
        setCategoryVideos(videosData || []);

        const { data: researchData } = await supabase
          .from('category_research')
          .select('*')
          .eq('category', category);
        setResearchPapers(researchData || []);

        const { data: communityData } = await supabase
          .from('category_community')
          .select('*')
          .eq('category', category);
        setCommunityPosts(communityData || []);

      } catch (error) {
        console.error('Error fetching category page data:', error.message);
      } finally {
        setLoading(false);
      }
    };

    if (category) fetchData();
  }, [category]);

  if (loading) return <div className="loading-state">Loading...</div>;

  return (
    <div className="category-container">
      <Header />
      <h1 className="category-header">{category} Tools & Resources</h1>

      <section className="video-section">
        <h2>Featured {category} Tutorials</h2>
        <div className="video-grid">
          {categoryVideos.map(video => (
            <div key={video.id} className="video-card">
              <iframe
                src={video.embed_url}
                title={video.title}
                className="video-player"
                allowFullScreen
              ></iframe>
              <div className="video-content">
                <h4 className="video-title">{video.title}</h4>
                <p>{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="products-section">
        <h2>Popular {category} Products</h2>
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-info">
                <h3 className="product-title">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-meta">
                  <span>Rating: ⭐ {product.rating || '4.5'}</span>
                  <span>Version: v{product.latest_version}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CategoryKnowledge category={category} />

      <section className="tab-section">
        <div className="tab-buttons">
          <button
            className={activeTab === 'research' ? 'active' : ''}
            onClick={() => setActiveTab('research')}
          >
            Research
          </button>
          <button
            className={activeTab === 'community' ? 'active' : ''}
            onClick={() => setActiveTab('community')}
          >
            Community
          </button>
        </div>

        {activeTab === 'research' && (
          <div className="tab-content">
            {researchPapers.map(paper => (
              <div key={paper.id} className="tab-card">
                <h4><a href={paper.paper_url} target="_blank" rel="noreferrer">{paper.title}</a></h4>
                <p>{paper.summary}</p>
                <small>Published: {new Date(paper.published_on).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'community' && (
          <div className="tab-content">
            {communityPosts.map(post => (
              <div key={post.id} className="tab-card">
                <h4>{post.title}</h4>
                <p>{post.description}</p>
                {post.url && <a href={post.url} target="_blank" rel="noreferrer">More info</a>}
                <small>{post.date && new Date(post.date).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default CategoryPage;