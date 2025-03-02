import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { AuthCallback } from './pages/AuthCallback';
import { Profile } from './pages/Profile';
import { Leaderboard } from './pages/Leaderboard';
import { AdminPanel } from './pages/AdminPanel';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Защищенные маршруты внутри Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;