import React, { useState, useCallback, useMemo } from 'react';
import HomePage from '../pages/Home/Home.jsx';
import LoginPage from '../pages/Login/Login.jsx';

const AppRouter = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);

  const navigate = useCallback((page) => setCurrentPage(page), []);

  const handleLoginSuccess = useCallback((username, token) => {
    setUser({ username, token });
    setCurrentPage('home');
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setCurrentPage('login');
  }, []);

  const pageContent = useMemo(() => {
    if (user) {
      return <HomePage username={user.username} onLogout={handleLogout} />;
    }

    switch (currentPage) {
      case 'home':
        return <div className="p-10 text-center">Access denied. Please <a href="#" onClick={() => navigate('login')} className="text-indigo-600">Login</a></div>;
      case 'login':
      default:
        return <LoginPage onLoginSuccess={handleLoginSuccess} navigate={navigate} />;
    }
  }, [currentPage, user, handleLoginSuccess, handleLogout, navigate]);

  return (
    <div className="min-h-screen">
      {pageContent}
      <div className="fixed top-2 right-2 p-2 bg-indigo-100 text-indigo-800 rounded-lg shadow-md text-xs">
          Current Route: **{user ? 'Home (Protected)' : currentPage}**
      </div>
      <p className="absolute bottom-2 left-2 text-xs text-gray-400">
        Simulated Path: /src/routes/Router.jsx
      </p>
    </div>
  );
};

export default AppRouter;