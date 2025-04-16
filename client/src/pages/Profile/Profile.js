import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import '../../styles/Profile.css';
import Footer from '../../components/Footer/Footer';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState(user?.user_metadata?.username || '');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch profile data including name
  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) setName(data.name);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handlePhotoUpload = async (event) => {
    try {
      setLoading(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateUser({
        data: { 
          ...user.user_metadata,
          avatar_url: publicUrl,
          username,
          phone
        }
      });

      setAvatarUrl(publicUrl);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Update both user metadata and profiles table
      await Promise.all([
        updateUser({
          data: { 
            ...user.user_metadata,
            username,
            phone,
            avatar_url: avatarUrl
          }
        }),
        supabase
          .from('profiles')
          .update({ name })
          .eq('id', user.id)
      ]);

      setEditMode(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <Header />
      
      <div className="profile-container">
        <div className="profile-header">
          <h2 className="form-title">
            <span className="gradient-text">Profile Settings</span>
            <span className="brand-name">SIP FINDER</span>
          </h2>
          <div className="profile-actions">
            <Link to="/home" className="home-btn">
              Go to Home
            </Link>
            <button 
              className={`edit-btn ${editMode ? 'cancel' : ''}`}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="avatar-upload">
            <div className="avatar-preview">
              <img 
                src={avatarUrl || 'https://via.placeholder.com/150'} 
                alt="Avatar" 
              />
              {editMode && (
                <label className="upload-overlay">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={loading}
                  />
                  {loading ? 'Uploading...' : 'Change Photo'}
                </label>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={user?.email}
              disabled
            />
          </div>

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!editMode}
            />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={!editMode}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!editMode}
              pattern="[0-9]{10}"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          {editMode && (
            <button 
              type="submit" 
              className="save-btn"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </form>
      </div>
      <Footer />
    </div>
  );
}