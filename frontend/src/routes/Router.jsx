const AppRouter = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);

  const navigate = useCallback((page) => setCurrentPage(page), []);

  const handleLoginSuccess = useCallback((username, token) => {
    // In a real app, you would save the token globally/securely
    setUser({ username, token });
    setCurrentPage('home');
  }, []);

  const handleLogout = useCallback(() => {
    // In a real app, this would clear the token/session
    setUser(null);
    setCurrentPage('login');
  }, []);

  // Determine which page to render based on authentication and route
  const pageContent = useMemo(() => {
    if (user) {
      return <HomePage username={user.username} onLogout={handleLogout} />;
    }

    // Unauthenticated routes
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