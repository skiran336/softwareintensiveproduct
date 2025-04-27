// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import PrivateRoute from './components/PrivateRoute';
import Signup from './pages/SignUp/SignUp';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import Profile from './pages/Profile/Profile'
import ComparePage from './pages/Compare/Compare';
import Favorites from './pages/Favourites/Favorites';
import Chatbot from './components/chatbot/chatbot';
import CategoryPage from './pages/Products/[category]';
import './styles/globals.css'

function App() {
  return (
    <Router>
      <AuthProvider>
      <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/compare" element={<PrivateRoute><ComparePage /></PrivateRoute>} />
          <Route path='/favourites' element= {<PrivateRoute><Favorites /></PrivateRoute>} />
          <Route path='/chat' element= {<PrivateRoute><Chatbot /></PrivateRoute>} />
          <Route 
            path="/category/:category" 
            element={
              <PrivateRoute>
                <CategoryPage />
              </PrivateRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}


export default App;