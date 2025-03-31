// pages/Profile/Profile.js
import { useState} from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { Link } from 'react-router-dom';
import '../../styles/Profile.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState(user?.user_metadata?.username || '');
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoUpload = async (event) => {
    try {
      setLoading(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user metadata
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
      await updateUser({
        data: { 
          ...user.user_metadata,
          username,
          phone,
          avatar_url: avatarUrl
        }
      });
      setEditMode(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Profile Settings</h2>
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
  );
}