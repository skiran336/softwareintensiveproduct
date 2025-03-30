  // pages/Profile/Profile.js
  import { useAuth } from '../../contexts/AuthContext';
  
  export default function Profile() {
    const { user } = useAuth();
    return (
      <div>
        <h2>User Profile</h2>
        <p>Email: {user?.email}</p>
        {/* Add favorites list here later */}
      </div>
    );
  }